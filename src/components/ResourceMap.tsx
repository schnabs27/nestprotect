import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Resource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  distance_mi?: number;
  category?: string;
  source: string;
}

interface ResourceMapProps {
  resources: Resource[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zipCode: string;
}

// Declare global google types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const ResourceMap: React.FC<ResourceMapProps> = ({ resources, open, onOpenChange, zipCode }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapsApiKey, setMapsApiKey] = useState<string>('');
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Get Google Maps API key from Supabase function
  useEffect(() => {
    const getMapsApiKey = async () => {
      if (mapsApiKey || isLoadingApi) return;
      
      setIsLoadingApi(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-maps-api-key');
        if (data?.apiKey) {
          setMapsApiKey(data.apiKey);
        }
      } catch (error) {
        console.error('Error getting Maps API key:', error);
      } finally {
        setIsLoadingApi(false);
      }
    };

    getMapsApiKey();
  }, [mapsApiKey, isLoadingApi]);

  // Load Google Maps script immediately when API key is available
  useEffect(() => {
    if (!mapsApiKey || googleMapsLoaded || window.google?.maps) {
      if (window.google?.maps) setGoogleMapsLoaded(true);
      return;
    }

    const loadGoogleMaps = () => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        setGoogleMapsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=marker&callback=initResourceMap`;
      script.async = true;
      script.defer = true;
      
      // Use a unique callback name to avoid conflicts with WeatherMap
      (window as any).initResourceMap = () => {
        setGoogleMapsLoaded(true);
        delete (window as any).initResourceMap;
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [mapsApiKey, googleMapsLoaded]);

  // Initialize map when dialog opens and Google Maps is loaded
  useEffect(() => {
    if (!open || !googleMapsLoaded || !mapContainer.current || !window.google) return;

    // Default center (Pasadena)
    const defaultCenter = { lat: 34.1672, lng: -118.1535 };
    
    // Initialize map
    const mapInstance = new window.google.maps.Map(mapContainer.current, {
      center: defaultCenter,
      zoom: 11,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    setMap(mapInstance);

    // Add markers for each resource
    if (resources.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      
      resources.forEach((resource) => {
        if (resource.latitude && resource.longitude) {
          const position = { lat: resource.latitude, lng: resource.longitude };
          
          // Get marker color based on category
          const getMarkerColor = (category?: string) => {
            switch (category?.toLowerCase()) {
              case 'food': return '#EAB308'; // yellow
              case 'shelter': return '#F97316'; // orange
              case 'medical': return '#EF4444'; // red
              case 'emergency services': return '#3B82F6'; // blue
              default: return '#06c29a'; // brand green
            }
          };

          // Create marker
          const marker = new window.google.maps.Marker({
            position,
            map: mapInstance,
            title: resource.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: getMarkerColor(resource.category),
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }
          });

          // Create info window content
          const infoContent = `
            <div style="max-width: 250px; padding: 10px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${resource.name}</h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${resource.description}</p>
              ${resource.phone ? `<p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Phone:</strong> ${resource.phone}</p>` : ''}
              ${resource.address ? `<p style="margin: 0 0 8px 0; font-size: 12px;"><strong>Address:</strong> ${resource.address}${resource.city ? `, ${resource.city}` : ''}</p>` : ''}
              <div style="display: flex; gap: 4px; margin-top: 8px;">
                ${resource.phone ? `<button onclick="window.open('tel:${resource.phone}')" style="font-size: 11px; background: #22c55e; color: white; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer;">Call</button>` : ''}
                ${resource.website ? `<button onclick="window.open('${resource.website.startsWith('http') ? resource.website : `https://${resource.website}`}', '_blank')" style="font-size: 11px; background: #3b82f6; color: white; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer;">Website</button>` : ''}
                <button onclick="window.open('https://maps.google.com/maps?q=${resource.latitude},${resource.longitude}', '_blank')" style="font-size: 11px; background: #ef4444; color: white; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer;">Directions</button>
              </div>
            </div>
          `;

          const infoWindow = new window.google.maps.InfoWindow({
            content: infoContent
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });

          bounds.extend(position);
        }
      });

      // Fit map to show all markers
      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds);
        
        // Set max zoom level
        const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
          if (mapInstance.getZoom() > 15) {
            mapInstance.setZoom(15);
          }
          window.google.maps.event.removeListener(listener);
        });
      }
    }

    // Cleanup function
    return () => {
      if (mapInstance) {
        window.google.maps.event.clearInstanceListeners(mapInstance);
      }
    };
  }, [open, googleMapsLoaded, resources]);

  if (!mapsApiKey && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] md:h-[85vh] p-3 md:p-4 flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Resource Map</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center flex-1">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] md:h-[85vh] p-3 md:p-4 flex flex-col">
        <DialogHeader className="pb-1 md:pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
            <MapPin size={18} className="md:hidden" />
            <MapPin size={20} className="hidden md:block" />
            <span className="truncate">
              Disaster Relief Resources {zipCode && `in ${zipCode}`}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative min-h-[400px] mb-2">
          <div 
            ref={mapContainer} 
            className="w-full h-full rounded-lg"
            style={{ minHeight: '400px', height: '100%' }}
          />
          {(!googleMapsLoaded || !mapsApiKey) && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">
                  {!mapsApiKey ? 'Loading map configuration...' : 'Loading Google Maps...'}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground flex-shrink-0">
          Showing {resources.length} resource{resources.length !== 1 ? 's' : ''} • Tap markers for details
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceMap;