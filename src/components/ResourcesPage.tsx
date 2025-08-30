import { useState } from "react";
import { Search, MapPin, Star, Phone, Globe, Navigation, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ResourcesPage = () => {
  const [zipCode, setZipCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const mockResources = [
    {
      id: "1",
      name: "American Red Cross Shelter",
      category: "shelter",
      description: "Emergency shelter and relief services for disaster victims",
      phone: "(555) 123-4567",
      website: "redcross.org",
      address: "123 Main St, Springfield, IL",
      distance: 0.8,
      sources: ["Red Cross", "FEMA"],
      isFavorite: false
    },
    {
      id: "2", 
      name: "United Way Food Bank",
      category: "food",
      description: "Emergency food assistance and meal distribution center",
      phone: "(555) 987-6543",
      website: "unitedway.org",
      address: "456 Oak Ave, Springfield, IL",
      distance: 1.2,
      sources: ["211", "Google"],
      isFavorite: true
    }
  ];

  const categories = [
    { id: "all", label: "All", color: "bg-secondary" },
    { id: "shelter", label: "Shelter", color: "bg-coral" },
    { id: "food", label: "Food", color: "bg-yellow" },
    { id: "medical", label: "Medical", color: "bg-accent" },
    { id: "cleanup", label: "Cleanup", color: "bg-primary" },
    { id: "legal", label: "Legal", color: "bg-muted" }
  ];

  const handleSearch = () => {
    if (!zipCode.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 pt-12">
        <h1 className="text-2xl font-bold mb-2">Local Disaster Relief</h1>
        <p className="text-primary-foreground/90 text-sm">
          Find nearby resources within 30 miles
        </p>
      </div>

      {/* Search Section */}
      <div className="p-4 bg-background shadow-soft">
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Enter ZIP code..."
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
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

        {/* Filter Toggle */}
        <Button
          variant="outline" 
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4"
        >
          <Filter size={16} className="mr-2" />
          Filters
        </Button>

        {/* Category Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className={`${category.color} text-white cursor-pointer hover:opacity-80 transition-smooth`}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Search Banner */}
        {isSearching && (
          <div className="bg-yellow/20 border border-yellow/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-foreground font-medium">
              🔍 Searching — thanks for your patience!
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-4">
        {/* Disclaimer */}
        <div className="bg-muted/50 border border-border rounded-lg p-3 mb-4">
          <p className="text-xs text-muted-foreground">
            These listings come from disaster relief databases. Please <strong>call to confirm</strong> they're open.
          </p>
        </div>

        {/* Resource Cards */}
        <div className="space-y-4">
          {mockResources.map((resource) => (
            <Card key={resource.id} className="shadow-soft hover:shadow-medium transition-smooth">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-title">{resource.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Star 
                          size={16} 
                          className={resource.isFavorite ? "fill-yellow text-yellow" : "text-muted-foreground"} 
                        />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin size={12} />
                      <span>{resource.address} • {resource.distance} mi</span>
                    </div>
                  </div>
                </div>

                {/* Source badges */}
                <div className="flex gap-1 mb-3">
                  {resource.sources.map((source) => (
                    <Badge key={source} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone size={16} className="mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Globe size={16} className="mr-1" />
                    Website
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Navigation size={16} className="mr-1" />
                    Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map Toggle */}
        <div className="mt-6 text-center">
          <Button variant="outline" className="w-full">
            <MapPin size={16} className="mr-2" />
            View Map
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;