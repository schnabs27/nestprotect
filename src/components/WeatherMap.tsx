import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherMapProps {
  location: string;
  className?: string;
  mapType?: 'weather' | 'traffic';
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const WeatherMap = ({ location, className = "", mapType = 'weather' }: WeatherMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch the Maps API key from Supabase edge function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-maps-api-key');
        
        if (error) {
          console.error('Error fetching Maps API key:', error);
          setError('Failed to load map configuration');
          return;
        }
        
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        } else {
          setError('Maps API key not available');
        }
      } catch (err) {
        console.error('Error calling get-maps-api-key function:', err);
        setError('Failed to load map configuration');
      }
    };

    fetchApiKey();
  }, []);

  // Load Google Maps when API key is available
  useEffect(() => {
    if (!apiKey) return;
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Create the script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Set up the callback
      window.initMap = () => {
        setMapLoaded(true);
        initializeMap();
      };

      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
        delete window.initMap;
      };
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      // Initialize the map
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 39.7817, lng: -89.6501 }, // Springfield, IL default
        mapTypeId: 'roadmap',
        styles: mapType === 'weather' ? [
          {
            featureType: 'all',
            stylers: [{ saturation: -10 }, { lightness: 10 }]
          }
        ] : undefined
      });

      // Add layers based on map type
      if (mapType === 'weather') {
        addWeatherMarkers();
      } else if (mapType === 'traffic') {
        addTrafficLayer();
      }
    };

    const addWeatherMarkers = () => {
      if (!mapInstance.current || !window.google) return;

      // Mock weather data points
      const weatherPoints = [
        { lat: 39.7817, lng: -89.6501, condition: 'Partly Cloudy', temp: 72 },
        { lat: 39.8, lng: -89.7, condition: 'Sunny', temp: 75 },
        { lat: 39.75, lng: -89.6, condition: 'Cloudy', temp: 70 },
      ];

      weatherPoints.forEach((point) => {
        const marker = new window.google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map: mapInstance.current,
          title: `${point.temp}°F - ${point.condition}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="2"/>
                <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${point.temp}°</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <strong>${point.temp}°F</strong><br/>
              ${point.condition}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance.current, marker);
        });
      });
    };

    const addTrafficLayer = () => {
      if (!mapInstance.current || !window.google) return;

      // Add Google's traffic layer
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(mapInstance.current);
    };

    loadGoogleMaps();
  }, [apiKey, mapType]); // Depend on apiKey and mapType

  // Geocode location when it changes
  useEffect(() => {
    if (!mapInstance.current || !window.google || !location) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const newCenter = results[0].geometry.location;
        mapInstance.current.setCenter(newCenter);
        mapInstance.current.setZoom(10);
      }
    });
  }, [location, mapLoaded]);

  return (
    <div className={`relative ${className}`}>
      {error ? (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <p className="text-sm text-destructive mb-2">⚠️ Map Error</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <div 
            ref={mapRef} 
            className="w-full h-full min-h-[300px] rounded-lg"
            style={{ minHeight: '300px' }}
          />
          {(!mapLoaded || !apiKey) && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  {!apiKey ? 'Loading map configuration...' : 'Loading weather map...'}
                </p>
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded text-xs text-muted-foreground">
            {mapType === 'weather' ? 'Weather conditions and radar' : 'Live traffic conditions'}
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherMap;