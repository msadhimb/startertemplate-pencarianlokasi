import React, { useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { FaBars, FaMapMarkerAlt } from 'react-icons/fa';
import { IoLocation } from 'react-icons/io5';
import { get as getProjection } from 'ol/proj';
import { IoMdCloseCircle } from 'react-icons/io';

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

  return <div className="relative w-full h-screen"></div>;
};

export default Maps;
