import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
const SidebarNavigation = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navItems = [
    {
      name: "Dashboard",
      href: "",
      icon: "Home",
    },
    {
      name: "Farms", 
      href: "farms",
      icon: "MapPin",
    },
{
      name: "Tasks",
      href: "tasks", 
      icon: "CheckSquare",
    },
    {
      name: "Weather",
      href: "weather",
      icon: "Cloud",
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white shadow-lg border border-gray-200 text-gray-700 hover:text-secondary-600 hover:bg-gray-50 transition-all duration-200"
      >
        <ApperIcon name={isSidebarOpen ? "X" : "Menu"} className="w-6 h-6" />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-40 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:z-auto
        w-64 md:w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Sprout" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FarmTrack</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={`/${item.href}`}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-secondary-50 text-secondary-700 border border-secondary-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-secondary-600"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        isActive ? "bg-secondary-100" : "bg-gray-100"
                      }`}>
                        <ApperIcon 
                          name={item.icon} 
                          className={`h-5 w-5 ${isActive ? "text-secondary-700" : "text-gray-500"}`} 
                        />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Farm Manager</p>
                <p className="text-xs text-gray-500">Premium Account</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-50 flex">
      <SidebarNavigation />
      <main className="flex-1 md:ml-0">
        <div className="pt-16 md:pt-0 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;