import React, { useState } from "react";
import { RightOutlined } from "@ant-design/icons";

import 'flowbite';
import Sidebar from "./sidebar";
const Dashboard = () => {
  const [open, setOpen] = useState(true);
  return (
    <Sidebar>
    </Sidebar>
  );
};

export default Dashboard;
