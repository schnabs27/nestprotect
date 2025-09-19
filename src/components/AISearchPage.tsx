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

  // Improved parsing function to match PDF format
  const parseResourceSections = (text: string) => {
    const sections = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentSection = null;
    let currentResources = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a section header (doesn't start with bullet point)
      if (!line.match(/^[•·▪▫*-]\s/) && !line.match(/^\d+\./) && line.length > 3) {
        // Save previous section if it exists
        if (currentSection && currentResources.length > 0) {
          sections.push({
            title: currentSection,
            resources: [...currentResources]
          });
        }
        
        // Start new section - clean up markdown formatting
        currentSection = line
          .replace(/^#+\s*/, '') // Remove markdown headers
          .replace(/\*\*/g, '') // Remove bold formatting
          .replace(/^\*+|\*+$/g, '') // Remove asterisks
          .trim();
        currentResources = [];
      } 
      // Check if this is a bullet point resource
      else if (line.match(/^[•·▪▫*-]\s/) || line.match(/^\d+\./)) {
        const resourceText = line
          .replace(/^[•·▪▫*-]\s*/, '') // Remove bullet points
          .replace(/^\d+\.\s*/, '') // Remove numbers
          .trim();
        
        if (resourceText.length > 5) {
          const resource = parseResourceInfo(resourceText);
          if (resource.name) {
            currentResources.push(resource);
          }
        }
      }
    }
    
    // Don't forget the last section
    if (currentSection && currentResources.length > 0) {
      sections.push({
        title: currentSection,
        resources: currentResources
      });
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
    
    // Split by common delimiters but preserve the text structure
    const parts = text.split(/(?:,|\s{2,}|\s–\s|\s-\s)/);
    
    // First part is usually the name
    if (parts[0]) {
      name = parts[0].trim();
    }
    
    // Look through all parts for specific information
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      
      // Phone number detection (more flexible patterns)
      if (part.match(/(?:phone:|tel:|call:)?\s*\(?[\d\s\-\.\(\)]{10,}\)?/i) || 
          part.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) ||
          part.match(/\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/) ||
          part.match(/1[-.\s]?800[-.\s]?\d{3}[-.\s]?\d{4}/)) {
        contact = part.replace(/^(phone:|tel:|call:)\s*/i, '').trim();
      }
      // Address detection (look for street indicators and TX)
      else if (part.match(/\d+\s+[A-Za-z\s]+(st|ave|rd|blvd|dr|drive|street|avenue|road|boulevard|way|lane|ln|circle|ct|court)/i) ||
               part.includes(' TX ') || part.endsWith(' TX') || part.includes(', TX')) {
        location = part;
      }
      // Website detection
      else if (part.match(/^(www\.|https?:\/\/|\.com|\.org|\.gov)/i)) {
        if (contact && !contact.includes('http')) {
          contact += ` | ${part}`;
        } else if (!contact) {
          contact = part;
        }
      }
      // Everything else goes to description (except the name)
      else if (i > 0 && part.length > 3 && 
               !part.match(/phone:/i) && 
               !part.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
        if (description) {
          description += `, ${part}`;
        } else {
          description = part;
        }
      }
    }
    
    // Clean up description
    if (description) {
      description = description
        .replace(/^[,\s\-–]+/, '')
        .replace(/[,\s\-–]+$/, '')
        .trim();
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
                        <Card key={`${sectionIndex}-${resourceIndex}`} className="shadow-soft hover:shadow-medium transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-primary text-base">
                                {resource.name}
                              </h3>
                              
                              {resource.description && (
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {resource.description}
                                </p>
                              )}
                              
                              <div className="flex flex-col gap-1 text-sm">
                                {resource.location && (
                                  <div className="flex items-start gap-2 text-gray-700">
                                    <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                                    <span>{resource.location}</span>
                                  </div>
                                )}
                                
                                {resource.contact && (
                                  <div className="flex items-start gap-2 text-gray-700">
                                    <Phone size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                                    <span>{resource.contact}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Sources section */}
                {searchResult.search_results && searchResult.search_results.length > 0 && (
                  <Card className="shadow-soft mt-6">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <Globe size={18} />
                        Sources
                      </h3>
                      <div className="space-y-2">
                        {searchResult.search_results.map((source, index) => (
                          <div key={index} className="text-sm">
                            <a 
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 underline font-medium"
                            >
                              {source.title}
                            </a>
                            {source.date && (
                              <span className="text-gray-500 ml-2">
                                ({new Date(source.date).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
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