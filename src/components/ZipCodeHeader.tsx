import { useState } from "react";
import { MapPin, Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { validateZipCode, sanitizeZipCode, rateLimiter } from '@/utils/security';

const ZipCodeHeader = () => {
  const { zipCode, updateZipCode } = useUserLocation();
  const { isGuest } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const handleEdit = () => {
    if (isGuest) {
      toast.error("Please sign in to update your ZIP code");
      return;
    }
    setEditValue(zipCode || "78028");
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Rate limiting for ZIP code updates
    const clientId = 'zip_update_' + (navigator.userAgent?.slice(0, 50) || 'unknown');
    if (!rateLimiter.isAllowed(clientId, 10, 60000)) {
      toast.error("Too many attempts. Please wait before updating your ZIP code again.");
      return;
    }

    const sanitizedZip = sanitizeZipCode(editValue);
    
    if (!validateZipCode(sanitizedZip)) {
      toast.error("Please enter a valid 5-digit ZIP code");
      return;
    }

    try {
      console.log('ZipCodeHeader: Attempting to update ZIP code to:', sanitizedZip);
      console.log('ZipCodeHeader: Current ZIP code before update:', zipCode);
      
      await updateZipCode(sanitizedZip);
      setIsEditing(false);
      
      console.log('ZipCodeHeader: Update completed, current ZIP code:', zipCode);
      toast.success("ZIP code updated successfully");
    } catch (error) {
      console.error('ZipCodeHeader: Failed to update zip code:', error);
      toast.error("Failed to update ZIP code");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue("");
  };

  console.log('ZipCodeHeader: Current zipCode from hook:', zipCode);
  console.log('ZipCodeHeader: Display ZIP code will be:', zipCode || "78028");
  
  const displayZipCode = zipCode || "78028";

  return (
    <div className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Location:</span>
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="12345"
              maxLength={5}
              pattern="[0-9]{5}"
              className="w-20 h-8 text-sm text-center"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0">
              <Check size={14} />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0">
              <X size={14} />
            </Button>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <span className="font-mono">{displayZipCode}</span>
            <Edit3 size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ZipCodeHeader;