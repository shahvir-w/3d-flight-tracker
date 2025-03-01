import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './styles/Globe.module.css';
import planeIconImage from '../assets/Plane-Icon.svg'; // Corrected import path for the image

const Globe = ({ flightData }: { flightData: any }) => {
  const targetFlight = flightData.updatedTargetFlight;
  const planeLat = targetFlight.latitude;
  const planeLng = targetFlight.longitude;
  const departureLat = targetFlight.departure_city.lat;
  const departureLng = targetFlight.departure_city.lng;
  const arrivalLat = targetFlight.arrival_city.lat;
  const arrivalLng = targetFlight.arrival_city.lng;


  const adjustedPlaneLat = Math.max(-30, Math.min(30, planeLat + 30));
  const adjustedArrivalLat = Math.max(-30, Math.min(30, arrivalLat + 30));

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  
  const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const rad = Math.PI / 180;
    const dLng = (lng2 - lng1) * rad;
    lat1 *= rad;
    lat2 *= rad;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    let bearing = Math.atan2(y, x) / rad;
    bearing = (bearing + 180) % 360;
    return bearing;
  };

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiczN3YWhhYiIsImEiOiJjbTZxNG9sbTcxbXZlMmpvcW5wdXc5M2V0In0.CEoNBERq7jfm0dSCHYqomg';

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/s3wahab/cm6qbho3l006y01qo3cpf2u2u',
        center: planeLat? [planeLng, adjustedPlaneLat] : [arrivalLng, adjustedArrivalLat],
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
      
      const bearing = calculateBearing(departureLat, departureLng, planeLat, planeLng);
      console.log(bearing);
      
      // Add Custom Plane Marker
      const planeIcon = document.createElement('div');
      planeIcon.className = styles.planeIcon;
      planeIcon.style.backgroundImage = `url(${planeIconImage})`; // Use the imported image
      planeIcon.style.transform = `rotate(${bearing}deg)`;

      new mapboxgl.Marker(planeIcon)
        .setLngLat([planeLng, planeLat])
        .addTo(mapRef.current)
        .setRotation(bearing);
    }
    // Cleanup the map instance on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [flightData]);

  return <div id="map-container" ref={mapContainerRef} className={styles.mapContainer} />;
};

export default Globe;