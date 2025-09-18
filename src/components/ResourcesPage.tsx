import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileNavigation from "@/components/MobileNavigation";
import { Search, MapPin, Star, Globe, Navigation, Filter, X, Info, Clock, RefreshCw, CheckSquare, Lock, LogIn, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useAuth } from "@/components/AuthProvider";
import ResourceMap from "@/components/ResourceMap";
import SecureContactInfo from "@/components/SecureContactInfo";

const ResourcesPage = () => {
  const navigate = useNavigate();
  const { zipCode: userZipCode, loading: locationLoading } = useUserLocation();
  const { user, isGuest, setGuestMode } = useAuth();
  const [zipCode, setZipCode] = useState("");
  const [hasUserClearedField, setHasUserClearedField] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cachedResults, setCachedResults] = useState<any>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
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
    { id: "food", label: "Food", color: "bg-orange-500" },
    { id: "shelter", label: "Shelter", color: "bg-coral" },
    { id: "community_center", label: "Community Center", color: "bg-blue-500" },
    { id: "govt_office", label: "Govt Office", color: "bg-purple-500" },
    { id: "favorites", label: "Favorite", color: "bg-yellow" }
  ];

  const handleSearch = async () => {
    if (!user || isGuest) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to search for disaster relief resources",
        variant: "destructive",
      });
      return;
    }
    
    const sanitizedZip = zipCode.trim();
    if (!sanitizedZip) return;
    
    // Client-side ZIP code validation
    const zipCodeRegex = /^[0-9]{5}(-[0-9]{4})?$/;
    if (!zipCodeRegex.test(sanitizedZip)) {
      toast({
        title: "Invalid ZIP Code",
        description: "Please enter a valid ZIP code (e.g., 12345 or 12345-6789)",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-disaster-resources', {
        body: { zipCode: sanitizedZip }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data.cached && data.cachedAt) {
        setCachedResults({
          cachedAt: new Date(data.cachedAt).toLocaleString(),
          count: data.resources.length
        });
        toast({
          title: "Cached Results",
          description: `Showing ${data.resources.length} cached results from ${new Date(data.cachedAt).toLocaleString()}`,
        });
      } else {
        setCachedResults(null);
        toast({
          title: "Search Complete",
          description: `Found ${data.resources.length} disaster relief resources`,
        });
      }

      if (data.errors && data.errors.length > 0) {
        toast({
          title: "Partial Results",
          description: `Some data sources had errors: ${data.errors.join(', ')}`,
          variant: "destructive",
        });
      }

      setResources(data.resources || []);
      
      // Load favorites for the new resources
      if (data.resources && data.resources.length > 0) {
        loadFavorites(data.resources);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for disaster relief resources. Please try again.",
        variant: "destructive",
      });
      setResources([]);
    } finally {
      setIsSearching(false);
    }
  };

  const loadFavorites = async (resourceList: any[]) => {
    try {
      // For now, use device-based storage for unauthenticated users
      let deviceId = localStorage.getItem('device-id');
      if (!deviceId) {
        deviceId = await generateDeviceId();
        localStorage.setItem('device-id', deviceId);
      }
      
      const resourceIds = resourceList.map(r => `${r.source_id}-${r.source}`);
      
      const { data: favoriteData } = await supabase
        .from('user_resource_prefs')
        .select('resource_id')
        .in('resource_id', resourceIds)
        .eq('device_id', deviceId)
        .eq('is_favorite', true);

      if (favoriteData) {
        setFavorites(new Set(favoriteData.map(f => f.resource_id)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const generateDeviceId = async () => {
    const { generateSecureDeviceId } = await import('@/utils/security');
    const deviceId = await generateSecureDeviceId();
    localStorage.setItem('device-id', deviceId);
    return deviceId;
  };

  const filteredResources = resources
    .filter(resource => {
      if (selectedCategory === "all") return true;
      if (selectedCategory === "favorites") {
        const resourceKey = `${resource.source_id}-${resource.source}`;
        return favorites.has(resourceKey);
      }
      
      // Check categories array for specific category matches
      if (resource.categories) {
        if (selectedCategory === "emergency") {
          return resource.categories.emergency_responder === true;
        }
        if (selectedCategory === "medical") {
          return resource.categories.emergency_medical === true;
        }
        if (selectedCategory === "food") {
          return resource.categories.food_assistance === true;
        }
        if (selectedCategory === "shelter") {
          return resource.categories.shelter_assistance === true;
        }
        if (selectedCategory === "community_center") {
          return resource.categories.community_center === true;
        }
        if (selectedCategory === "govt_office") {
          return resource.categories.local_government_office === true;
        }
      }
      
      return false;
    })
    .sort((a, b) => {
      // Sort by category first
      const categoryA = a.category || '';
      const categoryB = b.category || '';
      return categoryA.localeCompare(categoryB);
    });

  const toggleFavorite = async (resource: any) => {
    try {
      let deviceId = localStorage.getItem('device-id');
      if (!deviceId) {
        deviceId = await generateDeviceId();
      }
      const resourceKey = `${resource.source_id}-${resource.source}`;
      const isFavorited = favorites.has(resourceKey);

      if (isFavorited) {
        // Remove from favorites
        await supabase
          .from('user_resource_prefs')
          .delete()
          .eq('resource_id', resourceKey)
          .eq('device_id', deviceId);
        
        const newFavorites = new Set(favorites);
        newFavorites.delete(resourceKey);
        setFavorites(newFavorites);
        
        toast({
          title: "Removed from Favorites",
          description: `${resource.name} has been removed from your favorites`,
        });
      } else {
        // Add to favorites
        await supabase
          .from('user_resource_prefs')
          .upsert({
            resource_id: resourceKey,
            device_id: deviceId,
            is_favorite: true
          });
        
        const newFavorites = new Set(favorites);
        newFavorites.add(resourceKey);
        setFavorites(newFavorites);
        
        toast({
          title: "Added to Favorites",
          description: `${resource.name} has been added to your favorites`,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-4 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1">Local Disaster Relief</h1>
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
                Access to disaster relief resources requires a free account to ensure data privacy and prevent misuse.
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
                Search Google business listings for disaster emergency resources.
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
                  disabled={isSearching}
                >
                  <Search size={20} />
                </Button>
              </div>

              {/* Category Filters */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-foreground mb-2">Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {mainCategories.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    const isFavorites = category.id === "favorites";
                    
                    return (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className={`cursor-pointer hover:opacity-80 transition-smooth ${
                          isSelected 
                            ? `${category.color} ${isFavorites ? "text-yellow-foreground" : "text-white"} ring-2 ring-primary`
                            : isFavorites 
                              ? "bg-white border border-yellow text-muted-foreground"
                              : "bg-background border border-input text-muted-foreground hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Cached Results Notice */}
              {cachedResults && (
                <div className="bg-muted/50 border border-border rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground">
                    Showing cached results from {cachedResults.cachedAt}. 
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 ml-1 text-xs"
                      onClick={handleSearch}
                    >
                      Run fresh search ↻
                    </Button>
                  </p>
                </div>
              )}

              {/* Search Banner */}
              {isSearching && (
                <div className="bg-yellow/20 border border-yellow/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-foreground font-medium">
                    🔍 Searching multiple directories, then compiling and cleaning the listings. This could take a little bit of time. Thanks for your patience!
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Results - Only show for authenticated users */}
        {user && !isGuest && (
          <div>
            {/* View Map Button */}
            {resources.length > 0 && (
              <div className="mb-4">
                <Button 
                  variant="outline" 
                  className="w-full bg-gradient-primary text-primary-foreground border-0 hover:opacity-90"
                  onClick={() => setShowMap(true)}
                >
                  <MapPin size={16} className="mr-2" />
                  View Map
                </Button>
              </div>
            )}

            {/* Dismissible Disclaimer */}
            {showDisclaimer && (
              <div className="bg-muted/50 border border-border rounded-lg p-3 mb-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => setShowDisclaimer(false)}
                >
                  <X size={12} />
                </Button>
                <p className="text-xs text-muted-foreground pr-8">
                  These listings come from disaster relief databases. Please <strong>call to confirm</strong> they're open.
                </p>
              </div>
            )}

            {/* Resource Cards */}
            <div className="space-y-4">
              {filteredResources.length === 0 && resources.length === 0 && !isSearching && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Enter an address and press the *search* button for disaster relief resources</p>
                </div>
              )}
              
              {filteredResources.length === 0 && resources.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No resources found for the selected category</p>
                </div>
              )}

              {filteredResources.map((resource, index) => (
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

                     {/* Description (text only) */}
                     <p className="text-xs text-muted-foreground mb-2">
                       {toTitleCase(resource.description)}
                     </p>

                     {/* Icon row with 3 clickable icons */}
                     <div className="flex gap-3 mb-1">
                      {/* Map pin icon for directions */}
                      {(resource.source_id || (resource.latitude && resource.longitude)) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const directionUrl = resource.source_id 
                              ? `https://www.google.com/maps/dir/?api=1&destination=place_id:${resource.source_id}&origin=My+Location`
                              : `https://maps.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`;
                            window.open(directionUrl, '_blank');
                          }}
                        >
                          <MapPin size={18} className="text-red-500" />
                        </Button>
                      )}
                      
                      {/* Phone icon for calling */}
                      <SecureContactInfo 
                        sourceId={resource.source_id}
                        source={resource.source}
                        resourceName={resource.name}
                        phone={resource.phone}
                        skipAccessChecks={true}
                        className="h-8 w-8 p-0"
                      />
                      
                      {/* Info icon for Google Maps business listing */}
                      {(resource.url || (resource.name && (resource.address || resource.city))) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            let mapUrl = resource.url;
                            
                            // If no URL or if URL doesn't look like a proper Google Maps business listing, create one
                            if (!mapUrl || (!mapUrl.includes('maps.google.com') && !mapUrl.includes('maps.app.goo.gl'))) {
                              const searchQuery = encodeURIComponent(
                                `${resource.name}${resource.address ? ` ${resource.address}` : ''}${resource.city ? ` ${resource.city}` : ''}`
                              );
                              mapUrl = `https://maps.google.com/maps/search/${searchQuery}`;
                            }
                            
                            window.open(mapUrl, '_blank');
                          }}
                        >
                          <Info size={18} className="text-blue-500" />
                        </Button>
                      )}
                    </div>

                     {/* Category row: List categories as comma-separated text */}
                     <div className="text-xs text-muted-foreground">
                      {resource.category && (
                        <>
                          <span className="font-medium">Category:</span> {resource.category}
                        </>
                      )}
                      {resource.source && (
                        <>
                          {resource.category && ' • '}
                          <span className="font-medium">Source:</span> {resource.source}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resource Map - Only show for authenticated users */}
      {user && !isGuest && (
        <ResourceMap 
          resources={resources}
          open={showMap}
          onOpenChange={setShowMap}
          zipCode={zipCode}
        />
      )}
      <MobileNavigation />
    </div>
  );
};

export default ResourcesPage;