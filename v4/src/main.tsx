import { createContext, StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createHashRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";

export type Context = { mobile: boolean; touch: boolean };
export const context = createContext<Context>({ mobile: false, touch: false });

const router = createHashRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
]);

function Root() {
  const [mobile, setMobile] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setMobile(window.innerWidth < window.innerHeight * 1.25);
      setTouch(!!window.matchMedia("(pointer: coarse)").matches);
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
  useEffect(() => {
    if (touch) document.body.classList.add("touch");
    else document.body.classList.remove("touch");
  }, [touch]);

  return (
    <StrictMode>
      <context.Provider value={{ mobile, touch }}>
        <RouterProvider router={router} />
      </context.Provider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
