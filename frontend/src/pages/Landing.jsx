import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b-4 border-primary bg-card shadow-lg">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <img
            src="/codecrush-text.png"
            alt="CodeCrush"
            className="h-8 w-auto"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button
                variant="outline"
                className="border-4 border-border font-mono font-bold shadow-md"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="border-4 border-border font-mono font-bold shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full space-y-12">
          {/* Main Hero */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            {/* Hero Logo */}
            <div className="flex-shrink-0">
              <img
                src="/codecursh.png"
                alt="CodeCrush"
                className="h-64 sm:h-80 w-auto"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            {/* Hero Text */}
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-block border-4 border-accent bg-accent/20 px-4 py-2 font-mono text-sm font-bold text-accent-foreground shadow-md">
                🚀 Find Your Dev Match
              </div>
              <h1 className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
                Connect with <span className="text-primary">Developers</span>
              </h1>
              <p className="font-mono text-lg text-muted-foreground leading-relaxed">
                Swipe, match, and collaborate with developers who share your
                passion. Build projects, learn together, and grow your network.
              </p>
              <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 pt-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="border-4 border-border font-mono text-lg font-bold shadow-xl w-full"
                  >
                    Join CodeCrush →
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="border-4 border-border font-mono text-lg font-bold shadow-lg w-full"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-4 border-primary shadow-xl">
              <CardContent className="p-6 space-y-3 text-center">
                <div className="text-5xl">🎯</div>
                <h3 className="font-mono text-lg font-bold text-foreground">
                  Smart Matching
                </h3>
                <p className="font-mono text-sm text-muted-foreground">
                  AI-powered compatibility scoring based on skills and interests
                </p>
              </CardContent>
            </Card>

            <Card className="border-4 border-primary shadow-xl">
              <CardContent className="p-6 space-y-3 text-center">
                <div className="text-5xl">💫</div>
                <h3 className="font-mono text-lg font-bold text-foreground">
                  Real-time Chat
                </h3>
                <p className="font-mono text-sm text-muted-foreground">
                  Collaborate instantly with matched developers on projects
                </p>
              </CardContent>
            </Card>

            <Card className="border-4 border-primary shadow-xl">
              <CardContent className="p-6 space-y-3 text-center">
                <div className="text-5xl">👥</div>
                <h3 className="font-mono text-lg font-bold text-foreground">
                  Build Together
                </h3>
                <p className="font-mono text-sm text-muted-foreground">
                  Find teammates for hackathons, side projects, and more
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <Card className="border-4 border-accent bg-gradient-to-br from-accent/10 to-primary/5 shadow-xl">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="font-mono text-2xl font-bold text-foreground">
                Ready to find your dev match?
              </h2>
              <p className="font-mono text-sm text-muted-foreground">
                Join thousands of developers building amazing things together
              </p>
              <Link to="/register">
                <Button
                  size="lg"
                  className="border-4 border-border font-mono text-lg font-bold shadow-xl"
                >
                  Create Free Account →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-primary bg-card shadow-lg">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 CodeCrush. Connect • Collaborate • Code
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
