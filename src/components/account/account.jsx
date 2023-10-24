import React from "react";
import Sidebar from "../sidebar";
import { useState, useEffect, useRef } from "react";
import Table_account from "./table_account";
//coba
const account = () => {
  return (
    <>
      <Sidebar>
        <div className=" px-7 py-7 text-2xl font-semibold flex-1">
          <Table_account />
        </div>
      </Sidebar>
      {/* <Table/> */}
    </>
  );
};

export default account;
