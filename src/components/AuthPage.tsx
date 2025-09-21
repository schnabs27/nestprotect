import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Shield, Users, Clock, Map, LifeBuoy, Sun, AlertTriangle, Home, Copy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface AuthPageProps {
  onAuthSuccess: () => void;
  onGuestAccess: () => void;
}

const AuthPage = ({ onAuthSuccess, onGuestAccess }: AuthPageProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        setUserCount(count || 0);
      } catch (err) {
        console.error('Error fetching user count:', err);
      }
    };

    fetchUserCount();

    // Set up real-time subscription for user count updates
    const channel = supabase
      .channel('user-count-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchUserCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        toast.success("Account created! Please check your email and click the verification link before signing in.");
        setError("Please check your email and click the verification link before you can sign in.");
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
        if (error.message === "Invalid login credentials") {
          setError("Invalid email or password. If you just signed up, please check your email and click the verification link first.");
        } else {
          setError(error.message);
        }
      } else {
        onAuthSuccess();
        navigate("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        setError(error.message);
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
          <img 
            src="/lovable-uploads/0de7c778-50fa-452d-b71f-bc6781f7befd.png" 
            alt="NestProtect Logo" 
            className="w-20 h-20 object-contain mx-auto"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NestProtect™</h1>
            <p className="text-gray-600 mt-2">Your personal natural disaster guide</p>
          </div>
        </div>

        {/* Value Proposition */}
        <Card className="border-0 shadow-lg">
          <CardContent className="space-y-4 pt-6">
            <p className="text-gray-700 text-center leading-tight">
              Natural disasters like storms, floods, and wildfires happen. Most of us aren't prepared.
            </p>
            <div className="w-full">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="text-right pr-4 py-3">
                      <span className="text-lg font-bold text-gray-900">BEFORE</span>
                    </td>
                    <td className="text-left pl-4 py-3">
                      <span className="text-gray-700">
                        <span className="font-bold" style={{ color: '#0080e0' }}>Are you prepared? Take Nestor's quiz.</span> Then prep more with checklists.
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="text-right pr-4 py-3">
                      <span className="text-lg font-bold text-gray-900">DURING</span>
                    </td>
                    <td className="text-left pl-4 py-3">
                      <span className="text-gray-700">Get real-time weather and traffic conditions plus guidance to act quickly.</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-right pr-4 py-3">
                      <span className="text-lg font-bold text-gray-900">AFTER</span>
                    </td>
                    <td className="text-left pl-4 py-3">
                      <span className="text-gray-700">Use easy search and AI tools to find resources to help you recover.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

          </CardContent>
        </Card>

        {/* User Goal Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div 
            className="p-6 text-center"
            style={{ 
              background: 'linear-gradient(135deg, #b416ff 0%, #0080e0 100%)' 
            }}
          >
            <h3 className="text-xl font-bold text-white mb-3">
              Help us reach 200 homes!
            </h3>
            <p className="text-white mb-4 leading-relaxed">
              September is Disaster Preparedness Month. Help NestProtect reach 200 users! Please sign up and share this with your friends:{" "}
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://nestprotect.app/');
                  toast.success('URL copied to clipboard!');
                }}
                className="text-white underline hover:text-gray-200 transition-colors inline-flex items-center gap-1"
              >
                https://nestprotect.app/
                <Copy className="w-3 h-3" />
              </button>
            </p>
            <p className="text-lg font-bold text-white">
              NestProtect Users: {userCount}
            </p>
          </div>
        </Card>

        {/* Guest Access */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                About NestProtect
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                NestProtect is a free and privacy-focused app by Blue Sky Disaster Relief, a 501(c)(3) non-profit helping people affected by natural disasters.
              </p>
              <p className="text-gray-700 leading-relaxed">
                My family wasn't prepared when our home was hit by a tornado in October 2019. That's why I created Blue Sky Disaster Relief and Nestor, your personal NestProtect guide. I hope you'll never experience a natural disaster but if you do, I hope I helped a little. <span className="font-bold">- Leo, High School Student</span>
              </p>
            </div>
            <CardDescription className="mb-4">
              Want a preview? (limited functionality)
            </CardDescription>
            <Button
              variant="outline"
              onClick={() => {
                onGuestAccess();
                navigate("/");
              }}
              className="w-full"
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          By using NestProtect, you agree to our{" "}
          <a 
            href="/terms" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            terms of service
          </a>{" "}
          and{" "}
          <a 
            href="/privacy" 
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