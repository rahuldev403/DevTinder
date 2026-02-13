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
        <Card className="w-full">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
            {footer}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthShell;
