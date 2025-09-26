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
exports.Star = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const StarSchema = new mongoose_1.Schema({
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
StarSchema.index({ 'location.coordinates': '2dsphere' });
StarSchema.index({ quest: 1, status: 1 });
StarSchema.index({ discoverer: 1 });
StarSchema.index({ rarity: 1, type: 1 });
StarSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
StarSchema.virtual('discoveryCount').get(function () {
    return this.discoverers.length;
});
StarSchema.virtual('isDiscoverable').get(function () {
    if (this.status !== 'hidden')
        return false;
    if (this.expiresAt && this.expiresAt < new Date())
        return false;
    return true;
});
StarSchema.methods.discover = function (userId) {
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
StarSchema.methods.claim = function (userId) {
    if (this.status !== 'discovered') {
        throw new Error('Star must be discovered before claiming');
    }
    if (!this.discoverers.includes(userId)) {
        throw new Error('User has not discovered this star');
    }
    this.status = 'claimed';
    return this.save();
};
StarSchema.methods.checkConditions = function (userLocation, userItems) {
    const distance = this.calculateDistance(userLocation);
    if (distance > 50)
        return false;
    if (this.conditions.requiredItems) {
        const hasAllItems = this.conditions.requiredItems.every((item) => userItems.includes(item));
        if (!hasAllItems)
            return false;
    }
    if (this.conditions.timeOfDay && this.conditions.timeOfDay !== 'any') {
        const currentHour = new Date().getHours();
        const timeOfDay = this.getTimeOfDay(currentHour);
        if (timeOfDay !== this.conditions.timeOfDay)
            return false;
    }
    return true;
};
StarSchema.methods.calculateDistance = function (userLocation) {
    const R = 6371e3;
    const φ1 = this.location.coordinates.latitude * Math.PI / 180;
    const φ2 = userLocation.latitude * Math.PI / 180;
    const Δφ = (userLocation.latitude - this.location.coordinates.latitude) * Math.PI / 180;
    const Δλ = (userLocation.longitude - this.location.coordinates.longitude) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
StarSchema.methods.getTimeOfDay = function (hour) {
    if (hour >= 6 && hour < 12)
        return 'dawn';
    if (hour >= 12 && hour < 18)
        return 'day';
    if (hour >= 18 && hour < 22)
        return 'dusk';
    return 'night';
};
exports.Star = mongoose_1.default.model('Star', StarSchema);
//# sourceMappingURL=Star.js.map