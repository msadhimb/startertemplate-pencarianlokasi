import React, { useRef, useEffect, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";
import Overlay from "ol/Overlay";
import { LineString } from "ol/geom";
import { Feature } from "ol";
import { Style, Stroke } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Sidebar from "../Sidebar";
import { FaBars, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import polyline from "polyline";

const MapComponent = () => {
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null); // Blue marker for user's location
  const startMarkerRef = useRef(null); // Start location marker
  const endMarkerRef = useRef(null); // End location marker
  const [map, setMap] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routeLayer, setRouteLayer] = useState(null);

  useEffect(() => {
    // Initialize map once
    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
      controls: [], // Disable all default controls
    });

    setMap(mapInstance);

    // Cleanup function
    return () => {
      if (mapInstance) {
        mapInstance.setTarget(null);
      }
    };
  }, []);

  useEffect(() => {
    if (map) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const coords = fromLonLat([longitude, latitude]);

        // Create and add user marker
        const userMarkerElement = userMarkerRef.current;
        const userMarkerOverlay = new Overlay({
          position: coords,
          positioning: "center-center",
          element: userMarkerElement,
          stopEvent: false,
        });

        map.addOverlay(userMarkerOverlay);
        userMarkerElement.style.display = "block";

        // Center map on user's location
        map.getView().animate({ center: coords, zoom: 10, duration: 2000 });
      });
    }
  }, [map]);

  useEffect(() => {
    const handleDeviceOrientation = (event) => {
      const alpha = event.alpha;
      if (userMarkerRef.current) {
        userMarkerRef.current.style.transform = `translate(-50%, -50%) rotate(${alpha}deg)`;
      }
    };

    window.addEventListener("deviceorientation", handleDeviceOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, []);

  const fetchRoute = async (from, to) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full`
      );
      const data = await response.json();

      // Debug: Log the API response
      console.log("Route data:", data);

      // Check if route data is available
      if (data.routes && data.routes.length > 0) {
        const encodedPolyline = data.routes[0].geometry;
        const decodedCoordinates = polyline.decode(encodedPolyline);
        return decodedCoordinates;
      } else {
        console.error("No route found or route data is invalid");
        return null;
      }
    } catch (error) {
      console.error("Error fetching route", error);
      return null;
    }
  };

  const handleLocationSelect = async ({ from, to }) => {
    const fromCoords = fromLonLat([from.lon, from.lat]);
    const toCoords = fromLonLat([to.lon, to.lat]);

    // Add start marker
    const startMarkerElement = startMarkerRef.current;
    const startMarkerOverlay = new Overlay({
      position: fromCoords,
      positioning: "center-center",
      element: startMarkerElement,
      stopEvent: false,
    });

    map.addOverlay(startMarkerOverlay);
    startMarkerElement.style.display = "block";

    // Add end marker
    const endMarkerElement = endMarkerRef.current;
    const endMarkerOverlay = new Overlay({
      position: toCoords,
      positioning: "center-center",
      element: endMarkerElement,
      stopEvent: false,
    });

    map.addOverlay(endMarkerOverlay);
    endMarkerElement.style.display = "block";

    // Remove existing route layer if it exists
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    // Fetch and add route
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
            color: "#FF0000",
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

      // Adjust view to fit the route
      map.getView().fit(routeLine.getExtent(), {
        padding: [20, 20, 20, 20],
        duration: 2000,
      });
    } else {
      console.error("Failed to get route coordinates");
    }
  };

  return (
    <div className="relative w-full h-screen">
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-20 p-2 bg-white text-black rounded"
        >
          <FaBars />
        </button>
      )}

      <Sidebar
        onLocationSelect={handleLocationSelect}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
      />
      <div ref={mapRef} className="w-full h-full" />
      <div
        ref={userMarkerRef}
        className="marker hidden absolute w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-md"
      />
      <div
        ref={startMarkerRef}
        className="start-marker hidden absolute w-8 h-8 text-green-500"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <FaMapMarkerAlt size={32} />
      </div>
      <div
        ref={endMarkerRef}
        className="end-marker hidden absolute w-8 h-8 text-red-500"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <FaMapMarkerAlt size={32} />
      </div>
    </div>
  );
};

export default MapComponent;
