import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/FormField";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api-client";
import { ROLE_HOME_PATH } from "@/lib/constants";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../hooks/useAuth";
import { registerSchema, type RegisterValues } from "../schemas/auth.schema";

export function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async ({ username, email, password }: RegisterValues) => {
    try {
      const user = await registerAccount({ username, email, password });
      toast.success("Account created. Welcome to UniServe.");
      await navigate({ to: ROLE_HOME_PATH[user.role] });
    } catch (error) {
      setError("root", { message: getErrorMessage(error, "Unable to create your account.") });
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register as a student or staff member to report maintenance issues."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {errors.root && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger"
          >
            {errors.root.message}
          </p>
        )}
        <FormField id="username" label="Username" error={errors.username?.message}>
          <Input
            id="username"
            autoComplete="username"
            aria-invalid={!!errors.username}
            {...register("username")}
          />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>
        <FormField
          id="password"
          label="Password"
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
          label="Confirm password"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </FormField>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
