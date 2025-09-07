import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileNavigation from "@/components/MobileNavigation";
import { Search, MapPin, Star, Globe, Navigation, Filter, X, Info, Clock, RefreshCw, CheckSquare, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    { id: "shelter", label: "Shelter", color: "bg-coral" },
    { id: "food", label: "Food", color: "bg-orange-500" },
    { id: "medical", label: "Medical", color: "bg-accent" },
    { id: "cleanup", label: "Cleanup", color: "bg-primary" },
    { id: "legal", label: "Legal", color: "bg-gray-700" },
    { id: "emergency", label: "Emergency Response", color: "bg-raspberry" },
    { id: "favorites", label: "Favorites", color: "bg-yellow" }
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
              if (selectedCategory === "emergency") {
                return resource.category?.toLowerCase().includes("emergency") || 
                       resource.category?.toLowerCase().includes("response");
              }
              return resource.category?.toLowerCase().includes(selectedCategory);
    })
    .sort((a, b) => (a.distance_mi || 999) - (b.distance_mi || 999));

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
            {/* Recovery Action Plan Button */}
            <Card className="shadow-soft border-primary/20">
              <CardContent className="p-4">
                <Button 
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                  onClick={() => navigate('/preparedness', { state: { activeTab: 'recovery', activeHazard: 'all' } })}
                >
                  <CheckSquare className="mr-2" size={20} />
                  Recovery Action Plan
                </Button>
              </CardContent>
            </Card>

            {/* Search Section */}
            <div className="bg-background shadow-soft p-4">
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter ZIP code or address"
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
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-2">
                        <h3 className="font-semibold text-title">{resource.name}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={() => toggleFavorite(resource)}
                      >
                        <Star 
                          size={16} 
                          className={
                            favorites.has(`${resource.source_id}-${resource.source}`)
                              ? "text-yellow-500 fill-yellow-500" 
                              : "text-muted-foreground hover:text-yellow-500"
                          } 
                        />
                      </Button>
                    </div>
                    
                    {/* Description */}
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                      <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{toTitleCase(resource.description)}</span>
                    </div>

                    {/* Address with distance */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin size={14} className="text-red-500 flex-shrink-0" />
                      <span>
                        {resource.address && resource.city && `${resource.address}, ${resource.city}`}
                        {resource.address && !resource.city && resource.address}
                        {!resource.address && resource.city && resource.city}
                        {(resource.address || resource.city) && ' • '}
                        {resource.distance_mi ? `${resource.distance_mi.toFixed(1)} mi` : 'Distance unknown'}
                      </span>
                    </div>

                    {/* Source badge */}
                    <div className="flex gap-1 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {resource.source}
                      </Badge>
                      {resource.category && (
                        <Badge variant="outline" className="text-xs">
                          {resource.category}
                        </Badge>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {resource.website && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(resource.website.startsWith('http') ? resource.website : `https://${resource.website}`, '_blank')}
                        >
                          <Globe size={16} className="mr-1" />
                          Website
                        </Button>
                      )}
                      {resource.latitude && resource.longitude && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(`https://maps.google.com/maps?q=${resource.latitude},${resource.longitude}`, '_blank')}
                        >
                          <Navigation size={16} className="mr-1" />
                          Directions
                        </Button>
                      )}
                      <SecureContactInfo 
                        resourceId={resource.id} 
                        resourceName={resource.name}
                      />
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