import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/api/auth";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue matching with developers."
      footer={
        <p className="font-mono text-sm text-muted-foreground">
          New here?{" "}
          <Link
            className="border-b-2 border-primary font-bold text-primary hover:bg-primary/10"
            to="/register"
          >
            Create an account →
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="font-mono font-bold text-foreground"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@domain.com"
            value={form.email}
            onChange={handleChange}
            required
            className="border-4 border-border font-mono shadow-md"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="font-mono font-bold text-foreground"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
            className="border-4 border-border font-mono shadow-md"
          />
        </div>
        {error ? (
          <div className="border-4 border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive shadow-lg">
            ⚠ {error}
          </div>
        ) : null}
        <Button
          className="w-full border-4 border-border font-mono text-base font-bold shadow-lg hover:shadow-xl hover:translate-x-[-1px] hover:translate-y-[-1px]"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in →"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default Login;
