import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SecureContactProps {
  sourceId: string;
  source: string;
  resourceName: string;
  className?: string;
}

interface ContactInfo {
  phone?: string;
  email?: string;
}

const SecureContactInfo = ({ sourceId, source, resourceName, className = "" }: SecureContactProps) => {
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
  }, [sourceId]);

  const checkAccessPermission = async () => {
    try {
      const { data, error } = await supabase.rpc('can_access_contact_info_secure', {
        resource_id: sourceId
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
        resource_id: sourceId
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
      // Query using source_id and source instead of database id
      const { data, error } = await supabase
        .from('disaster_resources')
        .select('phone')
        .eq('source_id', sourceId)
        .eq('source', source)
        .maybeSingle();

      if (error) {
        console.error('Error fetching phone info:', error);
        toast({
          title: "Error",
          description: "Unable to retrieve phone information. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.phone) {
        window.open(`tel:${data.phone}`);
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
    <div className={`${className}`}>
      {/* Always show Call button - no access restrictions for phone */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePhoneCall}
        disabled={isLoading}
        className={className || "flex items-center space-x-1"}
      >
        <Phone size={18} className="text-green-500" />
        {!className && <span>{isLoading ? "Loading..." : "Call"}</span>}
      </Button>
    </div>
  );
};

export default SecureContactInfo;