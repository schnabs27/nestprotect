import { useState } from "react";
import { User, Heart, MapPin, Bell, Shield, ExternalLink, Info, Smartphone, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

const ProfilePage = () => {
  const { user, isGuest, signOut, setGuestMode } = useAuth();
  
  const [notifications, setNotifications] = useState({
    weatherAlerts: true,
    emergencyUpdates: true,
    weeklyTips: false
  });

  const [userInfo, setUserInfo] = useState({
    zipCode: "62701",
    name: user?.email || "Guest User"
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      if (isGuest) {
        setGuestMode(false);
      }
      toast.success("Successfully signed out");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 pt-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <User size={24} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-primary-foreground/90 text-sm">Manage your NestProtect settings</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* About NestProtect */}
        <Card className="mb-6 shadow-soft border-accent/30">
          <CardHeader>
            <CardTitle className="text-title flex items-center gap-2">
              <Heart className="text-coral" size={20} />
              About NestProtect
            </CardTitle>
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

        {/* User Settings */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-title">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={userInfo.name}
                onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                placeholder="Your name"
              />
            </div>
            
            <div>
              <Label htmlFor="zipcode">ZIP Code</Label>
              <Input
                id="zipcode"
                value={userInfo.zipCode}
                onChange={(e) => setUserInfo({...userInfo, zipCode: e.target.value})}
                placeholder="Your ZIP code"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for local weather and disaster relief searches
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-title flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weather-alerts">Weather Alerts</Label>
                <p className="text-xs text-muted-foreground">Severe weather warnings for your area</p>
              </div>
              <Switch
                id="weather-alerts"
                checked={notifications.weatherAlerts}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, weatherAlerts: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emergency-updates">Emergency Updates</Label>
                <p className="text-xs text-muted-foreground">Local emergency and disaster information</p>
              </div>
              <Switch
                id="emergency-updates"
                checked={notifications.emergencyUpdates}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, emergencyUpdates: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-tips">Weekly Preparedness Tips</Label>
                <p className="text-xs text-muted-foreground">Helpful tips to stay prepared</p>
              </div>
              <Switch
                id="weekly-tips"
                checked={notifications.weeklyTips}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, weeklyTips: checked})
                }
              />
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
              <span className="text-sm text-muted-foreground">March 2024</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Storage</span>
              <span className="text-sm text-muted-foreground">Your Google Drive</span>
            </div>
          </CardContent>
        </Card>

        {/* Mobile App Notice */}
        <Card className="mb-6 shadow-soft border-yellow/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="text-yellow mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-yellow mb-1">Mobile App Available</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Download NestProtect for iOS and Android for the best mobile experience and offline access.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    📱 iOS App Store
                  </Button>
                  <Button variant="outline" size="sm">
                    🤖 Google Play
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle className="text-title">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">
                  {user ? `Signed in as: ${user.email}` : "Guest User"}
                </span>
                <p className="text-xs text-muted-foreground">
                  {user ? "Full access to all features" : "Limited access - some features may be restricted"}
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <LogOut size={16} className="mr-2" />
              {user ? "Sign Out" : "Exit Guest Mode"}
            </Button>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <ExternalLink size={16} className="mr-2" />
            Privacy Policy
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <ExternalLink size={16} className="mr-2" />
            Terms of Service
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <ExternalLink size={16} className="mr-2" />
            Contact Support
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Heart size={16} className="mr-2 text-coral" />
            Leave a Review
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;