import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { sendEmail } from '../services/email.service';
import { ApiError } from '../utils/api-error';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, tenant: tenantSlug } = req.body;

      // Find tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        throw new ApiError(400, 'Code SDIS invalide');
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email,
          },
        },
      });

      if (!user || !user.password) {
        throw new ApiError(401, 'Email ou mot de passe incorrect');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new ApiError(401, 'Email ou mot de passe incorrect');
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, tenantId: tenant.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, tenantId: tenant.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
      );

      // Store refresh token in Redis
      await redis.set(
        `refresh_token:${user.id}`,
        refreshToken,
        'EX',
        7 * 24 * 60 * 60 // 7 days
      );

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        tenant,
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        tenantName, 
        tenantSlug 
      } = req.body;

      // Check if tenant exists
      const existingTenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (existingTenant) {
        throw new ApiError(400, 'Ce code SDIS est déjà utilisé');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create tenant and user in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create tenant
        const tenant = await tx.tenant.create({
          data: {
            name: tenantName,
            slug: tenantSlug,
            subdomain: tenantSlug,
            features: ['FMPA', 'MESSAGING', 'AGENDA'],
          },
        });

        // Create admin user
        const user = await tx.user.create({
          data: {
            tenantId: tenant.id,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 'ADMIN',
            permissions: ['*'],
            emailVerified: new Date(),
          },
        });

        // Create subscription
        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            plan: 'FREE',
            status: 'ACTIVE',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        return { tenant, user };
      });

      // Send welcome email
      await sendEmail({
        to: email,
        subject: 'Bienvenue sur MindSP',
        template: 'welcome',
        data: {
          firstName,
          tenantName,
          loginUrl: `https://${tenantSlug}.mindsp.fr/auth/login`,
        },
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = result.user;

      res.status(201).json({
        message: 'Compte créé avec succès',
        user: userWithoutPassword,
        tenant: result.tenant,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as any;

      // Check if token exists in Redis
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new ApiError(401, 'Token invalide');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId, tenantId: decoded.tenantId },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, tenant: tenantSlug } = req.body;

      // Find tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        // Ne pas révéler si le tenant existe
        res.json({ message: 'Si un compte existe, un email a été envoyé' });
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email,
          },
        },
      });

      if (user) {
        // Generate reset token
        const resetToken = jwt.sign(
          { userId: user.id, purpose: 'reset-password' },
          process.env.JWT_SECRET!,
          { expiresIn: '1h' }
        );

        // Store token in Redis
        await redis.set(
          `reset_token:${resetToken}`,
          user.id,
          'EX',
          3600 // 1 hour
        );

        // Send reset email
        await sendEmail({
          to: email,
          subject: 'Réinitialisation de votre mot de passe',
          template: 'reset-password',
          data: {
            firstName: user.firstName,
            resetUrl: `${process.env.FRONTEND_URL}/auth/forgot-password?token=${resetToken}`,
          },
        });
      }

      res.json({ message: 'Si un compte existe, un email a été envoyé' });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      // Verify token
      const userId = await redis.get(`reset_token:${token}`);
      if (!userId) {
        throw new ApiError(400, 'Token invalide ou expiré');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      // Delete reset token
      await redis.del(`reset_token:${token}`);

      // Invalidate all sessions
      await prisma.session.deleteMany({
        where: { userId },
      });

      res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Get token from header
      const token = req.headers.authorization?.split(' ')[1];
      
      if (token) {
        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Delete refresh token from Redis
        await redis.del(`refresh_token:${decoded.userId}`);
        
        // Delete session from database
        await prisma.session.deleteMany({
          where: { 
            userId: decoded.userId,
            token,
          },
        });
      }

      res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
      // Even if error, return success
      res.json({ message: 'Déconnexion réussie' });
    }
  }
}