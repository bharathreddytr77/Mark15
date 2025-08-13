import React from "react";
import ModelViewer from "../components/ModelViewer";

export default function Home() {
  return (
    <div style={{ height: "100vh", width: "100vw", background: "#000" }}>
      <ModelViewer modelPath="/models/ftm.glb" />
    </div>
  );
}
