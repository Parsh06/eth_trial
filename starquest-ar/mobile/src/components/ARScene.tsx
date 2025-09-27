import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { colors } from '../utils/colors';

interface ARSceneProps {
  onSceneReady?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: Renderer) => void;
  onObjectDetected?: (object: THREE.Object3D) => void;
  questData?: {
    id: string;
    name: string;
    stars: Array<{
      id: string;
      position: { x: number; y: number; z: number };
      type: 'common' | 'rare' | 'legendary';
    }>;
  };
}

export const ARScene: React.FC<ARSceneProps> = ({
  onSceneReady,
  onObjectDetected,
  questData,
}) => {
  const glRef = useRef<any>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const onGLContextCreate = async (gl: any) => {
    try {
      glRef.current = gl;
      
      // Create scene
      const scene = new THREE.Scene();
      scene.background = null; // Transparent for AR
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      
      // Create renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000, 0); // Transparent
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Store references
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      
      // Setup lighting
      setupLighting(scene);
      
      // Create AR objects
      createARObjects(scene);
      
      // Start render loop
      startRenderLoop();
      
      setIsReady(true);
      onSceneReady?.(scene, camera, renderer);
      
    } catch (error) {
      console.error('AR Scene initialization error:', error);
    }
  };

  const setupLighting = (scene: THREE.Scene) => {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Directional light for shadows and depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Point light for magical effects
    const pointLight = new THREE.PointLight(colors.electricPurple, 0.5, 10);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);
  };

  const createARObjects = (scene: THREE.Scene) => {
    if (!questData) {
      // Create default star objects
      createDefaultStars(scene);
      return;
    }
    
    // Create quest-specific objects
    questData.stars.forEach((starData, index) => {
      const star = createStarObject(starData.type);
      star.position.set(starData.position.x, starData.position.y, starData.position.z);
      star.userData = { starId: starData.id, type: starData.type };
      scene.add(star);
    });
  };

  const createDefaultStars = (scene: THREE.Scene) => {
    // Create a few default stars for testing
    const starPositions = [
      { x: 0, y: 0, z: -2 },
      { x: 1, y: 0.5, z: -3 },
      { x: -1, y: -0.5, z: -2.5 },
    ];
    
    starPositions.forEach((pos, index) => {
      const star = createStarObject('common');
      star.position.set(pos.x, pos.y, pos.z);
      star.userData = { starId: `default-${index}`, type: 'common' };
      scene.add(star);
    });
  };

  const createStarObject = (type: 'common' | 'rare' | 'legendary'): THREE.Object3D => {
    const group = new THREE.Group();
    
    // Main star geometry
    const starGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    let starMaterial: THREE.Material;
    
    switch (type) {
      case 'rare':
        starMaterial = new THREE.MeshPhongMaterial({
          color: colors.cyberBlue,
          emissive: colors.cyberBlue,
          emissiveIntensity: 0.4,
        });
        break;
      case 'legendary':
        starMaterial = new THREE.MeshPhongMaterial({
          color: colors.electricPurple,
          emissive: colors.electricPurple,
          emissiveIntensity: 0.6,
        });
        break;
      default:
        starMaterial = new THREE.MeshPhongMaterial({
          color: colors.neonGreen,
          emissive: colors.neonGreen,
          emissiveIntensity: 0.3,
        });
    }
    
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    starMesh.castShadow = true;
    group.add(starMesh);
    
    // Add particle effect around the star
    const particleCount = 20;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 0.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: starMaterial.color,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    group.add(particleSystem);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: starMaterial.color,
      transparent: true,
      opacity: 0.2,
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    return group;
  };

  const startRenderLoop = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Animate all objects in the scene
      sceneRef.current!.traverse((object) => {
        if (object.userData.starId) {
          // Rotate stars
          object.rotation.y += 0.01;
          object.rotation.x += 0.005;
          
          // Float animation
          object.position.y += Math.sin(Date.now() * 0.001 + object.userData.starId.length) * 0.001;
        }
      });
      
      // Render the scene
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };
    
    animate();
  };

  const detectObjects = (screenX: number, screenY: number) => {
    if (!cameraRef.current || !sceneRef.current) return;
    
    // Convert screen coordinates to normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (screenX / glRef.current.drawingBufferWidth) * 2 - 1;
    mouse.y = -(screenY / glRef.current.drawingBufferHeight) * 2 + 1;
    
    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    // Find intersections
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      onObjectDetected?.(object);
    }
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={onGLContextCreate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
});
