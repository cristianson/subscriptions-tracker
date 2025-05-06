import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCardIcon } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
    },
  });

  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  const onRegisterSubmit = (values: RegisterValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">SubscriptionMinder</h1>
            <p className="text-muted-foreground mt-2">
              Manage your subscriptions in one place
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  {loginMutation.error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {loginMutation.error.message || "Login failed. Please try again."}
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  {registerMutation.error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {registerMutation.error.message || "Registration failed. Please try again."}
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 flex-col items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="bg-primary/10 p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
            <CreditCardIcon className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Track Your Subscriptions</h2>
          <p className="text-lg mb-6">
            Never lose track of your subscriptions again. SubscriptionMinder helps you manage all 
            your recurring payments in one place with powerful analytics and reminders.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Track Expenses</h3>
              <p className="text-sm text-muted-foreground">
                Monitor all your subscription costs in one dashboard.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Payment Reminders</h3>
              <p className="text-sm text-muted-foreground">
                Get notified before you're charged to avoid surprises.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Spending Insights</h3>
              <p className="text-sm text-muted-foreground">
                Analyze your subscription spending with detailed reports.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Secure Access</h3>
              <p className="text-sm text-muted-foreground">
                Access your subscription data securely from anywhere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}