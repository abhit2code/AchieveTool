import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import ChattingPage from "./pages/ChattingPage";
import Testing from "./pages/Testing";
import NotFoundPage from "./pages/NotFoundPage";
import reportWebVitals from "./reportWebVitals";
import { UserProvider } from "./context/UserContext";
import { GenderProvider } from "./context/GenderContext";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/chat",
    element: <ChattingPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <UserProvider>
    <GenderProvider>
      <RouterProvider router={router} />
    </GenderProvider>
  </UserProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
