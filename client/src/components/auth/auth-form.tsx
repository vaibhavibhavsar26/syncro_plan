import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const registerSchema = z.object({
  fullName: z.string().min(3, {
    message: "Full name must be at least 3 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  userType: z.string({
    required_error: "Please select a user type",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthForm({ defaultTab = "login" }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      userType: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onError: (error) => {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      },
      onSuccess: () => {
        window.location.href = "/dashboard";
      },
    });
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    registerMutation.mutate(
      {
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        userType: data.userType,
      },
      {
        onError: (error) => {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive",
          });
        },
        onSuccess: () => {
          // After registration, automatically attempt to log in with the same credentials
          toast({
            title: "Registration successful",
            description: "Your account has been created. Please log in with your credentials.",
            variant: "default",
          });
          
          // Reset register form
          registerForm.reset();
          
          // Switch to login tab after successful registration
          setActiveTab("login");
          
          // Pre-fill username field in login form 
          loginForm.setValue("username", data.username);
          
          // Focus on password field for convenience
          setTimeout(() => {
            const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
            if (passwordInput) passwordInput.focus();
          }, 100);
        },
      }
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login" className="mt-6">
        <div className="space-y-2 mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Login to SyncroPlan</h2>
          <p className="text-muted-foreground">
            Enter your credentials to sign in to your account
          </p>
        </div>
        
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <FormField
              control={loginForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
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
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <a href="#" className="text-xs text-primary hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <button
            onClick={() => setActiveTab("register")}
            className="text-primary hover:underline"
          >
            Register here
          </button>
        </div>
      </TabsContent>
      
      <TabsContent value="register" className="mt-6">
        <div className="space-y-2 mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Create Your SyncroPlan Account</h2>
          <p className="text-muted-foreground">
            Enter your details to create a new account
          </p>
        </div>
        
        <Form {...registerForm}>
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
            <FormField
              control={registerForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Choose a username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                    </SelectContent>
                  </Select>
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <button
            onClick={() => setActiveTab("login")}
            className="text-primary hover:underline"
          >
            Login here
          </button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
