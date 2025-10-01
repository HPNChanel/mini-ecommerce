import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "../lib/zodResolver";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "ava@storefront.dev",
      password: "password123"
    }
  });

  const handleSubmit = async (values: LoginValues) => {
    try {
      setErrorMessage(null);
      await login(values);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = (error as Error).message;
      const friendly = message && message.toLowerCase().includes("401") ? "Unable to sign in with those credentials." : message;
      setErrorMessage(friendly ?? "Unable to sign in with those credentials.");
    }
  };

  return (
    <div className="bg-slate-50">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-500">
            Use one of the demo accounts to experience the storefront:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-sm text-slate-600">
            <li>
              Customer: <code className="rounded bg-slate-100 px-2 py-1">ava@storefront.dev / password123</code>
            </li>
            <li>
              Admin: <code className="rounded bg-slate-100 px-2 py-1">elliot@storefront.dev / admin123</code>
            </li>
          </ul>
        </div>
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="mt-2" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" className="mt-2" {...form.register("password")} />
              {form.formState.errors.password ? (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.password.message}</p>
              ) : null}
            </div>
            {errorMessage ? <p className="text-xs text-red-500">{errorMessage}</p> : null}
            <Button type="submit" className="w-full rounded-full py-3" disabled={isLoading || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-500">
            Curious about the experience? <Link className="text-slate-900 underline" to="/catalog">Browse as guest</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
