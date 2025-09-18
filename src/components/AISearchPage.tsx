import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Globe, Star, Lock, LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useAuth } from "@/components/AuthProvider";

interface DisasterResource {
  id: string;
  name: string;
  address: string;
  phone?: string;
  description: string;
  website?: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  category: string;
  source: string;
  source_id?: string;
  distance_mi?: number;
  city?: string;
  state?: string;
  hours?: string;
  created_at: string;
  updated_at: string;
  last_verified_at?: string;
  last_seen_at: string;
  is_archived: boolean;
}

const AISearchPage = () => {
  const navigate = useNavigate();
  const { zipCode: userZipCode, loading: locationLoading } = useUserLocation();
  const { user, isGuest } = useAuth();
  const [zipCode, setZipCode] = useState("");
  const [hasUserClearedField, setHasUserClearedField] = useState(false);
  const [resources, setResources] = useState<DisasterResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<DisasterResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  // Set user's zip code as default when available, but only if user hasn't manually cleared it
  useEffect(() => {
    if (userZipCode && !zipCode && !hasUserClearedField) {
      setZipCode(userZipCode);
    }
  }, [userZipCode, zipCode, hasUserClearedField]);

  // Handle input changes and track if user manually clears the field
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setZipCode(value);
    
    // If user clears the field completely, mark it as manually cleared
    if (value === "" && zipCode !== "") {
      setHasUserClearedField(true);
    } else if (value !== "" && hasUserClearedField) {
      // Reset the flag if user starts typing again
      setHasUserClearedField(false);
    }
  };

  // Helper function to convert text to title case
  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const mainCategories = [
    { id: "all", label: "All", color: "bg-[#06c29a]" },
    { id: "emergency", label: "Emergency", color: "bg-raspberry" },
    { id: "medical", label: "Medical", color: "bg-accent" },
    { id: "community_center", label: "Community Center", color: "bg-blue-500" },
    { id: "govt_office", label: "Govt Office", color: "bg-purple-500" }
  ];

  useEffect(() => {
    const filtered = resources.filter(resource => {
      if (selectedCategory === "all") return true;
      
      // Map AI search categories to our category system
      const categoryMap: Record<string, string[]> = {
        emergency: ['emergency responder'],
        medical: ['emergency medical'],
        community_center: ['community center'],
        govt_office: ['local government']
      };
      
      const targetCategories = categoryMap[selectedCategory] || [];
      return targetCategories.some(cat => 
        resource.category?.toLowerCase().includes(cat.toLowerCase())
      );
    });
    setFilteredResources(filtered);
  }, [resources, selectedCategory]);

  const handleSearch = async () => {
    if (!zipCode.trim()) {
      toast({
        title: "Please enter a ZIP code",
        variant: "destructive"
      });
      return;
    }

    // Validate ZIP code format
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zipCode.trim())) {
      toast({
        title: "Invalid ZIP code format",
        description: "Please enter a valid ZIP code (e.g., 12345 or 12345-6789)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResources([]);
    setFilteredResources([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-openai-resources', {
        body: { zipCode: zipCode.trim() }
      });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      if (data && data.results) {
        setResources(data.results);
        toast({
          title: "Search completed",
          description: `Found ${data.results.length} AI-sourced resources for ZIP ${zipCode.trim()}`
        });
      } else {
        setResources([]);
        toast({
          title: "No resources found",
          description: `No AI-sourced disaster resources found for ZIP ${zipCode.trim()}`
        });
      }
    } catch (error) {
      console.error('Error searching resources:', error);
      toast({
        title: "Search failed",
        description: "Unable to search for resources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-4 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1">AI Disaster Resources</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Authentication Required Notice */}
        {(!user || isGuest) && (
          <Card className="shadow-soft border-yellow/30 bg-yellow/10">
            <CardContent className="p-6 text-center">
              <Lock className="mx-auto mb-4 text-yellow" size={48} />
              <h2 className="text-xl font-bold text-title mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-4">
                Access to AI disaster resources requires a free account to ensure data privacy and prevent misuse.
              </p>
              <Button 
                onClick={() => navigate("/")}
                className="bg-gradient-primary border-0"
                size="lg"
              >
                <LogIn className="mr-2" size={18} />
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Show content only for authenticated users */}
        {user && !isGuest && (
          <>
            {/* Search Section */}
            <div className="bg-background shadow-soft p-4">
              <p className="text-muted-foreground mb-4">
                Search AI-powered disaster resources and emergency assistance.
              </p>
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter ZIP code or address"
                    name="requested_zipcode"
                    value={zipCode}
                    onChange={handleZipCodeChange}
                    className="h-12"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  size="lg"
                  className="bg-gradient-primary border-0 shadow-medium hover:shadow-strong transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                </Button>
              </div>

              {/* Category Filters */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-foreground mb-2">Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {mainCategories.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    
                    return (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className={`cursor-pointer hover:opacity-80 transition-smooth ${
                          isSelected 
                            ? `${category.color} text-white ring-2 ring-primary`
                            : "bg-white text-muted-foreground"
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Results count */}
              {resources.length > 0 && (
                <div className="bg-primary/5 p-3 -mx-4 -mb-4">
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredResources.length} of {resources.length} AI-sourced resources
                  </p>
                </div>
              )}
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Searching AI-powered resources...</p>
              </div>
            )}

            {/* Disclaimer */}
            {resources.length > 0 && (
              <div className="bg-orange/10 border border-orange/30 p-3 text-xs">
                <p className="text-xs text-muted-foreground pr-8">
                  These listings come from AI-powered databases. Please <strong>call to confirm</strong> they're open.
                </p>
              </div>
            )}

            {/* Resource Cards */}
            <div className="space-y-4">
              {filteredResources.length === 0 && resources.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Enter an address and press the *search* button for AI disaster resources</p>
                </div>
              )}
              
              {filteredResources.length === 0 && resources.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No resources found for the selected category</p>
                </div>
              )}

              {filteredResources.map((resource, index) => {
                return (
                  <Card key={`${resource.source_id}-${resource.source}-${index}`} className="shadow-soft hover:shadow-medium transition-smooth">
                    <CardContent className="p-2">
                      {/* Resource name as heading */}
                      <h3 className="text-base font-semibold text-title mb-1">{resource.name}</h3>
                      
                      {/* Address (text only, no icon) */}
                      <p className="text-sm text-muted-foreground mb-1">
                        {resource.address && resource.city && `${resource.address}, ${resource.city}`}
                        {resource.address && !resource.city && resource.address}
                        {!resource.address && resource.city && resource.city}
                      </p>

                      {/* Category badges */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {resource.category && (
                          <Badge variant="secondary" className="text-xs py-0 px-2">
                            {toTitleCase(resource.category)}
                          </Badge>
                        )}
                      </div>

                      {/* Icon row with 4 clickable icons */}
                      <div className="flex gap-3 mb-1">
                        {/* Map pin icon for directions */}
                        {(resource.source_id || (resource.latitude && resource.longitude)) && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8"
                            onClick={() => {
                              const directionsUrl = resource.source_id 
                                ? `https://www.google.com/maps/dir/?api=1&destination=place_id:${resource.source_id}&origin=My+Location`
                                : `https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}&origin=My+Location`;
                              window.open(directionsUrl, '_blank');
                            }}
                            title="Get directions"
                          >
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}

                        {/* Phone icon */}
                        {resource.phone && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8"
                            onClick={() => window.open(`tel:${resource.phone}`, '_self')}
                            title={`Call ${resource.phone}`}
                          >
                            <Phone className="h-4 w-4 text-green-600" />
                          </Button>
                        )}

                        {/* Website icon */}
                        {resource.website && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-8 w-8"
                            onClick={() => window.open(resource.website, '_blank')}
                            title="Visit website"
                          >
                            <Globe className="h-4 w-4 text-purple-600" />
                          </Button>
                        )}

                      </div>

                      {/* Description (text only) */}
                      <p className="text-xs text-muted-foreground">
                        {toTitleCase(resource.description)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AISearchPage;