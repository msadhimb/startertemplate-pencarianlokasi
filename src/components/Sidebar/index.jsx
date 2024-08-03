// Sidebar.js
import React, { useState, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import { IoMdClose } from "react-icons/io";
import debounce from "lodash.debounce";

const Sidebar = ({ onLocationSelect, onClose, isOpen }) => {
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [lonLatFrom, setLonLatFrom] = useState(null);
  const [lonLatTo, setLonLatTo] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = useCallback(
    debounce(async (query) => {
      if (!query) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
        );
        const data = response.data.map((item) => ({
          label: item.display_name,
          value: item.lat + "," + item.lon,
        }));
        setOptions(data);
      } catch (error) {
        console.error("Error fetching data from API", error);
        setOptions([]);
      }
      setLoading(false);
    }, 300),
    []
  );

  const handleInputChange = (inputValue) => {
    fetchOptions(inputValue);
  };

  const handleChangeFrom = (selectedOption) => {
    setFromLocation(selectedOption);
    const [lat, lon] = selectedOption.value.split(",");
    setLonLatFrom({ lat, lon });
  };

  const handleChangeTo = (selectedOption) => {
    setToLocation(selectedOption);
    const [lat, lon] = selectedOption.value.split(",");
    setLonLatTo({ lat, lon });
  };

  const handleFindRoute = () => {
    if (fromLocation && toLocation) {
      onLocationSelect({ from: lonLatFrom, to: lonLatTo });
      onClose();
    } else {
      alert("Please select both start and end locations.");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 mt-5 bg-white rounded-2xl p-4 z-10 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-96"
      }`}
      style={{ width: "300px", height: "80vh", marginLeft: "20px" }} // Adjust width, height, and margin
      aria-hidden={!isOpen}
    >
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold mb-4">Temukan Rute Lokasi</h2>
        <button
          onClick={onClose}
          className="mb-4 p-2 border text-black rounded"
        >
          <IoMdClose />
        </button>
      </div>

      <div>
        <p className="text-sm text-gray-500">Dari</p>
        <Select
          placeholder="Pilih lokasi"
          onInputChange={(inputValue) => handleInputChange(inputValue)}
          onChange={handleChangeFrom}
          isLoading={loading}
          options={options}
          className="basic-single mb-4"
          classNamePrefix="select"
          value={fromLocation}
        />
      </div>

      <div>
        <p className="text-sm text-gray-500">Ke</p>
        <Select
          placeholder="Pilih lokasi"
          onInputChange={(inputValue) => handleInputChange(inputValue)}
          onChange={handleChangeTo}
          isLoading={loading}
          options={options}
          className="basic-single mb-4"
          classNamePrefix="select"
          value={toLocation}
        />
      </div>

      <div className="flex justify-end mt-5">
        <button
          onClick={handleFindRoute}
          className="bg-blue-500 text-white p-2 rounded-lg"
        >
          Temukan Rute
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
