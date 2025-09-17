import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Phone, Info, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [zipCode, setZipCode] = useState("");
  const [resources, setResources] = useState<DisasterResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<DisasterResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { toast } = useToast();

  // Available categories for filtering
  const availableCategories = [
    'emergency responder',
    'emergency medical', 
    'emergency shelter',
    'disaster relief food assistance',
    'community center',
    'local government disaster resources'
  ];

  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredResources(resources);
    } else {
      const filtered = resources.filter(resource => 
        activeFilters.some(filter => 
          resource.category?.toLowerCase().includes(filter.toLowerCase())
        )
      );
      setFilteredResources(filtered);
    }
  }, [resources, activeFilters]);

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

  const handleFilterToggle = (category: string) => {
    setActiveFilters(prev => 
      prev.includes(category) 
        ? prev.filter(f => f !== category)
        : [...prev, category]
    );
  };

  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-title mb-4">AI-Powered Disaster Resources</h1>
            <p className="text-lg text-muted-foreground">
              Find disaster response resources using AI intelligence
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8 shadow-soft">
            <CardContent className="p-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="zipcode" className="block text-sm font-medium text-title mb-2">
                    ZIP Code
                  </label>
                  <Input
                    id="zipcode"
                    type="text"
                    placeholder="Enter ZIP code (e.g., 12345)"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="text-lg h-12"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  size="lg"
                  className="h-12 px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search AI Resources
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filter Section */}
          {resources.length > 0 && (
            <Card className="mb-6 shadow-soft">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-title mb-3">Filter by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((category) => (
                    <Button
                      key={category}
                      variant={activeFilters.includes(category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterToggle(category)}
                      className="text-sm"
                    >
                      {toTitleCase(category)}
                    </Button>
                  ))}
                </div>
                {activeFilters.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredResources.length} of {resources.length} resources
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          <div className="space-y-3">
            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Searching AI-powered resources...</p>
              </div>
            )}

            {!isLoading && filteredResources.length === 0 && resources.length > 0 && (
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No resources match the selected filters.</p>
                </CardContent>
              </Card>
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

                    {/* Info icon */}
                    {resource.website && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 h-8 w-8"
                        onClick={() => window.open(resource.website, '_blank')}
                        title="View more information"
                      >
                        <Info className="h-4 w-4 text-purple-600" />
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISearchPage;