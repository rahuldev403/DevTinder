import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/api/auth";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await register(form);
      navigate("/onboarding");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your profile"
      description="Start matching with developers who share your goals."
      footer={
        <p className="font-mono text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="border-b-2 border-primary font-bold text-primary hover:bg-primary/10"
            to="/login"
          >
            Sign in →
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name" className="font-mono font-bold text-foreground">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
            className="border-4 border-border font-mono shadow-md"
          />
        </div>
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
            autoComplete="new-password"
            placeholder="At least 6 chars"
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
          {isSubmitting ? "Creating..." : "Create account →"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default Register;
