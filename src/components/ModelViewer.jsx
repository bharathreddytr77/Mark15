// src/components/ModelViewer.jsx
import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Model() {
  const gltf = useGLTF('/models/ftm.glb');
  return (
    <primitive
      object={gltf.scene}
      scale={0.15}
      position={[0, 0.2, 0.8]}
      rotation={[0, Math.PI, 0]}
    />
  );
}

const CameraController = () => {
  const { camera, gl, scene } = useThree();
  const controlsRef = useRef();
  const targetPosition = useRef(null);
  const targetLookAt = useRef(null);
  const isMoving = useRef(false);

  useFrame(() => {
    if (isMoving.current && targetPosition.current && targetLookAt.current) {
      // Smooth transition
      camera.position.lerp(targetPosition.current, 0.08);

      // If close enough, stop moving
      if (camera.position.distanceTo(targetPosition.current) < 0.05) {
        camera.position.copy(targetPosition.current);
        isMoving.current = false;
      }

      // Smooth lookAt transition
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

      // Move camera back a little from the hit point
      const direction = new THREE.Vector3().subVectors(camera.position, hitPoint).normalize();
      const newCameraPos = hitPoint.clone().add(direction.multiplyScalar(2)); // back up slightly

      // Set smooth movement
      targetPosition.current = newCameraPos;
      targetLookAt.current = hitPoint;
      isMoving.current = true;
    }
  };

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('dblclick', handleDoubleClick);
    return () => canvas.removeEventListener('dblclick', handleDoubleClick);
  }, [gl]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom
      enableRotate
      minDistance={0.5}  // ⛔ Prevent too close zoom
      maxDistance={5}   // ✅ Prevent zooming out too far
    />
  );
};

const ModelViewer = () => {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <Suspense fallback={null}>
        <Model />
      </Suspense>

      <CameraController />
    </Canvas>
  );
};

export default ModelViewer;
