import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { colors } from '../utils/colors';
import { ARCamera } from '../components/ARCamera';

const { width, height } = Dimensions.get('window');

interface ARScreenProps {
  onBack?: () => void;
  questId?: string;
  starId?: string;
}

export const ARScreen: React.FC<ARScreenProps> = ({ onBack, questId, starId }) => {
  const [isARReady, setIsARReady] = useState(false);
  const [arObjects, setArObjects] = useState<THREE.Object3D[]>([]);
  const [cameraPosition, setCameraPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const glRef = useRef<any>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    initializeAR();
    return () => {
      cleanup();
    };
  }, []);

  const initializeAR = async () => {
    try {
      // Check if WebGL is supported
      if (!glRef.current) {
        throw new Error('WebGL context not available');
      }

      // Initialize AR scene
      const scene = new THREE.Scene();
      scene.background = null; // Transparent background for AR
      
      // Create camera with proper aspect ratio
      const aspect = width / height;
      const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      
      // Create renderer with proper settings for Expo Go
      const renderer = new Renderer({ 
        gl: glRef.current,
        antialias: true,
        alpha: true
      });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0); // Transparent
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Store references
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
      // Add AR objects (stars, quest items, etc.)
      createARObjects(scene);
      
      setIsARReady(true);
      startRenderLoop();
      
    } catch (error) {
      console.error('AR initialization error:', error);
      Alert.alert(
        'AR Error', 
        `Failed to initialize AR: ${error.message}. Please make sure your device supports WebGL.`,
        [{ text: 'OK', onPress: () => onBack?.() }]
      );
    }
  };

  const createARObjects = (scene: THREE.Scene) => {
    // Create a floating star object
    const starGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const starMaterial = new THREE.MeshPhongMaterial({
      color: colors.electricPurple,
      emissive: colors.electricPurple,
      emissiveIntensity: 0.3,
    });
    
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.set(0, 0, -2);
    star.castShadow = true;
    scene.add(star);
    
    // Add particle system for magical effect
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 4;
      positions[i + 1] = (Math.random() - 0.5) * 4;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: colors.electricBlue,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Store objects for animation
    setArObjects([star, particleSystem]);
  };

  const startRenderLoop = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate AR objects
      arObjects.forEach((obj, index) => {
        if (obj instanceof THREE.Mesh) {
          obj.rotation.y += 0.01;
          obj.position.y = Math.sin(Date.now() * 0.001 + index) * 0.1;
        } else if (obj instanceof THREE.Points) {
          obj.rotation.y += 0.005;
        }
      });
      
      // Render the scene
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };
    
    animate();
  };

  const cleanup = () => {
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    if (sceneRef.current) {
      sceneRef.current.clear();
    }
  };

  const handleStarFound = () => {
    Alert.alert(
      '🌟 Star Found!',
      'Congratulations! You discovered a cosmic star!',
      [
        { text: 'Continue Quest', onPress: () => console.log('Continue quest') },
        { text: 'Collect Reward', onPress: () => console.log('Collect reward') },
      ]
    );
  };

  const onGLContextCreate = (gl: any) => {
    glRef.current = gl;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* AR Camera View */}
      <ARCamera onCameraReady={() => setIsARReady(true)} />
      
      {/* AR Scene Overlay */}
      <View style={styles.arOverlay}>
        <GLView
          style={styles.glView}
          onContextCreate={onGLContextCreate}
        />
        
        {/* AR UI Overlay */}
        <View style={styles.uiOverlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            
            <View style={styles.questInfo}>
              <Text style={styles.questTitle}>AR Quest Active</Text>
              <Text style={styles.questSubtitle}>Find the hidden star</Text>
            </View>
          </View>
          
          {/* Center Crosshair */}
          <View style={styles.crosshair}>
            <View style={styles.crosshairLine} />
            <View style={[styles.crosshairLine, styles.crosshairVertical]} />
          </View>
          
          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleStarFound}
            >
              <Text style={styles.actionButtonText}>🌟 Found Star!</Text>
            </TouchableOpacity>
            
            <View style={styles.arStatus}>
              <Text style={styles.arStatusText}>
                {isARReady ? 'AR Ready' : 'Initializing AR...'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  arOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glView: {
    flex: 1,
  },
  uiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  questInfo: {
    alignItems: 'center',
  },
  questTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  questSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginTop: -20,
    marginLeft: -20,
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
  bottomControls: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: colors.electricPurple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: colors.electricPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  arStatus: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  arStatusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
