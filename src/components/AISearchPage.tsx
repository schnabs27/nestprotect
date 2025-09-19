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

  // Parse the answer text into sections and resources
  const parseResourceSections = (text: string) => {
    const sections = [];
    
    // Split by section headers (lines that don't start with bullet points)
    const lines = text.split('\n');
    let currentSection = null;
    let currentResources = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Check if this is a section header (not a bullet point)
      if (!trimmedLine.match(/^[-•*]\s/) && !trimmedLine.match(/^\s+[-•*]\s/) && trimmedLine.length > 10 && !trimmedLine.includes(':')) {
        // Save previous section if it exists
        if (currentSection) {
          sections.push({
            title: currentSection,
            resources: currentResources
          });
        }
        
        // Start new section - remove ## markdown formatting
        currentSection = trimmedLine.replace(/^#+\s*/, '').replace(/^\*+|\*+$/g, '').trim();
        currentResources = [];
      } else if (trimmedLine.match(/^[-•*]\s/) || trimmedLine.match(/^\s+[-•*]\s/)) {
        // This is a bullet point resource
        const resourceText = trimmedLine.replace(/^[-•*]\s/, '').replace(/^\s+[-•*]\s/, '').trim();
        
        if (resourceText.length > 10) {
          // Parse individual resource
          // Find the first sentence or clause as the name
          let name = '';
          let description = '';
          
          // Look for patterns that indicate end of name (like " - " or " – ")
          const nameEndMatch = resourceText.match(/^([^–\-]+?)(?:\s*[–\-]\s*(.+))?$/);
          if (nameEndMatch) {
            name = nameEndMatch[1].trim().replace(/^\*+|\*+$/g, '').trim();
            description = nameEndMatch[2] ? nameEndMatch[2].trim() : '';
          } else {
            // Fall back to first part before comma or semicolon
            const parts = resourceText.split(/[,;]/);
            name = parts[0]?.trim().replace(/^\*+|\*+$/g, '').trim() || '';
            if (parts.length > 1) {
              description = parts.slice(1).join(', ').trim();
            }
          }
          
          let location = '';
          let contact = '';
          
          // Extract address and phone patterns from the full text
          const allParts = resourceText.split(/[,;]|\s{2,}/);
          for (const part of allParts) {
            const trimmedPart = part.trim();
            if (trimmedPart.match(/\d+\s.*(?:St|Ave|Rd|Blvd|Drive|Dr|Way|Lane|Ln)/i) || trimmedPart.includes('TX')) {
              location = trimmedPart;
            } else if (trimmedPart.match(/\(?\d{3}\)?\s*[-.]?\s*\d{3}\s*[-.]?\s*\d{4}/) || trimmedPart.startsWith('Phone:')) {
              contact = trimmedPart.replace('Phone:', '').trim();
            }
          }
          
          // Clean up description
          description = description
            .replace(/^\*+|\*+$/g, '')
            .replace(/\*\*/g, '')
            .replace(/^[,\s-]+/, '')
            .trim();
          
          // Filter out meaningless descriptions
          if (description === '**' || description === '*' || description.length < 10) {
            description = '';
          }
          
          currentResources.push({
            name: name,
            location: location,
            contact: contact,
            description: description
          });
        }
      }
    }
    
    // Don't forget the last section
    if (currentSection) {
      sections.push({
        title: currentSection,
        resources: currentResources
      });
    }
    
    return sections;
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
                {/* Display sections with resources */}
                {parseResourceSections(searchResult.answer).map((section, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-4">
                    <h2 className="text-xl font-bold text-title">{section.title}</h2>
                    {section.resources.map((resource, resourceIndex) => {
                      // Find matching source URL for this resource
                      const sourceUrl = searchResult.search_results?.[resourceIndex % searchResult.search_results.length]?.url || '';
                      
                      return (
                        <Card key={`${sectionIndex}-${resourceIndex}`} className="shadow-soft">
                          <CardContent className="p-4 space-y-2">
                            <h3 className="text-base font-semibold text-primary">{resource.name}</h3>
                            {resource.description && resource.description !== '**' && resource.description.trim() !== '' && (
                              <p className="text-sm font-normal text-muted-foreground">{resource.description}</p>
                            )}
                            {resource.location && (
                              <p className="text-sm text-muted-foreground">📍 {resource.location}</p>
                            )}
                            {resource.contact && (
                              <p className="text-sm text-muted-foreground">📞 {resource.contact}</p>
                            )}
                            {sourceUrl && (
                              <a 
                                href={sourceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:text-primary/80 underline block mt-2"
                              >
                                View Source
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!searchResult && !isLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Enter a ZIP code and press "Search" to find disaster relief resources</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AISearchPage;