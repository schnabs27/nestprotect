import React, { useEffect, useRef, useState } from 'react';

interface WeatherMapProps {
  location: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const WeatherMap = ({ location, className = "" }: WeatherMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Create the script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&callback=initMap`;
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
        styles: [
          {
            featureType: 'all',
            stylers: [{ saturation: -10 }, { lightness: 10 }]
          }
        ]
      });

      // Add weather layer (this would typically require a weather API)
      // For demonstration, we'll add some mock weather markers
      addWeatherMarkers();
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

    loadGoogleMaps();
  }, []);

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
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[300px] rounded-lg"
        style={{ minHeight: '300px' }}
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading weather map...</p>
          </div>
        </div>
      )}
      <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded text-xs text-muted-foreground">
        Weather conditions and radar
      </div>
    </div>
  );
};

export default WeatherMap;