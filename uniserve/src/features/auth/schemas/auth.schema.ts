import { z } from "zod";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "Password must be at most 72 bytes.",
  );

const email = z.string().trim().min(1, "Email is required.").email("Enter a valid email address.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    username: z.string().trim().min(3, "Username must be at least 3 characters."),
    email,
    password,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const forgotPasswordSchema = z.object({ email });

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string().min(1, "Please confirm your password.") })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
