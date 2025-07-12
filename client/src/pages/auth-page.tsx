import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface VerificationData {
  code: string;
  email: string;
}

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'auth' | 'verify' | 'success' | 'error'>('auth');
  const [userEmail, setUserEmail] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Check URL parameters for OAuth verification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('needsVerification') === 'true') {
      const email = params.get('email');
      if (email) {
        setUserEmail(decodeURIComponent(email));
        setCurrentView('verify');
        toast({
          title: "Verification Required",
          description: "Please check your email for the verification code",
        });
      }
    }
  }, [toast]);

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      const res = await apiRequest("POST", "/api/auth/signup", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setUserEmail(data.email);
      setCurrentView('verify');
      toast({
        title: "Registration successful",
        description: "Please check your email for verification code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async (data: SignInData) => {
      const res = await apiRequest("POST", "/api/auth/signin", data);
      return await res.json();
    },
    onSuccess: () => {
      // Redirect to secure home page
      const code = Math.random().toString(36).substring(2, 15);
      const errorCode = Math.random().toString(36).substring(2, 8);
      window.location.href = `/v2/?code=${code}&errorCode=${errorCode}#`;
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verification mutation
  const verifyMutation = useMutation({
    mutationFn: async (data: VerificationData) => {
      const res = await apiRequest("POST", "/api/auth/verify", data);
      return await res.json();
    },
    onSuccess: () => {
      setCurrentView('success');
    },
    onError: (error: any) => {
      setCurrentView('error');
      setVerificationError(error.message);
    },
  });

  // Resend verification code mutation
  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/auth/resend-verification", { email });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification code sent",
        description: "A new verification code has been sent to your email",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to resend code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
    };
    signUpMutation.mutate(data);
  };

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };
    signInMutation.mutate(data);
  };

  const handleVerification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;
    verifyMutation.mutate({ code, email: userEmail });
  };

  const renderAuthContent = () => (
    <div className="w-full max-w-md">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/api/auth/google'}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = 'https://discord.com/oauth2/authorize?client_id=1344311791177564202&response_type=code&redirect_uri=https%3A%2F%2Fqueit.site%2F&scope=identify+email'}>
                    <svg className="mr-2 h-4 w-4" fill="#5865F2" viewBox="0 0 24 24">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                    </svg>
                    Continue with Discord
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm">
                <ForgotPasswordModal>
                  <Button variant="link" className="text-sm">
                    Forgot your password?
                  </Button>
                </ForgotPasswordModal>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Sign up for a new account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={signUpMutation.isPending}
                >
                  {signUpMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/api/auth/google'}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign up with Google
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = 'https://discord.com/oauth2/authorize?client_id=1344311791177564202&response_type=code&redirect_uri=https%3A%2F%2Fqueit.site%2F&scope=identify+email'}>
                    <svg className="mr-2 h-4 w-4" fill="#5865F2" viewBox="0 0 24 24">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                    </svg>
                    Sign up with Discord
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderVerificationContent = () => (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to {userEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                name="code"
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Account
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <Button 
              variant="link" 
              className="text-sm"
              onClick={() => resendVerificationMutation.mutate(userEmail)}
              disabled={resendVerificationMutation.isPending}
            >
              {resendVerificationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend verification code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSuccessContent = () => (
    <div className="w-full max-w-md text-center">
      <div className="mb-6">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-600 mb-2">Verification Successful!</h2>
        <p className="text-gray-600">Your account has been verified successfully.</p>
      </div>
      <Button 
        onClick={() => {
          const code = Math.random().toString(36).substring(2, 15);
          const errorCode = Math.random().toString(36).substring(2, 8);
          window.location.href = `/v2/?code=${code}&errorCode=${errorCode}#`;
        }}
        className="w-full"
      >
        Go to Homepage
      </Button>
    </div>
  );

  const renderErrorContent = () => (
    <div className="w-full max-w-md text-center">
      <div className="mb-6">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
        <p className="text-gray-600">{verificationError}</p>
      </div>
      <div className="space-y-2">
        <Button 
          onClick={() => setCurrentView('verify')}
          className="w-full"
          variant="default"
        >
          Try Again
        </Button>
        <Button 
          onClick={() => {
            const code = Math.random().toString(36).substring(2, 15);
            const errorCode = Math.random().toString(36).substring(2, 8);
            window.location.href = `/v2/?code=${code}&errorCode=${errorCode}#`;
          }}
          className="w-full"
          variant="outline"
        >
          Go to Homepage
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - White Background with Forms and Stars */}
      <div className="flex-1 bg-white relative overflow-hidden flex items-center justify-center p-8">
        {/* Black Exit Button */}
        <button
          onClick={() => setLocation('/')}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        {/* Animated Stars */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-black rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Forms Content */}
        <div className="w-full max-w-md relative z-10">
          {currentView === 'auth' && renderAuthContent()}
          {currentView === 'verify' && renderVerificationContent()}
          {currentView === 'success' && renderSuccessContent()}
          {currentView === 'error' && renderErrorContent()}
        </div>
      </div>

      {/* Right Panel - Black Background with Animated Stars - Hidden on Mobile */}
      <div className="hidden lg:flex flex-1 bg-black relative overflow-hidden flex-col items-center justify-center">
        {/* Animated Stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Logo and Text */}
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <HelpCircle className="w-32 h-32 text-white mx-auto mb-6" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">Question</h1>
          <h2 className="text-4xl font-bold text-white">Action</h2>
        </div>
      </div>
    </div>
  );
}