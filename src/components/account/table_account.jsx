import React, { useState, useEffect } from "react";
import Modal_account from "./modal_account";
import { updateAccount, getAccountList } from "../../api/account";
import { CloseCircleOutlined } from "@ant-design/icons";

const Table_account = () => {  
  const [open, setOpen] = useState(false);
  const [foo, setFoo] = useState(false);
  const [modal, setModal] = useState({});
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      const data = await getAccountList();
      if (data) setUsers(data.data);
    };
    fetch();
  }, [foo]);
  function handleOpen(idx) { 
    setModal(idx)
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
  }  
  const display = users.map((x, id) => {
    return (
      <tr
        key={x}
        class="bg-white border-b dark:bg-gray-900 dark:border-gray-700"
      >
        <th
          scope="row"
          class="px-6 py-4 font-normal text-gray-900 whitespace-nowrap dark:text-white"
        >
          {x.id}
        </th>
        <td class="px-6 py-4">{x.email}</td>
        <td class="px-6 py-4">{x.NIU}</td>
        <td class="px-6 py-4">2000</td>
        <td class="px-6 py-4">
          <button
            className="text-white bg-blue-700 hover:bg-blue-900 focus:outline-none font-medium text-sm rounded-lg px-6 py-2 text-center"
            onClick={() => {
              handleOpen(x)
            }}
          >
            Edit
          </button>
        </td>        
      </tr>
    );
  });
  return (
    <>
      {/* <Modal/> */}
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-900 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">
                No
              </th>
              <th scope="col" class="px-6 py-3">
                Email
              </th>
              <th scope="col" class="px-6 py-3">
                NIU
              </th>
              <th scope="col" class="px-6 py-3">
                Price
              </th>
              <th scope="col" class="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>{display}</tbody>
        </table>
      </div>
      <Modal_account 
        open={open}
        handleClose={handleClose}
        modal={modal}
        close={() => {
          setOpen(false)
          setFoo(!foo)}}
      />
    </>
  );
};

export default Table_account;
