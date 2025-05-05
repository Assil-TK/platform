// Auto-generated preview file
import React from "react";
import { useNavigate } from "react-router-dom";
const myImage = "https://raw.githubusercontent.com/Assil-TK/test/main/src/assets/logo192.png";


function PageOne() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Page One</h1>
      <img
        src={myImage}
        alt="Page One"
        style={{ width: "300px", height: "auto", marginBottom: "20px" }}
      />

      <br />
      <button onClick={() => navigate("/page-two")}>Go to Page Two</button>
      <br /><br />
      <button
        onClick={() => navigate("/page-two")}
        style={{
          backgroundColor: "red",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Button 2
      </button>
    </div>
  );
}

export default PageOne;