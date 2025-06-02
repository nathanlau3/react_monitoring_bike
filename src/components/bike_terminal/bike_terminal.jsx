import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar";
import Bike_terminal_modal from "./modal_bike_terminal";

import { Card, Typography } from "@material-tailwind/react";
import {
  FaPlus,
  FaChevronCircleRight,
  FaChevronCircleDown,
  FaPenSquare,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { GetTerminal } from "../../api/bike_terminal";

const Bike_terminal = () => {
  // const terminalRef2 = doc("terminal", firestore)
  const [open, setOpen] = useState(false);
  const [isDrop, setIsDrop] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [dataProps, setDataProps] = useState({});
  const [tableRows, setTableRows] = useState([]);

  useEffect(() => {
    const get = async () => {
      let temp_array = [];
      const data_terminal = await GetTerminal();
      data_terminal.data.forEach((doc) => {
        temp_array.push(doc);
      });
      setTableRows(temp_array);
    };
    get();
  }, []);

  const TABLE_HEAD = ["No", "Location (Faculty)", "Action", ""];
  const handleShowModal = () => {
    setOpen(true);
  };

  return (
    <Sidebar>
      <div className="container p-5">
        <div className="flex flex-row justify-between items-center">
          <div className="my-5">Bike Terminal</div>
          <button
            className="border-solid border-2 border-sky-500 text-sky-500 text-sm px-2 py-1 my-2 rounded-md hover:bg-sky-500 hover:text-white focus:outline-none focus:bg-white w-auto h-[40px]"
            type="button"
            onClick={() => {
              setIsCreate(true);
              setOpen(true);
            }}
          >
            <div className="flex flex-row items-center gap-2">
              <FaPlus />
              Add Terminal
            </div>
          </button>
        </div>

        <Card className="h-full w-full overflow-scroll">
          <table className="w-full min-w-max table-auto text-center">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-b border-blue-500 bg-blue-500 p-4"
                  >
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal leading-none"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows != undefined
                ? tableRows.map((data, index) => {
                    return (
                      <tr key={data.name_terminal}>
                        <td className={`bg-blue`}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {index}
                          </Typography>
                        </td>
                        <td className={`bg-blue`}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {data.name}
                          </Typography>
                        </td>
                        <td>
                          <div className="flex flex-row justify-center">
                            <button
                              className="border-solid border-2 border-sky-500 text-sky-500 text-sm py-1 my-2 rounded-md hover:bg-sky-500 hover:text-white focus:outline-none focus:bg-white w-[70px]"
                              type="button"
                              onClick={() => {
                                setDataProps(data);
                                // console.log("button => ", data)
                                handleShowModal();
                              }}
                            >
                              <div className="flex flex-row items-center gap-2 ml-2">
                                <FaPenSquare />
                                Edit
                              </div>
                            </button>

                            <button
                              className="flex border-solid border-2 border-sky-500 text-sky-500 text-sm py-1 my-2 ml-2 rounded-md hover:bg-sky-500 hover:text-white focus:outline-none focus:bg-white w-[70px]"
                              type="button"
                              onClick={() => {
                                setDataProps(data);
                                console.log("DATAA =>", data);
                                handleShowModal();
                              }}
                            >
                              <div className="flex flex-row items-center mr-2 ml-1">
                                <FaMapMarkerAlt />
                                Shows
                              </div>
                            </button>
                          </div>

                          {/* <Typography
                            as="a"
                            variant="small"
                            color="blue-gray"
                            className="font-medium"
                            onClick={handleShowModal}
                        >
                            Edit
                        </Typography> */}
                        </td>
                        <td>
                          <div className="-mt-1 cursor-pointer">
                            {isDrop ? (
                              <FaChevronCircleDown
                                color="#597AAF"
                                onClick={() => setIsDrop(!isDrop)}
                              />
                            ) : (
                              <FaChevronCircleRight
                                color="#597AAF"
                                onClick={() => setIsDrop(!isDrop)}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : true}
            </tbody>
          </table>
        </Card>
      </div>
      <div className="relative flex">
        {isCreate ? (
          <Bike_terminal_modal
            open={open}
            setOpen={setOpen}
            isCreate={isCreate}
            setIsCreate={setIsCreate}
          />
        ) : (
          <Bike_terminal_modal
            open={open}
            setOpen={setOpen}
            data={dataProps}
            isCreate={isCreate}
            setIsCreate={setIsCreate}
          />
        )}
      </div>
    </Sidebar>
  );
};

export default Bike_terminal;
