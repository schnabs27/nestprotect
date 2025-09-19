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

  // Parse the answer text into structured resource sections
  const parseResourceEntries = (text: string) => {
    // Remove summary table (content with pipe delimiters that's not helpful)
    const cleanedText = text.replace(/\|[^\n]*\|[^\n]*\n/g, '').replace(/\|\s*-+\s*\|/g, '');
    
    // Split by section headers (marked with **)
    const sections = cleanedText.split(/\*\*([^*]+)\*\*/g);
    
    const entries = [];
    
    for (let i = 1; i < sections.length; i += 2) {
      const title = sections[i].trim();
      const content = sections[i + 1]?.trim();
      
      if (content && content.length > 50) {
        entries.push({
          title: title,
          content: content
        });
      }
    }
    
    // If no sections found, return the cleaned text as a single entry
    if (entries.length === 0) {
      return [{ title: "Disaster Relief Resources", content: cleanedText.trim() }];
    }
    
    return entries;
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
                {/* Parse and display resources as separate cards */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-title mb-4">Disaster Relief Resources</h3>
                  {parseResourceEntries(searchResult.answer).map((entry, index) => (
                    <Card key={index} className="shadow-soft">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-title mb-3">{entry.title}</h4>
                        <p className="text-body leading-relaxed text-muted-foreground whitespace-pre-line">
                          {entry.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Search results from sources */}
                {searchResult.search_results && searchResult.search_results.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-title">Sources</h3>
                    {searchResult.search_results.map((result, index) => (
                      <div key={index} className="border-l-4 border-primary/30 pl-4 py-2">
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 font-medium underline"
                        >
                          {result.title}
                        </a>
                        {result.date && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.date}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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