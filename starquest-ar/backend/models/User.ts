import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  username: string;
  email?: string;
  avatar?: string;
  level: number;
  experience: number;
  starsCollected: number;
  starsFound: number;
  questsCompleted: number;
  nftsEarned: number;
  nftsOwned: string[];
  achievements: string[];
  streak: number;
  starsDiscovered: number;
  tokens: number;
  stats: {
    totalQuests: number;
    completedQuests: number;
    totalStars: number;
    streak: number;
    lastActive: Date;
  };
  preferences: {
    notifications: boolean;
    privacy: 'public' | 'friends' | 'private';
    theme: 'light' | 'dark' | 'auto';
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true
  },
  avatar: {
    type: String,
    default: null
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  starsCollected: {
    type: Number,
    default: 0,
    min: 0
  },
  starsFound: {
    type: Number,
    default: 0,
    min: 0
  },
  questsCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  nftsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  nftsOwned: [{
    type: String,
    ref: 'NFT'
  }],
  achievements: [{
    type: String
  }],
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  starsDiscovered: {
    type: Number,
    default: 0,
    min: 0
  },
  tokens: {
    type: Number,
    default: 0,
    min: 0
  },
  stats: {
    totalQuests: {
      type: Number,
      default: 0,
      min: 0
    },
    completedQuests: {
      type: Number,
      default: 0,
      min: 0
    },
    totalStars: {
      type: Number,
      default: 0,
      min: 0
    },
    streak: {
      type: Number,
      default: 0,
      min: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    privacy: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ level: -1, experience: -1 });
UserSchema.index({ 'stats.totalStars': -1 });

// Virtual for completion rate
UserSchema.virtual('completionRate').get(function() {
  if (this.stats.totalQuests === 0) return 0;
  return (this.stats.completedQuests / this.stats.totalQuests) * 100;
});

// Methods
UserSchema.methods.addExperience = function(amount: number) {
  this.experience += amount;
  
  // Level up logic
  const requiredExp = this.level * 100;
  if (this.experience >= requiredExp) {
    this.level += 1;
    this.experience -= requiredExp;
    return { leveledUp: true, newLevel: this.level };
  }
  
  return { leveledUp: false };
};

UserSchema.methods.collectStar = function() {
  this.starsCollected += 1;
  this.stats.totalStars += 1;
  this.stats.lastActive = new Date();
  
  // Add experience for collecting stars
  const expGained = 10;
  return this.addExperience(expGained);
};

export const User = mongoose.model<IUser>('User', UserSchema);

