import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Invalid email address' })
  .max(255, { message: 'Email must be less than 255 characters' });

export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Name is required' })
  .max(100, { message: 'Name must be less than 100 characters' });

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  .optional();

export const messageSchema = z
  .string()
  .trim()
  .min(1, { message: 'Message is required' })
  .max(10000, { message: 'Message must be less than 10,000 characters' });

export const subjectSchema = z
  .string()
  .trim()
  .min(1, { message: 'Subject is required' })
  .max(200, { message: 'Subject must be less than 200 characters' });

export const urlSchema = z
  .string()
  .url({ message: 'Invalid URL format' })
  .max(2048, { message: 'URL must be less than 2048 characters' })
  .optional();

// Contact form validation schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: messageSchema,
});

// Email notification schema
export const emailNotificationSchema = z.object({
  subject: subjectSchema,
  message: messageSchema,
  userIds: z.array(z.string().uuid()).min(1, { message: 'At least one recipient is required' }),
});

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '');
};

// Validate and sanitize user input for email content
export const validateAndSanitizeEmailContent = (subject: string, message: string) => {
  const result = emailNotificationSchema.pick({ subject: true, message: true }).safeParse({
    subject,
    message,
  });

  if (!result.success) {
    throw new Error(result.error.errors[0]?.message || 'Validation failed');
  }

  return {
    subject: sanitizeHtml(result.data.subject),
    message: sanitizeHtml(result.data.message),
  };
};
