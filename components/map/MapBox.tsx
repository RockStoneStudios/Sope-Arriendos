import mapboxgl, { Map } from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';

const MapBox: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false); // Estado para controlar si el mapa ya se ha cargado o no
  const mapRef = useRef<Map | null>(null); // Ref para almacenar la instancia del mapa

  useEffect(() => {
    if (!mapContainer.current || mapLoaded) return; // Verificar si mapContainer.current no es nulo y si el mapa ya se ha cargado

    mapboxgl.accessToken = 'pk.eyJ1Ijoicm9ja3N0b25lc3R1ZGlvcyIsImEiOiJjbG54ZTdzeHcwZjFhMmtxYnV0MXE2MXc3In0.h6YQvb117gDljAeA-GGg7w'; // Reemplaza con tu propio token de acceso

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [-75.743333333, 6.5016666],
      zoom: 14,
    });

    // Agrega marcador
    new mapboxgl.Marker().setLngLat([-75.743333333, 6.50166666]).addTo(map);

    mapRef.current = map; // Almacena la instancia del mapa en la referencia

    setMapLoaded(true); // Marcar el mapa como cargado
  }, [mapLoaded]);
  

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />
  );
}

export default MapBox;
