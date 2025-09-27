"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFT = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const NFTSchema = new mongoose_1.Schema({
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
                type: mongoose_1.Schema.Types.Mixed,
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
            type: mongoose_1.Schema.Types.Mixed,
            default: {}
        },
        stats: {
            type: mongoose_1.Schema.Types.Mixed,
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
NFTSchema.index({ owner: 1, rarity: -1, discoveredAt: -1 });
NFTSchema.index({ discoverer: 1, starType: 1 });
NFTSchema.index({ contractAddress: 1, tokenId: 1 }, { unique: true });
NFTSchema.index({ questId: 1, rarity: 1 });
NFTSchema.index({ 'blockchain.network': 1, status: 1 });
NFTSchema.virtual('rarityScore').get(function () {
    const rarityScores = {
        common: 1,
        uncommon: 2,
        rare: 3,
        epic: 4,
        legendary: 5
    };
    return rarityScores[this.rarity] || 1;
});
NFTSchema.virtual('metadataUrl').get(function () {
    return `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/nft/${this.contractAddress}/${this.tokenId}/metadata`;
});
NFTSchema.methods.incrementViews = function () {
    this.stats.views += 1;
    return this.save();
};
NFTSchema.methods.incrementLikes = function () {
    this.stats.likes += 1;
    return this.save();
};
NFTSchema.methods.transfer = function (newOwner, transactionHash) {
    this.owner = newOwner.toLowerCase();
    this.stats.transfers += 1;
    if (transactionHash) {
        this.blockchain.transactionHash = transactionHash;
    }
    return this.save();
};
NFTSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};
exports.NFT = mongoose_1.default.model('NFT', NFTSchema);
//# sourceMappingURL=NFT.js.map