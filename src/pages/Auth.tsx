import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        setIsRoleLoading(true);
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching user role:", error);
            toast({
              title: "Error",
              variant: "destructive",
            });
            setUserRole("user");
            return;
          }

          setUserRole(data?.role || "user");
        } catch (err) {
          console.error("Error fetching user role:", err);
          toast({
            title: "Error",
            variant: "destructive",
          });
          setUserRole("user");
        } finally {
          setIsRoleLoading(false);
        }
      } else {
        setUserRole(null);
        setHasRedirected(false);
      }
    };

    fetchUserRole();
  }, [user, toast]);

  useEffect(() => {
    if (user && userRole && !hasRedirected) {
      const isOnAdminDashboard = location.pathname.startsWith("/admin");
      const isOnDashboard = location.pathname.startsWith("/dashboard");

      if (userRole === "super_admin" && !isOnAdminDashboard) {
        setHasRedirected(true);
        setError("");
        setSuccess("");
        navigate("/admin");
      } else if (
        (userRole === "admin" || userRole === "strategy_creator" || userRole === "user") &&
        !isOnDashboard
      ) {
        setHasRedirected(true);
        setError("");
        setSuccess("");
        navigate("/dashboard");
      }
    }
  }, [user, userRole, navigate, location.pathname, hasRedirected]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        setSuccess("Please check your email to confirm your account");
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess("Password reset instructions sent to your email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Welcome to Traderama
          </CardTitle>
          <CardDescription className="text-center">
            {user ? (
              userRole === "super_admin"
                ? "Super Admin Dashboard"
                : userRole === "admin"
                ? "Admin Dashboard"
                : userRole === "strategy_creator"
                ? "Strategy Creator Dashboard"
                : "User Dashboard"
            ) : isSignUp ? (
              "Create your account"
            ) : (
              "Sign in to your account"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && userRole === "super_admin" && !location.pathname.startsWith("/admin") && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Welcome, Super Admin! Access your dashboard to oversee platform activities.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 gap-2">
                <Button onClick={() => navigate("/admin")} className="w-full">
                  Go to Super Admin Dashboard
                </Button>
                <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                  Go to Home Page
                </Button>
              </div>
            </div>
          )}

          {user && userRole === "admin" && !location.pathname.startsWith("/dashboard") && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Welcome, Admin! Access your dashboard to monitor platform activities.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 gap-2">
                <Button onClick={() => navigate("/dashboard")} className="w-full">
                  Go to Admin Dashboard
                </Button>
                <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                  Go to Home Page
                </Button>
              </div>
            </div>
          )}

          {user &&
            userRole === "strategy_creator" &&
            !location.pathname.startsWith("/dashboard") && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Welcome, Strategy Creator! You have premium access to create and manage
                    strategies.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 gap-2">
                  <Button onClick={() => navigate("/dashboard")} className="w-full">
                    Go to Strategy Creator Dashboard
                  </Button>
                  <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                    Go to Home Page
                  </Button>
                </div>
              </div>
            )}

          {user &&
            userRole === "user" &&
            !location.pathname.startsWith("/dashboard") && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Welcome back! You're being redirected to your dashboard.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 gap-2">
                  <Button onClick={() => navigate("/dashboard")} className="w-full">
                    Go to User Dashboard
                  </Button>
                  <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                    Go to Home Page
                  </Button>
                </div>
              </div>
            )}

          {!user && (
            <>
              <Tabs value={isSignUp ? "signup" : "signin"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin" onClick={() => setIsSignUp(false)}>
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" onClick={() => setIsSignUp(true)}>
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4 mt-4">
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Enter your password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Sign In
                    </Button>
                  </form>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm"
                    onClick={handleForgotPassword}
                    disabled={isSubmitting}
                  >
                    Forgot your password?
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-4">
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Create a password"
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm your password"
                        minLength={6}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Sign Up
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
