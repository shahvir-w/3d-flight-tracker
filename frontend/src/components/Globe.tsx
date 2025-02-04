import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import styles from './styles/Globe.module.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiczN3YWhhYiIsImEiOiJjbTZxNG9sbTcxbXZlMmpvcW5wdXc5M2V0In0.CEoNBERq7jfm0dSCHYqomg';

const Globe = () => {
    return (
      <div className={styles.globeContainer}>
        <div className={styles.rectangle}>
          <p>Map is temporarily unavailable. Please check back later.</p>
        </div>
      </div>
    );
  };
/*
  const globeContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!globeContainer.current) return;

    map.current = new mapboxgl.Map({
      container: globeContainer.current,
      style: 'mapbox://styles/s3wahab/cm6qbho3l006y01qo3cpf2u2u/draft',
      center: [-72, 20],
      zoom: 2,
      projection: 'globe'
    });

    map.current.on('style.load', () => {
      map.current?.setFog({}); 
    });

    return () => map.current?.remove();
  }, []);

  return <div ref={globeContainer} className={styles.globeContainer}></div>;
};
*/

export default Globe;