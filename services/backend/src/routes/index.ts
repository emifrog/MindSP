import { Express } from 'express';
import authRoutes from './auth.routes';
import fmpaRoutes from './fmpa.routes';
import userRoutes from './user.routes';
import messageRoutes from './message.routes';
import notificationRoutes from './notification.routes';
import tenantRoutes from './tenant.routes';

export function setupRoutes(app: Express) {
  // API v1 routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/fmpa', fmpaRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/messages', messageRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/tenants', tenantRoutes);
}