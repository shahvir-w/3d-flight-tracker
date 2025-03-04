import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './styles/Globe.module.css';
import planeIconImage from '../assets/Plane-Icon.svg';

const Globe = ({ flightData }: { flightData: any }) => {
  const targetFlight = flightData.updatedTargetFlight;
  const planeLat = targetFlight.latitude;
  const planeLng = targetFlight.longitude;
  const departureLat = targetFlight.departure_city.lat;
  const departureLng = targetFlight.departure_city.lng;
  const arrivalLat = targetFlight.arrival_city.lat;
  const arrivalLng = targetFlight.arrival_city.lng;
  const heading = targetFlight.heading;
  const waypointCoordinates = targetFlight.waypoints || [];

  const adjustedPlaneLat = planeLat ? Math.max(-30, Math.min(30, planeLat + 30)) : Math.max(-30, Math.min(30, arrivalLat + 30));

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/s3wahab/cm6qbho3l006y01qo3cpf2u2u',
        center: planeLat && planeLng ? [planeLng, adjustedPlaneLat] : [arrivalLng, Math.max(-30, Math.min(30, arrivalLat + 30))],
        zoom: 2.5,
        projection: 'globe',
        attributionControl: false,
      });

      // Add Departure Marker
      new mapboxgl.Marker({ color: '#d8e900', rotation: 0 })
        .setLngLat([departureLng, departureLat])
        .addTo(mapRef.current);

      // Add Arrival Marker
      new mapboxgl.Marker({ color: '#d8e900', rotation: 0 })
        .setLngLat([arrivalLng, arrivalLat])
        .addTo(mapRef.current);

      if (planeLat && planeLng) {
        // Add Custom Plane Marker
        const planeIcon = document.createElement('div');
        planeIcon.className = styles.planeIcon;
        planeIcon.style.backgroundImage = `url(${planeIconImage})`;

        new mapboxgl.Marker(planeIcon)
          .setLngLat([planeLng, planeLat])
          .addTo(mapRef.current)
          .setRotation(heading - 90);
      }

      if (waypointCoordinates.length > 0) {
        // Add Line from Departure to Plane using Waypoints
        mapRef.current.on('load', () => {
          mapRef.current!.addSource('flight-path', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: waypointCoordinates,
              },
            },
          });

          mapRef.current!.addLayer({
            id: 'flight-path-line',
            type: 'line',
            source: 'flight-path',
            paint: {
              'line-color': '#969c65',
              'line-width': 8,
              'line-blur': 5,
              'line-dasharray': [2, 2]
            },
          });
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [flightData]);

  return <div id="map-container" ref={mapContainerRef} className={styles.mapContainer} />;
};

export default Globe;
