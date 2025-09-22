import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/db/prisma';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  tenantName: z.string().min(3),
  tenantSlug: z.string().min(3).regex(/^[a-z0-9-]+$/),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if tenant already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: data.tenantSlug },
    });

    if (existingTenant) {
      return NextResponse.json(
        { message: 'Ce code SDIS est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create tenant and admin user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.tenantName,
          slug: data.tenantSlug,
          subdomain: data.tenantSlug,
          features: ['FMPA', 'MESSAGING', 'AGENDA'],
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.ADMIN,
          permissions: ['*'], // All permissions for admin
        },
      });

      return { tenant, user };
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.user;

    return NextResponse.json({
      message: 'Compte créé avec succès',
      user: userWithoutPassword,
      tenant: result.tenant,
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}