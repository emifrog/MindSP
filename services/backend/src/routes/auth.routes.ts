import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();
const authController = new AuthController();

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('tenant').isLength({ min: 3 }),
  ],
  validateRequest,
  authController.login
);

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
    body('firstName').isLength({ min: 2 }),
    body('lastName').isLength({ min: 2 }),
    body('tenantName').isLength({ min: 3 }),
    body('tenantSlug').matches(/^[a-z0-9-]+$/),
  ],
  validateRequest,
  authController.register
);

// Refresh token
router.post(
  '/refresh',
  [body('refreshToken').isJWT()],
  validateRequest,
  authController.refreshToken
);

// Forgot password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
    body('tenant').isLength({ min: 3 }),
  ],
  validateRequest,
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').isLength({ min: 20 }),
    body('password').isStrongPassword(),
  ],
  validateRequest,
  authController.resetPassword
);

// Logout
router.post('/logout', authController.logout);

export default router;