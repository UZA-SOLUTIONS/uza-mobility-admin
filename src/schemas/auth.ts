import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().min(3).max(32).optional().or(z.literal('')),
  preferredLanguage: z.enum(['en', 'fr', 'rw']).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** Passed to NextAuth `signIn` after the API returns tokens. */
export const sessionCredentialsSchema = loginSchema.extend({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type SessionCredentialsInput = z.infer<typeof sessionCredentialsSchema>;
