import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { ZoomControl } from "react-leaflet/ZoomControl";
import { collection, getDocs } from "firebase/firestore"
import { dbFirestore } from "../../config/firebase";
import PinMarker from "./pinMarker";
import { socket } from "../../config/socket";

const button_maps = [
  'Bicycle',
  'Terminal'
]

const Maps = ({ sidebarWidth }) => {
  const [locations, setLocations] = useState([]);
  const [openTrack, setOpenTrack] = useState(false)
  const [openTerminal, setOpenTerminal] = useState(false)
  const [terminals, setTerminals] = useState([])

  useEffect(() => {
    let i = 1
    socket.connect()
    // onSnapshot(collection(dbFirestore, "tracking-user"), (doc) => {
    //   let asw = [];
    //   doc.docs.forEach((val, key) => {
    //     let data = val.data()
    //     data.iteration = i
    //     asw.push(data)
    //     i++
    //   })
    //   setLocations(asw);
    // });

    function onConnect(){
      console.log("CONNECT TO SOCKET")
      socket.on('test', onFooEvent);
    }
    
    function onDisconnect() {
      console.log("DISCONNECT")
      socket.disconnect()
    }

    function onFooEvent(value) {
      
      console.log("TESSTT")
      console.log(value)
    }
    socket.on('connect', onConnect)
    

    // return () => {
    //   socket.off('disconnect', onDisconnect);
    //   socket.off('test', onFooEvent);
    // };
  
  }, []);
  useEffect(() => {
    const get = async () => {
      let i = 1
      const querySnapshot = await getDocs(collection(dbFirestore, "terminal"));
      let temp_array = [];
      querySnapshot.forEach((doc) => {
          let check = doc.data();
          check.iteration = i
          temp_array.push(check);
          i++
      });
      setTerminals(temp_array)
    }
    get()
  }, [])
  return (
    <>
      <div className="grid grid-cols-6 gap-[100px] absolute container w-[500px] ml-10 z-40 p-5 mt-5">
        {
          button_maps.map((x) => { 
            return (
              <button
                key={x}
                className="w-20 h-7 rounded-3xl bg-white shadow shadow-neutral-950 z-40 text-sm"          
                onClick={() => {
                  if (x == "Bicycle") setOpenTrack(!openTrack)
                  else if (x == "Terminal") setOpenTerminal(!openTerminal)
                }}
              >
                {/* <p className="text-sm text-wrap">{x}</p> */}
                {x}
              </button>    
            )
          })
        }
         
      </div>
      

      <MapContainer
        zoomControl={false}
        center={[-7.77561471227957, 110.37319551913158]}
        zoom={15}
        scrollWheelZoom={true}
        className={`h-screen w-[calc(100vw-${sidebarWidth}px)] z-30`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {openTrack &&
          locations.length &&
          locations.map((x) => {
            return <PinMarker key={x.iteration} latlng={x} type={"bike"} />;
          })}
        {
          openTerminal == true && terminals.length > 0 && terminals.map((x) => {
            return <PinMarker key={x.iteration} latlng={x} type={"terminal"}/>;
          })
        }
        <ZoomControl position="topright" />
      </MapContainer>
    </>
  );
};

export default Maps;
