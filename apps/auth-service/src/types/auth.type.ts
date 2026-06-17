import { UserRole } from '../generated/prisma-client';
import { Request } from 'express';

export type PayloadType = {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  expiresAt: Date | string;
  createdAt: string | Date;
};

export interface RequestAuth extends Request {
  user: PayloadType;
}
