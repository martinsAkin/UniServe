import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/FormField";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import { AuthShell } from "../components/AuthShell";
import {
  forgotPasswordSchema,
  otpSchema,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type OtpValues,
  type ResetPasswordValues,
} from "../schemas/auth.schema";

type Step =
  { name: "email" } | { name: "otp"; email: string } | { name: "reset"; resetToken: string };

const STEP_COPY = {
  email: {
    title: "Reset your password",
    subtitle: "Enter your account email and we will send a 6-digit code.",
  },
  otp: { title: "Check your email", subtitle: "Enter the 6-digit code. It expires in 10 minutes." },
  reset: {
    title: "Choose a new password",
    subtitle: "Pick a strong password you have not used before.",
  },
} as const;

function EmailStep({ onSent }: { onSent: (email: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordValues) => authService.forgotPassword(values.email),
    onSuccess: (_, values) => onSent(values.email),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="space-y-5"
      noValidate
    >
      {mutation.isError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger"
        >
          {getErrorMessage(mutation.error)}
        </p>
      )}
      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </FormField>
      <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
        Send code
      </Button>
    </form>
  );
}

function OtpStep({
  email,
  onVerified,
}: {
  email: string;
  onVerified: (resetToken: string) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });

  const mutation = useMutation({
    mutationFn: (values: OtpValues) => authService.verifyOtp(email, values.otp),
    onSuccess: (response) => onVerified(response.resetToken),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="space-y-5"
      noValidate
    >
      <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-ink-soft">
        If an account exists for <span className="font-medium text-ink">{email}</span>, a code has
        been sent.
      </p>
      {mutation.isError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger"
        >
          {getErrorMessage(mutation.error)}
        </p>
      )}
      <FormField id="otp" label="Verification code" error={errors.otp?.message}>
        <Input
          id="otp"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          aria-invalid={!!errors.otp}
          className="tracking-[0.4em]"
          {...register("otp")}
        />
      </FormField>
      <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
        Verify code
      </Button>
    </form>
  );
}

function ResetStep({ resetToken }: { resetToken: string }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      authService.resetPassword(resetToken, values.password),
    onSuccess: async () => {
      toast.success("Password changed. Please sign in.");
      await navigate({ to: "/login" });
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="space-y-5"
      noValidate
    >
      {mutation.isError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger"
        >
          {getErrorMessage(mutation.error)}
        </p>
      )}
      <FormField
        id="password"
        label="New password"
        error={errors.password?.message}
        hint="At least 8 characters."
      >
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
      </FormField>
      <FormField
        id="confirmPassword"
        label="Confirm new password"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
      </FormField>
      <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
        <CheckCircle2 className="size-4" aria-hidden /> Change password
      </Button>
    </form>
  );
}

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>({ name: "email" });
  const copy = STEP_COPY[step.name];

  return (
    <AuthShell
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {step.name === "email" && <EmailStep onSent={(email) => setStep({ name: "otp", email })} />}
      {step.name === "otp" && (
        <OtpStep
          email={step.email}
          onVerified={(resetToken) => setStep({ name: "reset", resetToken })}
        />
      )}
      {step.name === "reset" && <ResetStep resetToken={step.resetToken} />}
    </AuthShell>
  );
}
