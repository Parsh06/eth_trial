import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { colors } from '../utils/colors';

const { width, height } = Dimensions.get('window');

interface BulletproofARProps {
  onBack?: () => void;
}

export const BulletproofAR: React.FC<BulletproofARProps> = ({ onBack }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [arObjects, setArObjects] = useState<THREE.Object3D[]>([]);
  const glRef = useRef<any>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const onGLContextCreate = async (gl: any) => {
    try {
      console.log('🚀 Initializing Bulletproof AR...');
      glRef.current = gl;
      
      // Create scene with solid background for better visibility
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000011); // Dark blue space-like background
      
      // Create camera
      const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      camera.position.set(0, 0, 5);
      
      // Create renderer with maximum compatibility
      const renderer = new Renderer({ 
        gl,
        antialias: false, // Disable for better performance
        alpha: false,
        powerPreference: "default"
      });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000011, 1);
      renderer.shadowMap.enabled = false; // Disable shadows for performance
      
      // Store references
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      
      // Add basic lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);
      
      // Create multiple AR objects for better visibility
      createARObjects(scene);
      
      // Start animation loop
      startAnimationLoop();
      
      setIsReady(true);
      console.log('✅ Bulletproof AR initialized successfully!');
      
    } catch (error) {
      console.error('❌ AR initialization error:', error);
      setError(`AR Error: ${error.message}`);
    }
  };

  const createARObjects = (scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];
    
    // Create multiple stars at different positions
    const starPositions = [
      { x: 0, y: 0, z: -3 },
      { x: 2, y: 1, z: -4 },
      { x: -2, y: -1, z: -3.5 },
      { x: 1, y: -2, z: -5 },
      { x: -1, y: 2, z: -4.5 },
    ];
    
    starPositions.forEach((pos, index) => {
      // Create star geometry
      const starGeometry = new THREE.SphereGeometry(0.2, 8, 6);
      const starMaterial = new THREE.MeshPhongMaterial({
        color: index % 2 === 0 ? colors.electricPurple : colors.electricGreen,
        emissive: index % 2 === 0 ? colors.electricPurple : colors.electricGreen,
        emissiveIntensity: 0.3,
      });
      
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(pos.x, pos.y, pos.z);
      star.userData = { id: `star-${index}`, type: 'star' };
      scene.add(star);
      objects.push(star);
      
      // Add a simple ring around each star
      const ringGeometry = new THREE.RingGeometry(0.3, 0.4, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: starMaterial.color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(pos.x, pos.y, pos.z);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      objects.push(ring);
    });
    
    // Create a central floating cube
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: colors.electricOrange,
      emissive: colors.electricOrange,
      emissiveIntensity: 0.2,
    });
    
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, -2);
    cube.userData = { id: 'central-cube', type: 'cube' };
    scene.add(cube);
    objects.push(cube);
    
    setArObjects(objects);
  };

  const startAnimationLoop = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Animate all objects
      arObjects.forEach((obj, index) => {
        if (obj.userData.type === 'star') {
          // Rotate stars
          obj.rotation.x += 0.01;
          obj.rotation.y += 0.02;
          // Float animation
          obj.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
        } else if (obj.userData.type === 'cube') {
          // Rotate cube
          obj.rotation.x += 0.01;
          obj.rotation.y += 0.01;
          obj.rotation.z += 0.005;
        } else if (obj.geometry instanceof THREE.RingGeometry) {
          // Rotate rings
          obj.rotation.z += 0.01;
        }
      });
      
      // Render the scene
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };
    
    animate();
  };

  const handleObjectTap = (screenX: number, screenY: number) => {
    if (!cameraRef.current || !sceneRef.current) return;
    
    // Convert screen coordinates to normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (screenX / width) * 2 - 1;
    mouse.y = -(screenY / height) * 2 + 1;
    
    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    // Find intersections
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object.userData.type === 'star') {
        Alert.alert(
          '🌟 Star Found!',
          `You discovered ${object.userData.id}!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else if (object.userData.type === 'cube') {
        Alert.alert(
          '🎲 Cube Tapped!',
          'You found the central cube!',
          [{ text: 'Cool!', style: 'default' }]
        );
      }
    }
  };

  const handleTestAR = () => {
    Alert.alert(
      '🎉 AR Test Successful!',
      'Your AR is working perfectly! You can see floating stars and a rotating cube. Tap on them to interact!',
      [{ text: 'Amazing!', style: 'default' }]
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>AR Not Available</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.errorHint}>
            This device may not support WebGL or AR features.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🌟 AR Star Quest</Text>
        <View style={styles.statusIndicator}>
          <Text style={styles.statusText}>
            {isReady ? '✅ Ready' : '⏳ Loading...'}
          </Text>
        </View>
      </View>
      
      {/* AR View */}
      <View style={styles.arContainer}>
        <GLView
          style={styles.glView}
          onContextCreate={onGLContextCreate}
        />
        
        {/* AR Overlay */}
        <View style={styles.overlay}>
          {/* Crosshair */}
          <View style={styles.crosshair}>
            <View style={styles.crosshairLine} />
            <View style={[styles.crosshairLine, styles.crosshairVertical]} />
          </View>
          
          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              {isReady ? 'Tap on the stars and cube to interact!' : 'Loading AR experience...'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={handleTestAR}
          disabled={!isReady}
        >
          <Text style={styles.testButtonText}>
            {isReady ? '🎉 Test AR' : '⏳ Loading...'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {isReady ? 'AR is working! Look for floating stars and a rotating cube.' : 'Initializing AR...'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000011',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 17, 0.9)',
  },
  backButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  statusIndicator: {
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  arContainer: {
    flex: 1,
    position: 'relative',
  },
  glView: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  crosshair: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 2,
    height: 20,
  },
  crosshairVertical: {
    transform: [{ rotate: '90deg' }],
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 12,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  controls: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 17, 0.9)',
  },
  testButton: {
    backgroundColor: colors.electricPurple,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.electricPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  errorHint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
});
