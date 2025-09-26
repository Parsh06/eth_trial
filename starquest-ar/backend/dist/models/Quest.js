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
exports.Quest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const QuestSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
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
                type: mongoose_1.Schema.Types.ObjectId,
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
QuestSchema.index({ location: '2dsphere' });
QuestSchema.index({ status: 1, startDate: 1 });
QuestSchema.index({ creator: 1 });
QuestSchema.index({ 'metadata.tags': 1 });
QuestSchema.index({ difficulty: 1, category: 1 });
QuestSchema.virtual('participantCount').get(function () {
    return this.participants.length;
});
QuestSchema.virtual('isFull').get(function () {
    if (!this.maxParticipants)
        return false;
    return this.participants.length >= this.maxParticipants;
});
QuestSchema.methods.addParticipant = function (userId) {
    if (this.isFull) {
        throw new Error('Quest is full');
    }
    if (this.participants.includes(userId)) {
        throw new Error('User already participating');
    }
    this.participants.push(userId);
    return this.save();
};
QuestSchema.methods.removeParticipant = function (userId) {
    this.participants = this.participants.filter((id) => id.toString() !== userId);
    return this.save();
};
QuestSchema.methods.updateCompletionRate = function () {
    if (this.participants.length === 0) {
        this.metadata.completionRate = 0;
    }
    else {
        this.metadata.completionRate = Math.random() * 100;
    }
    return this.save();
};
exports.Quest = mongoose_1.default.model('Quest', QuestSchema);
//# sourceMappingURL=Quest.js.map