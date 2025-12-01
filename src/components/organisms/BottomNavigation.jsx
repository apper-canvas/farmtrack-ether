import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const BottomNavigation = () => {
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
    {
      name: "Finance",
      path: "/finance",
      icon: "DollarSign",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={`/${item.href}`}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 transition-all duration-200 ${
                isActive
                  ? "text-secondary-600 bg-secondary-50"
                  : "text-gray-500 hover:text-secondary-600 hover:bg-gray-50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg transition-all duration-200 ${
                  isActive ? "bg-secondary-100 transform scale-110" : ""
                }`}>
                  <ApperIcon 
                    name={item.icon} 
                    className={`h-5 w-5 ${isActive ? "text-secondary-700" : ""}`} 
                  />
                </div>
                <span className="text-xs font-medium mt-1 leading-none">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;