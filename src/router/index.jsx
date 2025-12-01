import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Layout from "@/components/organisms/Layout";

// Lazy load all page components
const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const Farms = lazy(() => import("@/components/pages/Farms"));
const Tasks = lazy(() => import("@/components/pages/Tasks"));
const Weather = lazy(() => import("@/components/pages/Weather"));
const Finance = lazy(() => import("@/components/pages/Finance"));
const Crops = lazy(() => import("@/components/pages/Crops"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));
const Equipements = lazy(() => import("@/components/pages/Equipements"));
// Loading fallback component
const loadingFallback = (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-primary-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-secondary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>
);

const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={loadingFallback}>
        <Dashboard />
      </Suspense>
    ),
  },
  {
    path: "farms",
    element: (
      <Suspense fallback={loadingFallback}>
        <Farms />
      </Suspense>
    ),
  },
  {
    path: "tasks",
    element: (
      <Suspense fallback={loadingFallback}>
        <Tasks />
      </Suspense>
    ),
  },
  {
    path: "weather",
    element: (
      <Suspense fallback={loadingFallback}>
        <Weather />
      </Suspense>
    ),
  },
  {
    path: "finance",
    element: (
      <Suspense fallback={loadingFallback}>
        <Finance />
      </Suspense>
),
  },
  {
    path: "crops",
    element: (
      <Suspense fallback={loadingFallback}>
        <Crops />
      </Suspense>
    ),
  },
  {
    path: "equipements",
    element: (
      <Suspense fallback={loadingFallback}>
        <Equipements />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={loadingFallback}>
        <NotFound />
      </Suspense>
    ),
  },
];

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes],
  },
];

export const router = createBrowserRouter(routes);