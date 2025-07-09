import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Coffee, Star, Users, ShoppingBag, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  
  // Environment detection
  const isReplit = typeof window !== 'undefined' && window.location.hostname.includes('replit.dev');
  const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const isCloudRunDev = typeof window !== 'undefined' && 
                        window.location.hostname.includes('run.app') && 
                        !window.location.hostname.includes('roastah.com'); // Exclude production domain
  
  // Only Replit and localhost should show development redirect
  // GCP dev Cloud Run should show full login form like production
  const isDevelopmentEnv = isReplit || isLocal;
  const isProduction = !isDevelopmentEnv;
  
  // Debug environment detection for Cloud Run
  useEffect(() => {
    console.log('🔍 Auth Page Environment Detection:', {
      hostname: window.location.hostname,
      isReplit,
      isLocal,
      isCloudRunDev,
      isDevelopmentEnv,
      isProduction,
      nodeEnv: process.env.NODE_ENV
    });
  }, []);
  
  // Development environments: login only, Production: login + signup
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const navigate = useNavigate();

  // Redirect if already authenticated - but only after initial load
  useEffect(() => {
    if (!isLoading && user) {
      // Small delay to prevent immediate redirect during page load
      setTimeout(() => {
        // Development environments (Replit, localhost, GCP dev) redirect to /dev-login for impersonation
        if (isDevelopmentEnv || isCloudRunDev) {
          navigate("/dev-login");
        } else {
          navigate("/");
        }
      }, 100);
    }
  }, [isLoading, user, navigate, isDevelopmentEnv, isCloudRunDev]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password, keepMeLoggedIn }
        : { name, email, password, keepMeLoggedIn };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const user = await response.json();
        toast({
          title: isLogin ? "Welcome back!" : "Account created!",
          description: isLogin ? "You've successfully signed in." : "Your account has been created and you're now signed in.",
        });
        
        // Force refetch of user data to ensure authentication state is updated
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        // Small delay to ensure authentication state is updated
        setTimeout(() => {
          // Development environments (Replit, localhost, GCP dev) redirect to /dev-login for impersonation
          if (isDevelopmentEnv || isCloudRunDev) {
            navigate("/dev-login");
          } else {
            navigate("/");
          }
        }, 300);
      } else {
        const error = await response.text();
        toast({
          title: "Authentication failed",
          description: error || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection error",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 min-h-[80vh]">
          {/* Left Side - Auth Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Coffee className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Welcome to Roastah</CardTitle>
                <CardDescription>
                  Sign in to discover amazing coffee from local roasters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isProduction ? (
                  <>
                    {/* Email/Password Form - Available in all environments */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      {!isLogin && (
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
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
                      
                      {/* Keep me logged in checkbox */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="keepMeLoggedIn"
                          checked={keepMeLoggedIn}
                          onChange={(e) => setKeepMeLoggedIn(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="keepMeLoggedIn" className="text-sm">
                          Keep me logged in
                        </Label>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting 
                          ? "Please wait..." 
                          : isLogin 
                            ? "Sign In" 
                            : "Create Account"
                        }
                      </Button>
                    </form>

                    {/* Toggle between Login/Register - Only show signup in true production (not GCP dev) */}
                    {!isCloudRunDev && (
                      <div className="text-center">
                        <Button
                          variant="link"
                          onClick={() => {
                            setIsLogin(!isLogin);
                            setEmail("");
                            setPassword("");
                            setName("");
                          }}
                          className="text-sm"
                        >
                          {isLogin 
                            ? "Don't have an account? Sign up" 
                            : "Already have an account? Sign in"
                          }
                        </Button>
                      </div>
                    )}

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    {/* OAuth Providers */}
                    <Button
                      onClick={() => handleOAuthLogin('google')}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                    
                    <Button
                      onClick={() => handleOAuthLogin('github')}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </Button>
                  </>
                ) : (
                  // Development environment - redirect to dev login
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Development Environment Detected
                    </p>
                    <Button
                      onClick={() => navigate('/dev-login')}
                      className="w-full"
                    >
                      Continue to Development Login
                    </Button>
                  </div>
                )}

                <div className="text-xs text-center text-muted-foreground pt-4">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Hero Section */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="max-w-lg space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Discover Artisan Coffee
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Connect with local roasters and enjoy fresh, specialty coffee delivered to your door.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Coffee className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Fresh Roasted</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Direct from local roasters</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Premium Quality</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Curated selection</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Community</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connect with roasters</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Easy Ordering</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Simple checkout</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">For Roasters</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Join our marketplace to reach coffee lovers nationwide. Set up your shop and start selling today.
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}