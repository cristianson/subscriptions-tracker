import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import { CreditCardIcon, Loader2 } from "lucide-react";

// Simpler login schema without complex validation
const loginSchema = z.object({
  username: z.string().nonempty("Username is required"),
  password: z.string().nonempty("Password is required"),
});

const registerSchema = loginSchema.extend({
  name: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  // Use useEffect for redirection to avoid React hook ordering issues
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

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
    // Revert to using the mutation from useAuth hook
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-zinc-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight">SubscriptionMinder</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage your subscriptions effortlessly
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-100">
              <TabsTrigger value="login" className="font-medium">Login</TabsTrigger>
              <TabsTrigger value="register" className="font-medium">Register</TabsTrigger>
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
                    className="w-full py-6 mt-2 text-md font-medium bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : "Sign In"}
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
                    className="w-full py-6 mt-2 text-md font-medium bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : "Create Account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 flex-col items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="bg-zinc-800 p-4 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-lg border border-zinc-700">
            <CreditCardIcon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4 text-white">Track Your Subscriptions</h2>
          <p className="text-lg mb-8 text-zinc-300">
            Never lose track of your subscriptions again. SubscriptionMinder helps you manage all 
            your recurring payments in one place with powerful analytics and reminders.
          </p>
          <div className="grid grid-cols-2 gap-6 text-left">
            <div className="bg-zinc-800 rounded-xl p-5 shadow-md border border-zinc-700">
              <h3 className="font-semibold mb-2 text-white">Track Expenses</h3>
              <p className="text-sm text-zinc-400">
                Monitor all your subscription costs in one dashboard.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-5 shadow-md border border-zinc-700">
              <h3 className="font-semibold mb-2 text-white">Payment Reminders</h3>
              <p className="text-sm text-zinc-400">
                Get notified before you're charged to avoid surprises.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-5 shadow-md border border-zinc-700">
              <h3 className="font-semibold mb-2 text-white">Spending Insights</h3>
              <p className="text-sm text-zinc-400">
                Analyze your subscription spending with detailed reports.
              </p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-5 shadow-md border border-zinc-700">
              <h3 className="font-semibold mb-2 text-white">Secure Access</h3>
              <p className="text-sm text-zinc-400">
                Access your subscription data securely from anywhere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}