import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SecureContactProps {
  resourceId: string;
  resourceName: string;
  className?: string;
}

interface ContactInfo {
  phone?: string;
  email?: string;
}

const SecureContactInfo = ({ resourceId, resourceName, className = "" }: SecureContactProps) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  // Check authentication status and access permissions
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAccessPermission();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAccessPermission();
      } else {
        setCanAccess(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [resourceId]);

  const checkAccessPermission = async () => {
    try {
      const { data, error } = await supabase.rpc('can_access_contact_info_secure', {
        resource_id: resourceId
      });
      
      if (error) {
        console.error('Error checking access permission:', error);
        setCanAccess(false);
        return;
      }
      
      setCanAccess(data);
    } catch (error) {
      console.error('Error checking access permission:', error);
      setCanAccess(false);
    }
  };

  const handleRevealContact = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access email information for emergency resources.",
        variant: "destructive",
      });
      return;
    }

    if (canAccess === false) {
      toast({
        title: "Access Restricted",
        description: "Email information is only available for resources in your local area. Please update your zip code in your profile to match the resource location.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_disaster_resource_contact_secure', {
        resource_id: resourceId
      });

      if (error) {
        console.error('Error fetching contact info:', error);
        toast({
          title: "Error",
          description: "Unable to retrieve email information. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        setContactInfo(data[0]);
        setIsRevealed(true);
        toast({
          title: "Contact Information Loaded",
          description: "Email details are now visible. This access has been logged for security purposes.",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Email information is restricted to users in the same general area as the resource.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneCall = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_disaster_resource_contact_secure', {
        resource_id: resourceId
      });

      if (error) {
        console.error('Error fetching phone info:', error);
        toast({
          title: "Error",
          description: "Unable to retrieve phone information. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0 && data[0].phone) {
        window.open(`tel:${data[0].phone}`);
        toast({
          title: "Calling Resource",
          description: "Opening phone dialer for this resource.",
        });
      } else {
        toast({
          title: "No Phone Available",
          description: "No phone number is available for this resource.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Always show Call button - no access restrictions for phone */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePhoneCall}
        disabled={isLoading}
        className="flex items-center space-x-1"
      >
        <Phone size={14} />
        <span>{isLoading ? "Loading..." : "Call"}</span>
      </Button>

      {/* Show email access button with restrictions */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRevealContact}
        disabled={isLoading || canAccess === false}
        className="flex items-center space-x-1"
      >
        <Mail size={14} />
        <span>
          {isLoading ? "Loading..." : 
           canAccess === false ? "Email Restricted" : 
           "Show Email"}
        </span>
      </Button>

      {!user && (
        <span className="text-xs text-gray-500">Sign in for email</span>
      )}
      {user && canAccess === false && (
        <span className="text-xs text-yellow-600">Email: local area only</span>
      )}

      {/* Show revealed email */}
      {isRevealed && contactInfo?.email && (
        <div className="flex items-center space-x-2 mt-2">
          <Mail size={14} className="text-blue-500 flex-shrink-0" />
          <span className="text-sm">{contactInfo.email}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`mailto:${contactInfo.email}`)}
            className="p-1 h-auto text-blue-600 hover:text-blue-800"
          >
            Email
          </Button>
        </div>
      )}
    </div>
  );
};

export default SecureContactInfo;