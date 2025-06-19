import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createHashRouter, RouterProvider, useParams } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import ProjectsPage from "./pages/ProjectsPage";

function ActivitiesPageWrapper() {
  const { pane } = useParams();
  return <ActivitiesPage pane={pane} />;
}

const router = createHashRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/activities",
    element: <ActivitiesPageWrapper />,
  },
  {
    path: "/activities/:pane",
    element: <ActivitiesPageWrapper />,
  },
  {
    path: "/projects",
    element: <ProjectsPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
