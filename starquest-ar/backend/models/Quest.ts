import mongoose, { Document, Schema } from 'mongoose';

export interface IQuest extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  category: 'exploration' | 'puzzle' | 'social' | 'creative' | 'challenge';
  location: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    radius: number; // in meters
  };
  stars: string[]; // Array of star IDs
  rewards: {
    experience: number;
    nft?: string;
    tokens?: number;
  };
  requirements: {
    minLevel?: number;
    completedQuests?: string[];
    specialItems?: string[];
  };
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  creator: string; // User ID
  participants: string[]; // Array of user IDs
  maxParticipants?: number;
  startDate: Date;
  endDate?: Date;
  metadata: {
    tags: string[];
    featured: boolean;
    verified: boolean;
    rating: number;
    completionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  participantCount: number;
  isFull: boolean;
  // Methods
  addParticipant(userId: string): Promise<IQuest>;
  removeParticipant(userId: string): Promise<IQuest>;
  updateCompletionRate(): Promise<IQuest>;
}

const QuestSchema = new Schema<IQuest>({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'legendary'],
    required: true
  },
  category: {
    type: String,
    enum: ['exploration', 'puzzle', 'social', 'creative', 'challenge'],
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
    radius: {
      type: Number,
      required: true,
      min: 10,
      max: 10000
    }
  },
  stars: [{
    type: Schema.Types.ObjectId,
    ref: 'Star'
  }],
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
    }
  },
  requirements: {
    minLevel: {
      type: Number,
      min: 1
    },
    completedQuests: [{
      type: Schema.Types.ObjectId,
      ref: 'Quest'
    }],
    specialItems: [{
      type: String
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'archived'],
    default: 'draft'
  },
  creator: {
    type: String,
    ref: 'User',
    required: true
  },
  participants: [{
    type: String,
    ref: 'User'
  }],
  maxParticipants: {
    type: Number,
    min: 1,
    max: 1000
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  metadata: {
    tags: [{
      type: String,
      maxlength: 20
    }],
    featured: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
});

// Indexes
QuestSchema.index({ location: '2dsphere' });
QuestSchema.index({ status: 1, startDate: 1 });
QuestSchema.index({ creator: 1 });
QuestSchema.index({ 'metadata.tags': 1 });
QuestSchema.index({ difficulty: 1, category: 1 });

// Virtual for participant count
QuestSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for is full
QuestSchema.virtual('isFull').get(function() {
  if (!this.maxParticipants) return false;
  return this.participants.length >= this.maxParticipants;
});

// Methods
QuestSchema.methods.addParticipant = function(userId: string) {
  if (this.isFull) {
    throw new Error('Quest is full');
  }
  
  if (this.participants.includes(userId)) {
    throw new Error('User already participating');
  }
  
  this.participants.push(userId);
  return this.save();
};

QuestSchema.methods.removeParticipant = function(userId: string) {
  this.participants = this.participants.filter(id => id.toString() !== userId);
  return this.save();
};

QuestSchema.methods.updateCompletionRate = function() {
  if (this.participants.length === 0) {
    this.metadata.completionRate = 0;
  } else {
    // This would need to be calculated based on actual completions
    // For now, we'll use a placeholder
    this.metadata.completionRate = Math.random() * 100;
  }
  return this.save();
};

export const Quest = mongoose.model<IQuest>('Quest', QuestSchema);

