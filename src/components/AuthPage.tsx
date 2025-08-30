import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Shield, Users, Clock, Map } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface AuthPageProps {
  onAuthSuccess: () => void;
  onGuestAccess: () => void;
}

const AuthPage = ({ onAuthSuccess, onGuestAccess }: AuthPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        setError(error.message);
      } else {
        toast.success("Check your email for verification link!");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        onAuthSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Branding */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto p-2">
            <img 
              src="/lovable-uploads/0de7c778-50fa-452d-b71f-bc6781f7befd.png" 
              alt="NestProtect Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NestProtect™</h1>
            <p className="text-gray-600 mt-2">Your personal natural disaster guide</p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="space-y-4">
          <p className="text-gray-700 text-center">
            Hi, I'm Nestor! Natural disasters happen, and I want to help you weather the storm with these tools:
          </p>
          
          {/* Before, During, After Cards */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Before</h3>
                <p className="text-gray-600 text-sm">Interactive checklists and tools to be prepared</p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">During</h3>
                <p className="text-gray-600 text-sm">Real-time fire, storm, and traffic data</p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">After</h3>
                <p className="text-gray-600 text-sm">AI-driven search of disaster relief resources and tips for easier recovery</p>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-gray-600 text-center text-sm pt-2">
            NestProtect is a free and privacy-focused app by Blue Sky Disaster Relief, a non-profit helping people affected by natural disasters.
          </p>
        </div>

        {/* Authentication Tabs */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Guest Access */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <CardDescription className="mb-4">
              Want to explore without creating an account?
            </CardDescription>
            <Button
              variant="outline"
              onClick={onGuestAccess}
              className="w-full"
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          By using NestProtect, you agree to our terms of service and privacy policy.
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          © 2025 www.blueskynow.org
        </p>
      </div>
    </div>
  );
};

export default AuthPage;