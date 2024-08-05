import React, { useEffect, useRef, useState } from 'react';
import Maps from '../components/Maps';
import Sidebar from '../components/Sidebar';
import { fromLonLat } from 'ol/proj';
import { Overlay } from 'ol';
import { LineString } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import polyline from 'polyline';
import { useForm } from 'react-hook-form';

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
  const [variant, setVariant] = useState('streets');

  return (
    <>
      <h1>This is React Vite</h1>
    </>
  );
};

export default Home;
