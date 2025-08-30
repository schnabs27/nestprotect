import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, MapPin, Phone, Globe, Navigation } from "lucide-react";
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

const ResourceMap: React.FC<ResourceMapProps> = ({ resources, open, onOpenChange, zipCode }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  // Get Mapbox token from Supabase function
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Error getting Mapbox token:', error);
      }
    };

    if (open) {
      getMapboxToken();
    }
  }, [open]);

  // Initialize map when dialog opens and token is available
  useEffect(() => {
    if (!open || !mapContainer.current || !mapboxToken) return;

    // Set Mapbox access token
    mapboxgl.accessToken = mapboxToken;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      zoom: 11,
      center: [-118.1535, 34.1672], // Default to Pasadena coordinates
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for each resource
    if (resources.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      resources.forEach((resource) => {
        if (resource.latitude && resource.longitude) {
          // Create marker color based on category
          const getMarkerColor = (category?: string) => {
            switch (category?.toLowerCase()) {
              case 'food': return '#EAB308'; // yellow
              case 'shelter': return '#F97316'; // orange
              case 'medical': return '#EF4444'; // red
              case 'emergency services': return '#3B82F6'; // blue
              default: return '#06c29a'; // brand green
            }
          };

          // Create custom marker element
          const markerEl = document.createElement('div');
          markerEl.className = 'resource-marker';
          markerEl.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: ${getMarkerColor(resource.category)};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
          `;

          // Create popup content
          const popupContent = `
            <div class="p-3 min-w-[250px]">
              <h3 class="font-semibold text-sm mb-2">${resource.name}</h3>
              <p class="text-xs text-gray-600 mb-2">${resource.description}</p>
              ${resource.phone ? `<p class="text-xs mb-1"><span class="font-medium">Phone:</span> ${resource.phone}</p>` : ''}
              ${resource.address ? `<p class="text-xs mb-2"><span class="font-medium">Address:</span> ${resource.address}${resource.city ? `, ${resource.city}` : ''}</p>` : ''}
              <div class="flex gap-1 mt-2">
                ${resource.phone ? `<button onclick="window.open('tel:${resource.phone}')" class="text-xs bg-green-500 text-white px-2 py-1 rounded">Call</button>` : ''}
                ${resource.website ? `<button onclick="window.open('${resource.website.startsWith('http') ? resource.website : `https://${resource.website}`}', '_blank')" class="text-xs bg-blue-500 text-white px-2 py-1 rounded">Website</button>` : ''}
                <button onclick="window.open('https://maps.google.com/maps?q=${resource.latitude},${resource.longitude}', '_blank')" class="text-xs bg-red-500 text-white px-2 py-1 rounded">Directions</button>
              </div>
            </div>
          `;

          // Create popup
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false
          }).setHTML(popupContent);

          // Create marker
          const marker = new mapboxgl.Marker(markerEl)
            .setLngLat([resource.longitude, resource.latitude])
            .setPopup(popup)
            .addTo(map.current!);

          markers.current.push(marker);
          bounds.extend([resource.longitude, resource.latitude]);
        }
      });

      // Fit map to show all markers
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [open, mapboxToken, resources]);

  if (!mapboxToken && open) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[85vh] md:h-[80vh] p-3 md:p-6">
        <DialogHeader className="pb-2 md:pb-4">
            <DialogTitle>Resource Map</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[85vh] md:h-[80vh] p-3 md:p-6">
        <DialogHeader className="pb-2 md:pb-4">
          <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
            <MapPin size={18} className="md:hidden" />
            <MapPin size={20} className="hidden md:block" />
            <span className="truncate">
              Disaster Relief Resources {zipCode && `in ${zipCode}`}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative min-h-0">
          <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
          {resources.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">No resources to display on map</p>
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground pt-2 md:pt-0">
          Showing {resources.length} resource{resources.length !== 1 ? 's' : ''} • Tap markers for details
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceMap;