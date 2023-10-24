import React, { useState, useEffect, useRef } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
import { updateAccount, getAccountById } from "../../api/account";
import Swal from 'sweetalert2'

const Modal_account = ({ open, handleClose, modal, close }) => {    
  let tempData = {
    email: modal.email,
    NIU: modal.NIU,
  }
  if (!open) return null;
  else {
    const handleSubmit = (e) => {      
      e.preventDefault();
      const fetch = async () => {        
        const update = await updateAccount(modal.id, tempData);        
        close()
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Update success',
          showConfirmButton: false,
          timer: 1500
        })
      };
      fetch();
    };
    return (
      <>
        {open && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center">
            <div className="w-[600px] flex justify-center">
              <div class="w-full max-w-xs">
                <form
                  class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                  onSubmit={(e) => handleSubmit(e)}
                >
                  <div className="relative">
                    <button
                      className="absolute -top-3 right-0 text-black text-xl items-center justify-end"
                      onClick={
                        handleClose
                      }
                      type="button"
                    >
                      <CloseCircleOutlined />
                    </button>
                  </div>
                  <div class="mb-4 justify-center">
                    <label
                      class="block text-gray-700 text-sm font-bold mb-2"
                      for="email"
                    >
                      Email
                    </label>
                    <input
                      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="username"
                      type="text"
                      placeholder="Email"
                      defaultValue={modal.email}
                      onChange={(e) => {
                        // let tempState = state;
                        // tempState["email"] = e.target.value;
                        // setState(tempState);
                        tempData.email = tempData.email
                        tempData.NIU = tempData.NIU                      
                        tempData["email"] = e.target.value
                      }}
                    />
                  </div>
                  <div class="mb-6">
                    <label
                      class="block text-gray-700 text-sm font-bold mb-2"
                      for="NIU"
                    >
                      NIU
                    </label>
                    <input
                      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="NIU"
                      type="text"
                      placeholder="NIU"
                      defaultValue={modal.NIU}
                      onChange={(e) => {
                        // let tempState = state;
                        // state["NIU"] = e.target.value;
                        // setState(tempState);
                        tempData.email = tempData.email
                        tempData.NIU = tempData.NIU
                        tempData["NIU"] = e.target.value
                      }}
                    />
                  </div>
                  <div class="flex items-center justify-end">
                    <button
                      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
                      type="submit"
                    >
                      Submit
                    </button>                    
                  </div>
                </form>
                <p class="text-center text-gray-500 text-xs">
                  &copy;2020 Acme Corp. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};

export default Modal_account;
