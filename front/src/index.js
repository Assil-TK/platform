import React from "react";
import ReactDOM from "react-dom/client"; // Update this import
import App from "./App";
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';


// Create a root and render the App
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
