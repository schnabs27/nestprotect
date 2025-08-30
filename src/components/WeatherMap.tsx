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
  const trafficLayerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch the Maps API key from Supabase edge function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        console.log('Fetching Maps API key...');
        console.log('Current domain:', window.location.hostname);
        console.log('Current URL:', window.location.href);
        
        const { data, error } = await supabase.functions.invoke('get-maps-api-key');
        
        if (error) {
          console.error('Error fetching Maps API key:', error);
          setError('Failed to load map configuration');
          return;
        }
        
        if (data?.apiKey) {
          console.log('Maps API key received successfully');
          setApiKey(data.apiKey);
        } else {
          console.error('Maps API key not available in response');
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
      // Check if already loaded
      if (window.google && window.google.maps) {
        console.log('Google Maps already loaded, initializing...');
        setTimeout(() => initializeMap(), 100);
        return;
      }

      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already exists, waiting for load...');
        existingScript.addEventListener('load', () => {
          setTimeout(() => initializeMap(), 100);
        });
        return;
      }

      // Create new script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initMap&v=weekly`;
      script.async = true;
      script.defer = true;

      // Set up global callback
      window.initMap = () => {
        console.log('Google Maps callback triggered');
        setTimeout(() => initializeMap(), 100);
      };

      script.onload = () => {
        console.log('Google Maps script loaded successfully');
      };

      script.onerror = (error) => {
        console.error('Error loading Google Maps script:', error);
        setError('Failed to load Google Maps script');
      };

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      console.log('Initializing map...', { 
        mapRef: !!mapRef.current, 
        google: !!window.google,
        mapType,
        domain: window.location.hostname
      });
      
      if (!mapRef.current) {
        console.error('Map container not found');
        setError('Map container not found');
        return;
      }
      
      if (!window.google) {
        console.error('Google Maps not loaded');
        setError('Google Maps API not loaded');
        return;
      }

      try {
        // Initialize the map with additional options for better error handling
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          zoom: 10,
          center: { lat: 39.7817, lng: -89.6501 }, // Springfield, IL default
          mapTypeId: 'roadmap',
          gestureHandling: 'cooperative',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          styles: mapType === 'weather' ? [
            {
              featureType: 'all',
              stylers: [{ saturation: -10 }, { lightness: 10 }]
            }
          ] : undefined
        });

        console.log('Map initialized successfully');
        setMapLoaded(true);

        // Add event listeners for map errors
        mapInstance.current.addListener('idle', () => {
          console.log('Map is idle (finished loading)');
        });

        // Add layers based on map type
        if (mapType === 'weather') {
          addWeatherMarkers();
        } else if (mapType === 'traffic') {
          addTrafficLayer();
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setError(`Failed to initialize map: ${error.message}`);
      }
    };

    loadGoogleMaps();
  }, [apiKey, mapType]); // Depend on apiKey and mapType

  // Helper function to add weather markers
  const addWeatherMarkers = () => {
    if (!mapInstance.current || !window.google) return;

    // Get map center for weather data
    const center = mapInstance.current.getCenter();
    if (!center) return;

    // Mock weather data points around the center - NOTE: This is demo data
    const weatherPoints = [
      { 
        lat: center.lat(), 
        lng: center.lng(), 
        condition: 'Current Location', 
        temp: 'N/A',
        note: 'Real weather data integration needed'
      },
      { 
        lat: center.lat() + 0.02, 
        lng: center.lng() + 0.02, 
        condition: 'Demo Data', 
        temp: '72',
        note: 'This is sample data'
      },
      { 
        lat: center.lat() - 0.02, 
        lng: center.lng() - 0.02, 
        condition: 'Mock Data', 
        temp: '68',
        note: 'Connect to weather API for real data'
      },
    ];

    weatherPoints.forEach((point) => {
      // Always use legacy Marker to avoid Map ID requirement
      const marker = new window.google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: mapInstance.current,
        title: `${point.temp}°F - ${point.condition}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#e11d48" stroke="white" stroke-width="2"/>
              <text x="20" y="15" text-anchor="middle" fill="white" font-size="10" font-weight="bold">DEMO</text>
              <text x="20" y="27" text-anchor="middle" fill="white" font-size="8">${point.temp}°</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <strong>⚠️ Demo Weather Data</strong><br/>
            <em>Temperature: ${point.temp}°F</em><br/>
            <small>${point.note}</small>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker);
      });
    });
  };

  // Helper function to add traffic layer
  const addTrafficLayer = () => {
    if (!mapInstance.current || !window.google) return;

    console.log('Adding traffic layer...');
    
    // Remove existing traffic layer if it exists
    if (trafficLayerRef.current) {
      trafficLayerRef.current.setMap(null);
    }

    // Add Google's traffic layer
    trafficLayerRef.current = new window.google.maps.TrafficLayer();
    trafficLayerRef.current.setMap(mapInstance.current);
    console.log('Traffic layer added successfully');
  };

  // Geocode location when it changes
  useEffect(() => {
    if (!mapInstance.current || !window.google || !location || !mapLoaded) return;

    console.log('Geocoding location:', location, 'mapType:', mapType);
    
    // Check if location is already coordinates (lat,lng format)
    const coordsMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      console.log('Using coordinates directly:', { lat, lng });
      mapInstance.current.setCenter({ lat, lng });
      mapInstance.current.setZoom(12);
      
      // Refresh layers for the new location
      setTimeout(() => {
        if (mapType === 'weather') {
          addWeatherMarkers();
        } else if (mapType === 'traffic') {
          addTrafficLayer(); // Refresh traffic layer for new location
        }
      }, 500);
      
      return;
    }

    // Otherwise geocode the address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const newCenter = results[0].geometry.location;
        console.log('Geocoded location:', location, 'to:', newCenter.toJSON());
        mapInstance.current.setCenter(newCenter);
        mapInstance.current.setZoom(12);
        
        // Refresh layers for the new location
        setTimeout(() => {
          if (mapType === 'weather') {
            addWeatherMarkers();
          } else if (mapType === 'traffic') {
            console.log('Refreshing traffic layer for new location');
            addTrafficLayer(); // Refresh traffic layer for new location
          }
        }, 500);
      } else {
        console.error('Geocoding failed:', status, 'for location:', location);
      }
    });
  }, [location, mapLoaded, mapType]);

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
            className="w-full h-full min-h-[300px] rounded-lg bg-muted"
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