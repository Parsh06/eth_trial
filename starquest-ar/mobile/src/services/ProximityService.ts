import { calculateDistance, Coordinates } from '../utils/distance';

export interface ProximityTarget {
  id: string;
  name: string;
  coordinates: Coordinates;
  radius: number; // in meters
  isActive: boolean;
}

export interface ProximityEvent {
  target: ProximityTarget;
  distance: number;
  isEntering: boolean; // true when entering, false when leaving
}

export type ProximityCallback = (event: ProximityEvent) => void;

class ProximityServiceClass {
  private targets: Map<string, ProximityTarget> = new Map();
  private callbacks: Set<ProximityCallback> = new Set();
  private lastDistances: Map<string, number> = new Map();
  private isTracking = false;
  private currentLocation: Coordinates | null = null;

  /**
   * Add a proximity target to monitor
   */
  addTarget(target: ProximityTarget): void {
    console.log('🎯 ProximityService: Adding target:', target.name, 'at', target.coordinates);
    this.targets.set(target.id, target);
  }

  /**
   * Remove a proximity target
   */
  removeTarget(targetId: string): void {
    console.log('🗑️ ProximityService: Removing target:', targetId);
    this.targets.delete(targetId);
    this.lastDistances.delete(targetId);
  }

  /**
   * Update current user location and check proximity
   */
  updateLocation(location: Coordinates): void {
    this.currentLocation = location;
    console.log('📍 ProximityService: Location updated:', location);
    
    if (this.isTracking) {
      this.checkProximity();
    }
  }

  /**
   * Start proximity monitoring
   */
  startTracking(): void {
    console.log('🔄 ProximityService: Starting proximity tracking');
    this.isTracking = true;
    if (this.currentLocation) {
      this.checkProximity();
    }
  }

  /**
   * Stop proximity monitoring
   */
  stopTracking(): void {
    console.log('⏹️ ProximityService: Stopping proximity tracking');
    this.isTracking = false;
    this.lastDistances.clear();
  }

  /**
   * Add a callback for proximity events
   */
  addCallback(callback: ProximityCallback): void {
    this.callbacks.add(callback);
  }

  /**
   * Remove a callback
   */
  removeCallback(callback: ProximityCallback): void {
    this.callbacks.delete(callback);
  }

  /**
   * Check proximity to all targets
   */
  private checkProximity(): void {
    if (!this.currentLocation) return;

    for (const [targetId, target] of this.targets) {
      if (!target.isActive) continue;

      const distance = calculateDistance(this.currentLocation, target.coordinates);
      const lastDistance = this.lastDistances.get(targetId);
      
      console.log(`📏 ProximityService: Distance to ${target.name}: ${distance.toFixed(2)}m (threshold: ${target.radius}m)`);

      // Check if entering proximity
      if (distance <= target.radius && (lastDistance === undefined || lastDistance > target.radius)) {
        console.log(`🎉 ProximityService: ENTERING proximity of ${target.name}`);
        this.notifyCallbacks({
          target,
          distance,
          isEntering: true,
        });
      }
      // Check if leaving proximity
      else if (distance > target.radius && lastDistance !== undefined && lastDistance <= target.radius) {
        console.log(`👋 ProximityService: LEAVING proximity of ${target.name}`);
        this.notifyCallbacks({
          target,
          distance,
          isEntering: false,
        });
      }

      this.lastDistances.set(targetId, distance);
    }
  }

  /**
   * Notify all callbacks of proximity events
   */
  private notifyCallbacks(event: ProximityEvent): void {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('❌ ProximityService: Error in callback:', error);
      }
    });
  }

  /**
   * Get all active targets
   */
  getTargets(): ProximityTarget[] {
    return Array.from(this.targets.values()).filter(target => target.isActive);
  }

  /**
   * Get distance to a specific target
   */
  getDistanceToTarget(targetId: string): number | null {
    if (!this.currentLocation) return null;
    
    const target = this.targets.get(targetId);
    if (!target) return null;

    return calculateDistance(this.currentLocation, target.coordinates);
  }
}

export const ProximityService = new ProximityServiceClass();
