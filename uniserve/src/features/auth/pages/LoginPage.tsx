import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/FormField";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_HOME_PATH } from "@/lib/constants";
import { getErrorMessage } from "@/lib/api-client";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../hooks/useAuth";
import { loginSchema, type LoginValues } from "../schemas/auth.schema";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.username}.`);
      await navigate({ to: ROLE_HOME_PATH[user.role] });
    } catch (error) {
      setError("root", { message: getErrorMessage(error, "Unable to sign in.") });
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use your UniServe account to continue."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Create an account
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
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
