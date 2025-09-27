import mongoose, { Document, Schema } from 'mongoose';

export interface INFT extends Document {
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  image: string;
  imageUrl: string;
  animationUrl?: string;
  externalUrl?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  starType: 'cosmic' | 'elemental' | 'mystical' | 'digital' | 'crystal';
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
    max_value?: number;
  }>;
  metadata: {
    background_color?: string;
    youtube_url?: string;
    external_url?: string;
    animation_url?: string;
    properties?: Record<string, any>;
    stats?: Record<string, number>;
  };
  owner: string; // User wallet address
  discoverer: string; // User wallet address who first discovered
  discoveredAt: Date;
  claimedAt?: Date;
  starId: string; // Reference to Star model
  questId?: string; // Reference to Quest model
  blockchain: {
    network: string; // 'ethereum', 'polygon', etc.
    transactionHash?: string;
    blockNumber?: number;
    contractAddress: string;
  };
  stats: {
    views: number;
    likes: number;
    transfers: number;
  };
  status: 'minted' | 'transferred' | 'burned' | 'locked';
  createdAt: Date;
  updatedAt: Date;
  // Methods
  incrementViews(): Promise<INFT>;
  incrementLikes(): Promise<INFT>;
  transfer(newOwner: string, transactionHash?: string): Promise<INFT>;
}

const NFTSchema = new Schema<INFT>({
  tokenId: {
    type: String,
    required: true,
    index: true
  },
  contractAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  image: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  animationUrl: {
    type: String
  },
  externalUrl: {
    type: String
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    required: true,
    index: true
  },
  starType: {
    type: String,
    enum: ['cosmic', 'elemental', 'mystical', 'digital', 'crystal'],
    required: true,
    index: true
  },
  attributes: [{
    trait_type: {
      type: String,
      required: true
    },
    value: {
      type: Schema.Types.Mixed,
      required: true
    },
    display_type: {
      type: String
    },
    max_value: {
      type: Number
    }
  }],
  metadata: {
    background_color: String,
    youtube_url: String,
    external_url: String,
    animation_url: String,
    properties: {
      type: Schema.Types.Mixed,
      default: {}
    },
    stats: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  owner: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  discoverer: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  discoveredAt: {
    type: Date,
    required: true,
    index: true
  },
  claimedAt: {
    type: Date
  },
  starId: {
    type: String,
    ref: 'Star',
    required: true,
    index: true
  },
  questId: {
    type: String,
    ref: 'Quest',
    index: true
  },
  blockchain: {
    network: {
      type: String,
      required: true,
      default: 'polygon'
    },
    transactionHash: {
      type: String,
      sparse: true,
      index: true
    },
    blockNumber: {
      type: Number,
      sparse: true
    },
    contractAddress: {
      type: String,
      required: true,
      lowercase: true
    }
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    transfers: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['minted', 'transferred', 'burned', 'locked'],
    default: 'minted',
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
NFTSchema.index({ owner: 1, rarity: -1, discoveredAt: -1 });
NFTSchema.index({ discoverer: 1, starType: 1 });
NFTSchema.index({ contractAddress: 1, tokenId: 1 }, { unique: true });
NFTSchema.index({ questId: 1, rarity: 1 });
NFTSchema.index({ 'blockchain.network': 1, status: 1 });

// Virtual for getting rarity score
NFTSchema.virtual('rarityScore').get(function() {
  const rarityScores = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
  };
  return rarityScores[this.rarity] || 1;
});

// Virtual for getting full metadata URL
NFTSchema.virtual('metadataUrl').get(function() {
  return `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/nft/${this.contractAddress}/${this.tokenId}/metadata`;
});

// Methods
NFTSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

NFTSchema.methods.incrementLikes = function() {
  this.stats.likes += 1;
  return this.save();
};

NFTSchema.methods.transfer = function(newOwner: string, transactionHash?: string) {
  this.owner = newOwner.toLowerCase();
  this.stats.transfers += 1;
  if (transactionHash) {
    this.blockchain.transactionHash = transactionHash;
  }
  return this.save();
};

NFTSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const NFT = mongoose.model<INFT>('NFT', NFTSchema);
