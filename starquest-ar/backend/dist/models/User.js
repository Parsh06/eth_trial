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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
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
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ level: -1, experience: -1 });
UserSchema.index({ 'stats.totalStars': -1 });
UserSchema.virtual('completionRate').get(function () {
    if (this.stats.totalQuests === 0)
        return 0;
    return (this.stats.completedQuests / this.stats.totalQuests) * 100;
});
UserSchema.methods.addExperience = function (amount) {
    this.experience += amount;
    const requiredExp = this.level * 100;
    if (this.experience >= requiredExp) {
        this.level += 1;
        this.experience -= requiredExp;
        return { leveledUp: true, newLevel: this.level };
    }
    return { leveledUp: false };
};
UserSchema.methods.collectStar = function () {
    this.starsCollected += 1;
    this.stats.totalStars += 1;
    this.stats.lastActive = new Date();
    const expGained = 10;
    return this.addExperience(expGained);
};
exports.User = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map