import React, { useEffect, useRef, useState } from "react";
import Maps from "../components/Maps";
import Sidebar from "../components/Sidebar";
import { fromLonLat } from "ol/proj";
import { Overlay } from "ol";
import { LineString } from "ol/geom";
import { Feature } from "ol";
import { Style, Stroke } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { getRoute } from "../fetchApi";
import polyline from "polyline";
import { useForm } from "react-hook-form";

const Home = () => {
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null); // Blue marker for user's location
  const startMarkerRef = useRef(null); // Start location marker
  const endMarkerRef = useRef(null); // End location marker

  const [map, setMap] = useState(null);
  const [routeLayer, setRouteLayer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStartMarkerVisible, setIsStartMarkerVisible] = useState(false);
  const [isEndMarkerVisible, setIsEndMarkerVisible] = useState(false);
  const [variant, setVariant] = useState("streets");

  const defaultValues = {
    from: "",
    to: "",
  };

  const {
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: defaultValues,
    mode: "onChange",
  });

  const fetchRoute = async (from, to) => {
    const data = await getRoute(from, to);

    // Check if route data is available
    if (data.routes && data.routes.length > 0) {
      const encodedPolyline = data.routes[0].geometry;
      const decodedCoordinates = polyline.decode(encodedPolyline);
      return decodedCoordinates;
    } else {
      console.error("No route found or route data is invalid");
      return null;
    }
  };

  const handleLocationSelect = async ({ from, to }) => {
    if (!map) return;

    // Hapus semua overlay dan layer yang ada
    map.getOverlays().forEach((overlay) => {
      if (overlay?.getElement() !== userMarkerRef.current) {
        map.removeOverlay(overlay);
      }
    });

    if (routeLayer) {
      map.removeLayer(routeLayer);
      setRouteLayer(null);
    }

    const fromCoords = fromLonLat([from.lon, from.lat]);
    const toCoords = fromLonLat([to.lon, to.lat]);

    // Tambahkan start marker
    const startMarkerElement = startMarkerRef.current;
    if (startMarkerElement) {
      const startMarkerOverlay = new Overlay({
        position: fromCoords,
        positioning: "center-center",
        element: startMarkerElement,
        stopEvent: false,
      });

      map.addOverlay(startMarkerOverlay);
      startMarkerElement.style.display = "block";
    } else {
      console.error("Start marker element is not available.");
    }

    // Tambahkan end marker
    const endMarkerElement = endMarkerRef.current;
    if (endMarkerElement) {
      const endMarkerOverlay = new Overlay({
        position: toCoords,
        positioning: "center-center",
        element: endMarkerElement,
        stopEvent: false,
      });

      map.addOverlay(endMarkerOverlay);
      endMarkerElement.style.display = "block";
    } else {
      console.error("End marker element is not available.");
    }

    // Ambil dan tambahkan rute
    const routeCoordinates = await fetchRoute(from, to);
    if (routeCoordinates) {
      const coordinates = routeCoordinates.map((coord) =>
        fromLonLat([coord[1], coord[0]])
      );
      const routeLine = new LineString(coordinates);
      const routeFeature = new Feature({
        geometry: routeLine,
      });

      routeFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "#3b82f6",
            width: 4,
          }),
        })
      );

      const vectorSource = new VectorSource({
        features: [routeFeature],
      });
      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      map.addLayer(vectorLayer);
      setRouteLayer(vectorLayer);

      // Sesuaikan tampilan peta untuk menampilkan rute
      map.getView().fit(routeLine.getExtent(), {
        padding: [20, 20, 20, 20],
        duration: 2000,
      });
      setIsStartMarkerVisible(true);
      setIsEndMarkerVisible(true);
    } else {
      console.error("Gagal mendapatkan koordinat rute");
    }
  };

  const handleClearFeatures = () => {
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    // Clear markers
    if (startMarkerRef.current) {
      startMarkerRef.current.style.display = "none";
      setIsStartMarkerVisible(false);
    }

    if (endMarkerRef.current) {
      endMarkerRef.current.style.display = "none";
      setIsEndMarkerVisible(false);
    }

    // Center map on user's location
    map.getView().animate({ zoom: 0, duration: 2000 });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setValue("from", {
        label: "Your Location",
        value: `${latitude},${longitude}`,
      });
    });
  }, []);

  return (
    <>
      <Maps
        setSidebarOpen={setSidebarOpen}
        sidebarOpen={sidebarOpen}
        mapRef={mapRef}
        userMarkerRef={userMarkerRef}
        startMarkerRef={startMarkerRef}
        endMarkerRef={endMarkerRef}
        setMap={setMap}
        map={map}
        handleClearFeatures={handleClearFeatures}
        startMarkerVisible={isStartMarkerVisible}
        endMarkerVisible={isEndMarkerVisible}
        variant={variant}
      />
      <Sidebar
        onFindRoute={handleLocationSelect}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
        control={control}
        watch={watch}
        reset={reset}
        setVariant={setVariant}
        variant={variant}
      />
    </>
  );
};

export default Home;
