import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, UserPlus, LogIn, Gift, Shield, FileText, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signUp, signIn, isLoading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(email, password, referralCode);
    
    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Welcome to VirtuixRW! Start your trading journey.",
      });
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 glow-blue mb-4"
          >
            <span className="text-2xl font-bold text-gradient-blue">VX</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient-blue">VirtuixRW</h1>
          <p className="text-muted-foreground mt-2">Rwanda's Premier Trading Platform</p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Welcome</CardTitle>
            <CardDescription>Sign in or create an account to start trading</CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-6 mb-4" style={{ width: "calc(100% - 48px)" }}>
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                    <div className="relative">
                      <Gift className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="referral-code"
                        type="text"
                        placeholder="VTXABCD123"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Enter a referral code to get bonus rewards!</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* ✅ UPDATED LEGAL DISCLAIMER WITH LINKS */}
        <div className="mt-6 px-4 text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <a 
              href="/terms-of-service" 
              className="text-primary hover:underline font-medium"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a 
              href="/privacy-policy" 
              className="text-primary hover:underline font-medium"
            >
              Privacy Policy
            </a>
            .
          </p>
          
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> Capital at risk. Past performance doesn't guarantee future results. 
            VirtuixRW operates under Rwandan financial regulations.
          </p>

          {/* ✅ FOOTER LINKS SECTION */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-4 border-t border-border/50">
            {/* Terms of Service Link */}
            <a 
              href="/terms-of-service" 
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <FileText className="h-3 w-3" />
              <span>Terms of Service</span>
            </a>
            
            {/* Privacy Policy Link */}
            <a 
              href="/privacy-policy" 
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Shield className="h-3 w-3" />
              <span>Privacy Policy</span>
            </a>
            
            {/* Contact Support Link */}
            <a 
              href="tel:+250790316694" 
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-3 w-3" />
              <span>Support: 0790 316 694</span>
            </a>
          </div>

          {/* ✅ COPYRIGHT SECTION */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground/70">
              © {new Date().getFullYear()} VirtuixRW. All rights reserved.
            </p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              Registered in Rwanda • MTN Money: 0790 316 694
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
