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
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  // Check authentication status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRevealContact = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access contact information for emergency resources.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_disaster_resource_contact', {
        resource_id: resourceId
      });

      if (error) {
        console.error('Error fetching contact info:', error);
        toast({
          title: "Error",
          description: "Unable to retrieve contact information. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        setContactInfo(data[0]);
        setIsRevealed(true);
      } else {
        toast({
          title: "No Contact Information",
          description: "No contact details are available for this resource.",
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

  if (!isRevealed) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRevealContact}
          disabled={isLoading}
          className="flex items-center space-x-1"
        >
          <Shield size={14} />
          <span>{isLoading ? "Loading..." : "Show Contact"}</span>
        </Button>
        {!user && (
          <span className="text-xs text-gray-500">Sign in required</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {contactInfo?.phone && (
        <div className="flex items-center space-x-2">
          <Phone size={14} className="text-green-500 flex-shrink-0" />
          <span className="text-sm">{contactInfo.phone}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`tel:${contactInfo.phone}`)}
            className="p-1 h-auto text-green-600 hover:text-green-800"
          >
            Call
          </Button>
        </div>
      )}
      {contactInfo?.email && (
        <div className="flex items-center space-x-2">
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
      {!contactInfo?.phone && !contactInfo?.email && (
        <span className="text-sm text-gray-500">No contact information available</span>
      )}
    </div>
  );
};

export default SecureContactInfo;