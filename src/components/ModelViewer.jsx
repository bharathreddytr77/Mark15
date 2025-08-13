import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

function Model({ modelPath }) {
  const gltf = useGLTF(modelPath);
  return (
    <primitive
      object={gltf.scene}
      scale={0.15}
      position={[0, 0, 0]}
      rotation={[0, Math.PI, 0]}
      castShadow
      receiveShadow
    />
  );
}

function CameraController() {
  const { camera, gl, scene } = useThree();
  const controlsRef = useRef();
  const targetPosition = useRef(null);
  const targetLookAt = useRef(null);
  const isMoving = useRef(false);

  // Smooth camera movement
  useFrame(() => {
    if (isMoving.current && targetPosition.current && targetLookAt.current) {
      camera.position.lerp(targetPosition.current, 0.08);

      if (camera.position.distanceTo(targetPosition.current) < 0.05) {
        camera.position.copy(targetPosition.current);
        isMoving.current = false;
      }

      controlsRef.current.target.lerp(targetLookAt.current, 0.1);
      controlsRef.current.update();
    }
  });

  const handleDoubleClick = (event) => {
    const bounds = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const hitPoint = hit.point;

      const direction = new THREE.Vector3()
        .subVectors(camera.position, hitPoint)
        .normalize();

      const newCameraPos = hitPoint.clone().add(direction.multiplyScalar(2));

      targetPosition.current = newCameraPos;
      targetLookAt.current = hitPoint;
      isMoving.current = true;
    }
  };

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("dblclick", handleDoubleClick);
    return () => canvas.removeEventListener("dblclick", handleDoubleClick);
  }, [gl]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom
      enableRotate
      enablePan={false}
      minDistance={0.5}
      maxDistance={5}
    />
  );
}

export default function ModelViewer({ modelPath }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 5], fov: 50 }}
      style={{ height: "100vh", width: "100vw", background: "#000" }}
    >
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Model & Environment */}
      <Suspense fallback={null}>
        <Model modelPath={modelPath} />
        <Environment preset="sunset" background />
      </Suspense>

      {/* Camera Controls with Zoom Limit + Double Click Navigation */}
      <CameraController />
    </Canvas>
  );
}
