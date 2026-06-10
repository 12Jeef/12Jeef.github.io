import { createContext, StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createHashRouter, RouterProvider, useParams } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import ProjectsPage from "./pages/ProjectsPage";

export type Context = { mobile: boolean };
export const context = createContext<Context>({ mobile: false });

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

function Root() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setMobile(window.innerWidth < window.innerHeight * 0.875);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (mobile) document.body.classList.add("mobile");
    else document.body.classList.remove("mobile");
  }, [mobile]);

  return (
    <StrictMode>
      <context.Provider value={{ mobile }}>
        <RouterProvider router={router} />
      </context.Provider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
