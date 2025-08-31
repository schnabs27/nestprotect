import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Shield, Users, Clock, Map, LifeBuoy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface AuthPageProps {
  onAuthSuccess: () => void;
  onGuestAccess: () => void;
}

const AuthPage = ({ onAuthSuccess, onGuestAccess }: AuthPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zipCode, setZipCode] = useState("");
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
          emailRedirectTo: redirectUrl,
          data: {
            zip_code: zipCode
          }
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
        <Card className="border-0 shadow-lg">
          <CardContent className="space-y-4 pt-6">
            <p className="text-gray-700 text-center leading-tight">
              Hi, I'm Nestor! Natural disasters happen, and I want to help you weather the storm with these tools:
            </p>
            <div className="space-y-3 text-sm">
              <div className="border-2 border-yellow-300 rounded-lg p-3 bg-yellow-50/50">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-yellow-600" />
                  <div>
                    <span className="font-bold text-gray-900 text-base">BEFORE</span>
                    <p className="text-gray-700 mt-1">Interactive checklists and guides to prepare</p>
                  </div>
                </div>
              </div>
              <div className="border-2 border-orange-300 rounded-lg p-3 bg-orange-50/50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <span className="font-bold text-gray-900 text-base">DURING</span>
                    <p className="text-gray-700 mt-1">Real-time weather, fire, and traffic conditions</p>
                  </div>
                </div>
              </div>
              <div className="border-2 border-red-300 rounded-lg p-3 bg-red-50/50">
                <div className="flex items-center gap-3">
                  <LifeBuoy className="w-5 h-5 text-red-600" />
                  <div>
                    <span className="font-bold text-gray-900 text-base">AFTER</span>
                    <p className="text-gray-700 mt-1">AI-driven search of disaster resources</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-center text-sm pt-2">
              NestProtect is a free and privacy-focused app by Blue Sky Disaster Relief, a 501(c)(3) non-profit helping people affected by natural disasters.
            </p>
          </CardContent>
        </Card>

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
                  <div>
                    <Input
                      type="text"
                      placeholder="Zip Code (optional)"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      maxLength={5}
                      pattern="[0-9]{5}"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be the default starting point for all location-based content in the app
                    </p>
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
          By using NestProtect, you agree to our{" "}
          <a 
            href="https://www.blueskynow.org/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            terms of service
          </a>{" "}
          and{" "}
          <a 
            href="https://www.blueskynow.org/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            privacy policy
          </a>
          .
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          © 2025 www.blueskynow.org
        </p>
      </div>
    </div>
  );
};

export default AuthPage;