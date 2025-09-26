import mongoose, { Document, Schema } from 'mongoose';

export interface IStar extends Document {
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  type: 'cosmic' | 'elemental' | 'mystical' | 'digital' | 'crystal';
  location: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    altitude?: number;
  };
  quest: string; // Quest ID
  discoverer?: string; // User ID who first discovered it
  discoverers: string[]; // All users who have discovered it
  metadata: {
    arModel?: string; // 3D model URL
    animation?: string; // Animation URL
    sound?: string; // Sound effect URL
    particleEffect?: string; // Particle effect configuration
    glowColor?: string; // Hex color for glow effect
    size: number; // Size multiplier
    rotation: {
      x: number;
      y: number;
      z: number;
    };
  };
  rewards: {
    experience: number;
    nft?: string;
    tokens?: number;
    specialItem?: string;
  };
  conditions: {
    timeOfDay?: 'day' | 'night' | 'dawn' | 'dusk' | 'any';
    weather?: string[];
    specialEvent?: string;
    requiredItems?: string[];
  };
  status: 'hidden' | 'discovered' | 'claimed' | 'expired' | 'available' | 'completed';
  discoveredBy?: string;
  discoveredAt?: Date;
  discoveryPosition?: {
    latitude: number;
    longitude: number;
  };
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  discoveryCount: number;
  isDiscoverable: boolean;
  // Methods
  addDiscoverer(userId: string): Promise<IStar>;
  removeDiscoverer(userId: string): Promise<IStar>;
  updateStatus(newStatus: string): Promise<IStar>;
}

const StarSchema = new Schema<IStar>({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    required: true
  },
  type: {
    type: String,
    enum: ['cosmic', 'elemental', 'mystical', 'digital', 'crystal'],
    required: true
  },
  location: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },
    altitude: {
      type: Number,
      min: 0
    }
  },
  quest: {
    type: String,
    ref: 'Quest',
    required: true
  },
  discoverer: {
    type: String,
    ref: 'User'
  },
  discoverers: [{
    type: String,
    ref: 'User'
  }],
  metadata: {
    arModel: {
      type: String
    },
    animation: {
      type: String
    },
    sound: {
      type: String
    },
    particleEffect: {
      type: String
    },
    glowColor: {
      type: String,
      match: /^#[0-9A-Fa-f]{6}$/
    },
    size: {
      type: Number,
      default: 1,
      min: 0.1,
      max: 5
    },
    rotation: {
      x: {
        type: Number,
        default: 0,
        min: 0,
        max: 360
      },
      y: {
        type: Number,
        default: 0,
        min: 0,
        max: 360
      },
      z: {
        type: Number,
        default: 0,
        min: 0,
        max: 360
      }
    }
  },
  rewards: {
    experience: {
      type: Number,
      required: true,
      min: 0
    },
    nft: {
      type: String,
      ref: 'NFT'
    },
    tokens: {
      type: Number,
      min: 0
    },
    specialItem: {
      type: String
    }
  },
  conditions: {
    timeOfDay: {
      type: String,
      enum: ['day', 'night', 'dawn', 'dusk', 'any'],
      default: 'any'
    },
    weather: [{
      type: String
    }],
    specialEvent: {
      type: String
    },
    requiredItems: [{
      type: String
    }]
  },
  status: {
    type: String,
    enum: ['hidden', 'discovered', 'claimed', 'expired', 'available', 'completed'],
    default: 'hidden'
  },
  discoveredBy: {
    type: String,
    ref: 'User'
  },
  discoveredAt: {
    type: Date
  },
  discoveryPosition: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
StarSchema.index({ 'location.coordinates': '2dsphere' });
StarSchema.index({ quest: 1, status: 1 });
StarSchema.index({ discoverer: 1 });
StarSchema.index({ rarity: 1, type: 1 });
StarSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for discovery count
StarSchema.virtual('discoveryCount').get(function() {
  return this.discoverers.length;
});

// Virtual for is discoverable
StarSchema.virtual('isDiscoverable').get(function() {
  if (this.status !== 'hidden') return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  return true;
});

// Methods
StarSchema.methods.discover = function(userId: string) {
  if (!this.isDiscoverable) {
    throw new Error('Star is not discoverable');
  }
  
  if (this.discoverers.includes(userId)) {
    throw new Error('User has already discovered this star');
  }
  
  this.discoverers.push(userId);
  
  if (!this.discoverer) {
    this.discoverer = userId;
    this.status = 'discovered';
  }
  
  return this.save();
};

StarSchema.methods.claim = function(userId: string) {
  if (this.status !== 'discovered') {
    throw new Error('Star must be discovered before claiming');
  }
  
  if (!this.discoverers.includes(userId)) {
    throw new Error('User has not discovered this star');
  }
  
  this.status = 'claimed';
  return this.save();
};

StarSchema.methods.checkConditions = function(userLocation: { latitude: number; longitude: number }, userItems: string[]) {
  // Check location proximity (within 50 meters)
  const distance = this.calculateDistance(userLocation);
  if (distance > 50) return false;
  
  // Check required items
  if (this.conditions.requiredItems) {
    const hasAllItems = this.conditions.requiredItems.every((item: string) => 
      userItems.includes(item)
    );
    if (!hasAllItems) return false;
  }
  
  // Check time of day
  if (this.conditions.timeOfDay && this.conditions.timeOfDay !== 'any') {
    const currentHour = new Date().getHours();
    const timeOfDay = this.getTimeOfDay(currentHour);
    if (timeOfDay !== this.conditions.timeOfDay) return false;
  }
  
  return true;
};

StarSchema.methods.calculateDistance = function(userLocation: { latitude: number; longitude: number }) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = this.location.coordinates.latitude * Math.PI/180;
  const φ2 = userLocation.latitude * Math.PI/180;
  const Δφ = (userLocation.latitude - this.location.coordinates.latitude) * Math.PI/180;
  const Δλ = (userLocation.longitude - this.location.coordinates.longitude) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

StarSchema.methods.getTimeOfDay = function(hour: number) {
  if (hour >= 6 && hour < 12) return 'dawn';
  if (hour >= 12 && hour < 18) return 'day';
  if (hour >= 18 && hour < 22) return 'dusk';
  return 'night';
};

export const Star = mongoose.model<IStar>('Star', StarSchema);

