import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { CarState, TrackDefinition } from '../types';
import { TRACK_LANE_WIDTH } from '../constants';

interface ThreeSceneProps {
  cars: CarState[];
  track: TrackDefinition;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ cars, track }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const carMeshesRef = useRef<(THREE.Group | null)[]>([]);
  const carsRef = useRef(cars);
  const animationFrameIdRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    carsRef.current = cars;
  }, [cars]);

  useEffect(() => {
    if (!mountRef.current || !track) return;
    const mountPoint = mountRef.current;
    hasInitializedRef.current = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setScissorTest(true);
    renderer.shadowMap.enabled = true;
    mountPoint.appendChild(renderer.domElement);

    const cameras = [
      new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
      new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    ];

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const points = track.path.map(p => new THREE.Vector3(p[0], 0, p[1]));
    const curve = new THREE.CatmullRomCurve3(points, true);

    const trackGeometry = new THREE.TubeGeometry(curve, 200, TRACK_LANE_WIDTH / 2, 8, true);
    const trackMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
    trackMesh.scale.y = 0.01;
    trackMesh.position.y = 0.05;
    trackMesh.castShadow = true;
    trackMesh.receiveShadow = true;
    scene.add(trackMesh);

    const { p1, p2 } = track.finishLine;
    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.y + p2.y) / 2;
    const length = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'white';
    context.fillRect(0, 0, 64, 64);
    context.fillStyle = 'black';
    context.fillRect(0, 0, 32, 32);
    context.fillRect(32, 32, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(Math.floor(length / 2), 1);

    const finishLineGeo = new THREE.BoxGeometry(length, 0.05, 2);
    const finishLineMat = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
    const finishLine = new THREE.Mesh(finishLineGeo, finishLineMat);
    finishLine.position.set(midX, 0.151, midZ);
    finishLine.rotation.y = -angle;
    finishLine.receiveShadow = true;
    scene.add(finishLine);

    cars.forEach(carData => {
      const carGroup = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(carData.color) });
      const bodyGeo = new THREE.BoxGeometry(4, 1.5, 2);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      carGroup.add(body);
      const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const cockpitGeo = new THREE.BoxGeometry(1.5, 1, 1.8);
      const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
      cockpit.position.set(-0.5, 0.75, 0);
      carGroup.add(cockpit);
      carGroup.traverse(child => { if (child instanceof THREE.Mesh) { child.castShadow = true; } });
      scene.add(carGroup);
      carMeshesRef.current[carData.id - 1] = carGroup;
    });

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const currentCars = carsRef.current;

      currentCars.forEach(carData => {
        const carMesh = carMeshesRef.current[carData.id - 1];
        if (carMesh) {
          carMesh.position.set(carData.position.x, 0.875, carData.position.y);
          carMesh.rotation.y = -carData.angle;
        }
      });
      
      const width = mountPoint.clientWidth;
      const height = mountPoint.clientHeight;
      
      if (width === 0 || height === 0) return;

      for (let i = 0; i < 2; i++) {
        const carMesh = carMeshesRef.current[i];
        if (carMesh) {
            const camera = cameras[i];
            const offset = new THREE.Vector3(-25, 12, 0); 
            offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carMesh.rotation.y);
            camera.position.copy(carMesh.position).add(offset);
            camera.lookAt(carMesh.position);
            
            const x = i === 0 ? 0 : width / 2;
            renderer.setViewport(x, 0, width / 2, height);
            renderer.setScissor(x, 0, width / 2, height);
            renderer.render(scene, camera);
        }
      }
    };
    
    const handleResize = () => {
        if (!mountPoint) return;
        const w = mountPoint.clientWidth;
        const h = mountPoint.clientHeight;
        
        if (w === 0 || h === 0) return;

        renderer.setSize(w, h);
        cameras.forEach(cam => {
            cam.aspect = (w / 2) / h;
            cam.updateProjectionMatrix();
        });

        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            animate();
        }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountPoint);

    return () => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
        resizeObserver.disconnect();
        if (mountPoint.contains(renderer.domElement)) {
            mountPoint.removeChild(renderer.domElement);
        }
        renderer.dispose();
    };
  }, [track]);

  return <div ref={mountRef} className="w-full h-full absolute inset-0 z-0" />;
};

export default ThreeScene;