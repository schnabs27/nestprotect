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

interface PerplexityResult {
  answer: string;
  search_results: {
    title: string;
    url: string;
    date: string;
  }[];
}

const AISearchPage = () => {
  const navigate = useNavigate();
  const { zipCode: userZipCode, loading: locationLoading } = useUserLocation();
  const { user, isGuest } = useAuth();
  const [zipCode, setZipCode] = useState("");
  const [hasUserClearedField, setHasUserClearedField] = useState(false);
  const [searchResult, setSearchResult] = useState<PerplexityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    setSearchResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-perplexity-resources', {
        body: { requested_zipcode: zipCode.trim() }
      });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      if (data) {
        setSearchResult(data);
        toast({
          title: "Search completed",
          description: `Found disaster relief resources for ZIP ${zipCode.trim()}`
        });
      } else {
        setSearchResult(null);
        toast({
          title: "No resources found",
          description: `No disaster relief resources found for ZIP ${zipCode.trim()}`
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

  // Simple parsing function
  const parseResourceSections = (text: string) => {
    const sections = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSection = null;
    let currentResources = [];
    
    for (const line of lines) {
      const clean = line.trim();
      
      // Section header: doesn't start with bullet and looks like a title
      if (!clean.match(/^[•*-]\s/) && clean.length > 8) {
        if (currentSection && currentResources.length > 0) {
          sections.push({ title: currentSection, resources: currentResources });
        }
        currentSection = clean.replace(/^#+\s*|\**/g, '');
        currentResources = [];
      }
      // Resource item: starts with bullet
      else if (clean.match(/^[•*-]\s/) && clean.length > 10) {
        const resourceText = clean.replace(/^[•*-]\s*/, '');
        const resource = parseResourceInfo(resourceText);
        currentResources.push(resource);
      }
    }
    
    if (currentSection && currentResources.length > 0) {
      sections.push({ title: currentSection, resources: currentResources });
    }
    
    return sections;
  };

  // Helper function to parse individual resource information
  const parseResourceInfo = (text: string) => {
    let name = '';
    let description = '';
    let location = '';
    let contact = '';
    
    // Remove extra formatting
    text = text.replace(/\*\*/g, '').replace(/^\*+|\*+$/g, '').trim();
    
    // Find the first sentence or phrase before a dash, colon, or parenthesis as the name
    const nameMatch = text.match(/^([^:-–(]+?)(?:\s*[-:–(]|\s*$)/);
    if (nameMatch) {
      name = nameMatch[1].trim();
    }
    
    // Extract phone numbers
    const phoneMatches = text.match(/(?:phone:|tel:|call:)?\s*\(?[\d\s\-\.\(\)]{10,}\)?|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s*\d{3}[-.\s]?\d{4}|1[-.\s]?800[-.\s]?\d{3}[-.\s]?\d{4}/gi);
    if (phoneMatches) {
      contact = phoneMatches.map(phone => phone.replace(/^(phone:|tel:|call:)\s*/i, '').trim()).join(', ');
    }
    
    // Extract addresses (look for patterns with TX or street indicators)
    const addressMatch = text.match(/\d+\s+[A-Za-z\s,]+(st|ave|rd|blvd|dr|drive|street|avenue|road|boulevard|way|lane|ln|circle|ct|court)[^,]*(?:,\s*[A-Z]{2}\s*\d{5})?/gi) ||
                        text.match(/[^,]*,\s*TX\s*\d{5}[^,]*/gi);
    if (addressMatch) {
      location = addressMatch[0].trim();
    }
    
    // Everything else is description - remove the name, phone, and address parts
    let remainingText = text;
    if (name) {
      remainingText = remainingText.replace(new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), '').replace(/^[-:–()\s]*/, '');
    }
    if (phoneMatches) {
      phoneMatches.forEach(phone => {
        remainingText = remainingText.replace(new RegExp(phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
      });
    }
    if (addressMatch) {
      remainingText = remainingText.replace(new RegExp(addressMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
    }
    
    // Clean up description
    description = remainingText
      .replace(/^[,\s\-–:()]+/, '')
      .replace(/[,\s\-–:()]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // If description is too short or just punctuation, clear it
    if (description.length < 10 || description.match(/^[,\s\-–:()]*$/)) {
      description = '';
    }
    
    return {
      name: name || 'Resource',
      description: description || '',
      location: location || '',
      contact: contact || ''
    };
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
                Search for publicly announced disaster relief resources in your area.
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter ZIP code"
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
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Search"}
                </Button>
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Searching disaster relief resources...</p>
              </div>
            )}

            {/* Search Results */}
            {searchResult && (
              <div className="space-y-6">
                {parseResourceSections(searchResult.answer).map((section, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-4">
                    <h2 className="text-xl font-bold text-title border-b border-gray-200 pb-2">
                      {section.title}
                    </h2>
                    <div className="grid gap-3">
                      {section.resources.map((resource, resourceIndex) => (
                        <Card key={`${sectionIndex}-${resourceIndex}`} className="shadow-soft">
                          <CardContent className="p-3">
                            <h3 className="font-semibold text-primary mb-1">{resource.name}</h3>
                            {resource.description && <p className="text-xs text-gray-500 mb-2">{resource.description}</p>}
                            {resource.location && <p className="text-sm text-gray-700 mb-1">📍 {resource.location}</p>}
                            {resource.contact && <p className="text-sm text-gray-700">📞 {resource.contact}</p>}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!searchResult && !isLoading && (
              <div className="text-center py-12">
                <Search className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-muted-foreground">
                  Enter a ZIP code and press "Search" to find disaster relief resources
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AISearchPage;