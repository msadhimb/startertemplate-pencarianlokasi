import React, { useEffect } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import Overlay from "ol/Overlay";
import { FaBars, FaMapMarkerAlt } from "react-icons/fa";
import { IoLocation } from "react-icons/io5";
import { get as getProjection } from "ol/proj";
import { IoMdCloseCircle } from "react-icons/io";

const Maps = (props) => {
  const {
    setSidebarOpen,
    sidebarOpen,
    userMarkerRef,
    startMarkerRef,
    endMarkerRef,
    map,
    setMap,
    mapRef,
    handleClearFeatures,
    startMarkerVisible,
    endMarkerVisible,
    variant,
  } = props;

  useEffect(() => {
    // Initialize map once
    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            // url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            url: `https://api.maptiler.com/maps/${variant}/{z}/{x}/{y}.${
              variant !== "satellite/256" ? "png" : "jpg"
            }?key=${import.meta.env.VITE_APP_MAPTILER_API_KEY}`,
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
        extent: getProjection("EPSG:3857").getExtent(), // Constrain panning
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
  }, [variant]);

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

    return () => {
      if (map) {
        map.getOverlays().clear();
      }
    };
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
      {(startMarkerVisible || endMarkerVisible) && (
        <button
          onClick={handleClearFeatures}
          className="absolute top-4 right-4 z-20 p-1 bg-white text-black rounded-full"
        >
          <IoMdCloseCircle size={25} />
        </button>
      )}
      <div ref={mapRef} className="w-full h-full" />
      <div
        ref={userMarkerRef}
        className="marker hidden absolute w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-md"
      />
      <div
        ref={startMarkerRef}
        className="start-marker hidden absolute w-8 h-8 text-yellow-500"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <FaMapMarkerAlt size={32} />
      </div>
      <div
        ref={endMarkerRef}
        className="end-marker hidden absolute w-8 h-8 text-red-500"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <IoLocation size={32} />
      </div>
    </div>
  );
};

export default Maps;
