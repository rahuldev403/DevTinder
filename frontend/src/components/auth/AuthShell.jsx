import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AuthShell = ({ title, description, children, footer }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
        <Card className="w-full border-4 border-primary shadow-2xl">
          <CardHeader className="space-y-2 border-b-4 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <img
              src="/codecrush-text.png"
              alt="CodeCrush"
              className="mb-2 h-12 w-auto"
              style={{ imageRendering: "pixelated" }}
            />
            <CardTitle className="font-mono text-2xl font-bold">
              {title}
            </CardTitle>
            <CardDescription className="font-mono text-sm">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {children}
            {footer ? (
              <div className="border-t-2 border-border pt-4">{footer}</div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthShell;
