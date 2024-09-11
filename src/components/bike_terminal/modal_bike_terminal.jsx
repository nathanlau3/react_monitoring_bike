import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ZoomControl } from "react-leaflet/ZoomControl";
import { useMapEvents } from "react-leaflet/hooks";
import PinMarker from "../maps/pinMarker";
import { UpdateTerminal } from "../../api/bike_terminal";
import { SweetAlert2 } from "../../helper/sweetalert";
const Bike_terminal_modal = ({ open, setOpen, data, isCreate, setIsCreate }) => {
  const [lat_lng, setLat_lng] = useState({
    latitude: null,
    longitude: null,
  });
  const [formData, setFormData] = useState({
    latitude: null,
    longitude: null,
    name: null,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data?.name,
              latitude: data?.latitude,
              longitude: data?.longitude,
      })
    }
  }, [data]);
  
  // useEffect(() => {
  //   const terminalRef = ref(db, "terminal/2")
  //   onValue(terminalRef, (x) => {
  //     const data = x.val()
  //     console.log(data)
  //   })

  // }, [])

  const Markers = () => {
    useMapEvents({
      click(e) {
        console.log(e)
        setLat_lng({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
        setFormData({
          name: formData.name,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
      },
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your form submission logic here using formData
    // set(ref(db, 'terminal/' + 1), formData);
    
    if (isCreate) console.log("Form inserted with data:", formData);
    else {
      const response = await UpdateTerminal(data.id, formData)
      SweetAlert2(response)
    };
  };

  const handleClose = () => {
    setOpen(false)
    setIsCreate(false)
    setFormData({})
    setLat_lng(false)
  }

  return (
    <>
      {open ? (
        <div>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none mt-10">
            <div className="w-[1000px] my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none h-[700px]">
                {/*header*/}
                <div className="flex items-center justify-center p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold justify-center">
                    Bicycle Terminal
                  </h3>
                </div>
                {/*body*/}
                <div className="relative my-6 flex-auto">
                  <div className="flex flex-col items-center justify-center overflow-scroll z-0">
                    {/* <div className="flex mt-10">
                      <div>Bike Terminal</div>
                    </div> */}
                    <div className="w-auto h-[300px] mx-auto rounded-lg">
                      <MapContainer
                        zoomControl={false}
                        center={[-6.235780900122761, 106.84059830598854]}
                        zoom={15}
                        scrollWheelZoom={true}
                        className={`w-[500px] h-[250px] rounded-lg`}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {lat_lng.latitude && <PinMarker latlng={lat_lng} />}
                        <Markers />
                        <ZoomControl position="topright" />
                      </MapContainer>
                    </div>

                    <form 
                        className="flex flex-col items-center gap-6 w-72 justify-center"
                        onSubmit={handleSubmit}>
                      <div className="relative w-[500px] h-10">
                        <input
                          className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                          placeholder=" "
                          name="latitude"
                          onChange={handleChange}
                          value={lat_lng.latitude ?? data?.latitude}
                          required={true}
                        />
                        <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                          Latitude
                        </label>
                      </div>
                      <div className="relative w-[500px] h-11">
                        <input
                          className="w-full h-full px-3 py-3 font-sans text-sm font-normal transition-all bg-transparent border rounded-md peer text-blue-gray-700 outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 border-t-transparent focus:border-t-transparent border-blue-gray-200 focus:border-gray-900"
                          placeholder=" "
                          name="longitude"
                          onChange={handleChange}
                          value={lat_lng.longitude ?? data?.longitude}
                          required={true}
                        />
                        <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[4.1] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                          Longitude
                        </label>
                      </div>
                      <div class="relative w-[500px] h-11">
                        <input
                          className="w-full h-full px-3 py-3 font-sans text-sm font-normal transition-all bg-transparent border rounded-md peer text-blue-gray-700 outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 border-t-transparent focus:border-t-transparent border-blue-gray-200 focus:border-gray-900"
                          placeholder=" "
                          name="name_terminal"
                          onChange={handleChange}
                          value={data?.name}
                          required={true}
                        />
                        <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[4.1] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                          Name Terminal
                        </label>
                      </div>
                      <div className="flex flex-row justify-end gap-3 p-5 border-t border-solid border-blueGray-200 ">
                        <button
                            // onClick={handleSubmit}
                            type="submit"
                            className="bg-blue-500 text-white text-sm px-2 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 w-[70px]"
                        >
                            Submit
                        </button>
                        <button
                            className="bg-red-500 text-white text-sm px-2 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:bg-white w-[70px]"
                            type="button"
                            onClick={handleClose}
                        >
                            Close
                        </button>
                        </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </div>
      ) : null}
    </>
  );
};

export default Bike_terminal_modal;
