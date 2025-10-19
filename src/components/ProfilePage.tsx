import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileNavigation from "@/components/MobileNavigation";
import ContactForm from "@/components/ContactForm";
import ReviewForm from "@/components/ReviewForm";
import { User, Heart, MapPin, Shield, ExternalLink, Info, LogOut } from "lucide-react";
import NestorCap from "/images/nestor-cap.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isGuest, signOut, setGuestMode } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useUserProfile(user);
  const [showEducationalDisclaimer, setShowEducationalDisclaimer] = useState(true);

  const [userInfo, setUserInfo] = useState({
    zipCode: "",
    name: user?.email || "Guest User"
  });

  // Update local state when profile loads
  useEffect(() => {
    if (profile?.zip_code) {
      setUserInfo(prev => ({
        ...prev,
        zipCode: profile.zip_code
      }));
    } else if (!profile?.zip_code && user && !isGuest) {
      // If user is authenticated but has no ZIP code, set to empty
      setUserInfo(prev => ({
        ...prev,
        zipCode: ""
      }));
    }
  }, [profile, user, isGuest]);

  const handleZipCodeUpdate = async () => {
    if (!user || isGuest) {
      toast.error("Please sign in to update your profile");
      return;
    }

    if (!userInfo.zipCode || userInfo.zipCode.length !== 5 || !/^\d{5}$/.test(userInfo.zipCode)) {
      toast.error("Please enter a valid 5-digit ZIP code");
      return;
    }

    const success = await updateProfile({ zip_code: userInfo.zipCode });
    if (success) {
      toast.success("ZIP code updated successfully");
    } else {
      toast.error("Failed to update ZIP code");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      if (isGuest) {
        setGuestMode(false);
      }
      toast.success("Successfully signed out");
      navigate("/auth");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || isGuest) {
      toast.error("Cannot delete guest account");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data."
    );

    if (!confirmDelete) return;

    try {
      // First delete the user's profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        console.error("Error deleting profile:", profileError);
      }

      // Then delete the auth user account
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) {
        toast.error("Failed to delete account: " + authError.message);
        return;
      }

      toast.success("Account deleted successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("An unexpected error occurred while deleting your account");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      if (isGuest) {
        // Guest user - create new account with Google
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          toast.error("Failed to sign up with Google: " + error.message);
        } else {
          toast.success("Redirecting to Google...");
        }
      } else if (user) {
        // Signed-in user - link Google account
        const { error } = await supabase.auth.linkIdentity({
          provider: 'google'
        });

        if (error) {
          toast.error("Failed to link Google account: " + error.message);
        } else {
          toast.success("Google account linked successfully!");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Page Header with Bird Image */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <img 
              src={NestorCap} 
              alt="Nestor selfie in his baseball cap"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-title">Account Settings</h1>
          </div>
        </div>

      
        {/* Account Details */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-title">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                  placeholder="Your email address"
                />
              </div>
              
              <div>
                <Label htmlFor="zipcode">ZIP Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="zipcode"
                    value={userInfo.zipCode}
                    onChange={(e) => setUserInfo({...userInfo, zipCode: e.target.value})}
                    placeholder="Your ZIP code"
                    maxLength={5}
                    pattern="[0-9]{5}"
                    disabled={isGuest}
                  />
                  <Button 
                    onClick={handleZipCodeUpdate}
                    disabled={isGuest || profileLoading}
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for local weather and disaster relief searches
                </p>
              </div>
            </div>

            {/* Account Management Section */}
            <div className="space-y-4">
              
              {/* Change Password */}
              <Button 
                variant="outline"
                className="w-full justify-start"
                disabled={isGuest}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </Button>
              
              {/* Google Auth Integration */}
              <div className="space-y-2">
                <Button 
                  onClick={handleGoogleAuth}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isGuest ? "Sign Up with Google" : "Link Google Account"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {isGuest 
                    ? "Create a new account to save your data permanently" 
                    : "Connect your Google account for easier sign-in"
                  }
                </p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <LogOut size={16} className="mr-2" />
                {user ? "Sign Out" : "Exit Guest Mode"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleDeleteAccount}
                disabled={isGuest}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About NestProtect */}
        <Card className="mb-6 shadow-soft border-accent/30">
          <CardHeader>
            <CardTitle className="text-title">About NestProtect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-accent mb-2">Built by Leo 👋</h3>
              <p className="text-muted-foreground leading-relaxed">
                I'm a high school student whose family was hit by a tornado. After experiencing firsthand how hard it was to find local help and get back on our feet, I built NestProtect to help other homeowners protect their nests.
              </p>
            </div>
            
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-start gap-2">
                <Shield size={16} className="mt-0.5 text-primary flex-shrink-0" />
                <p><strong>Privacy First:</strong> We WILL NOT use or share your info for marketing</p>
              </div>
              <div className="flex items-start gap-2">
                <Heart size={16} className="mt-0.5 text-coral flex-shrink-0" />
                <p><strong>Free Forever:</strong> This app will always be free for homeowners</p>
              </div>
              <div className="flex items-start gap-2">
                <Info size={16} className="mt-0.5 text-accent flex-shrink-0" />
                <p><strong>Your Data, Your Control:</strong> All personal data stays in your Google Drive</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-title">App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Version</span>
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Updated</span>
              <span className="text-sm text-muted-foreground">September 2025</span>
            </div>
          </CardContent>
        </Card>

        {/* Educational Disclaimer */}
        {showEducationalDisclaimer && (
          <Card className="bg-white shadow-soft">
            <CardContent className="p-4 space-y-3 text-center">
              <p className="text-muted-foreground text-sm leading-relaxed">
                The NestProtect app is for education only. Emergencies are serious. Contact 911 if you think you might be in danger.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Links */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/privacy-policy')}
          >
            <ExternalLink size={16} className="mr-2" />
            Privacy Policy
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/terms-of-service')}
          >
            <ExternalLink size={16} className="mr-2" />
            Terms of Service
          </Button>
          <ContactForm>
            <Button variant="outline" className="w-full justify-start">
              <ExternalLink size={16} className="mr-2" />
              Contact Support
            </Button>
          </ContactForm>
          <ReviewForm>
            <Button variant="outline" className="w-full justify-start">
              <Heart size={16} className="mr-2 text-coral" />
              Leave a Review
            </Button>
          </ReviewForm>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default ProfilePage;