import React, { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import SideNavigation from "../../components/navigation/SideNavigation";

const MainLayout = () => {

  return (
    <div className="">
      <SideNavigation/>  
      <main className="">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
