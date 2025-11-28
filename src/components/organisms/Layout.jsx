import React from "react";
import { Outlet } from "react-router-dom";
import BottomNavigation from "@/components/organisms/BottomNavigation";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-100">
      <main className="pb-16 min-h-screen">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;