"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARService = void 0;
class ARService {
    constructor() {
        this.arMarkers = new Map();
        this.activeSessions = new Map();
        this.initializeARMarkers();
    }
    initializeARMarkers() {
        this.arMarkers.set('marker-1', {
            id: 'marker-1',
            name: 'Alpha Star Marker',
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            modelUrl: '/models/star-alpha.glb',
            questId: 'quest-1',
            isActive: true,
        });
        this.arMarkers.set('marker-2', {
            id: 'marker-2',
            name: 'Beta Star Marker',
            position: { x: 1, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            modelUrl: '/models/star-beta.glb',
            questId: 'quest-2',
            isActive: true,
        });
    }
    async createARMarker(markerData) {
        const markerId = `marker-${Date.now()}`;
        const marker = {
            id: markerId,
            ...markerData,
            createdAt: new Date(),
            isActive: true,
        };
        this.arMarkers.set(markerId, marker);
        return marker;
    }
    async getARMarker(markerId) {
        return this.arMarkers.get(markerId);
    }
    async getAllARMarkers() {
        return Array.from(this.arMarkers.values());
    }
    async updateARMarker(markerId, updates) {
        const marker = this.arMarkers.get(markerId);
        if (!marker) {
            throw new Error('AR marker not found');
        }
        const updatedMarker = { ...marker, ...updates, updatedAt: new Date() };
        this.arMarkers.set(markerId, updatedMarker);
        return updatedMarker;
    }
    async deleteARMarker(markerId) {
        return this.arMarkers.delete(markerId);
    }
    async startARSession(userId, questId) {
        const sessionId = `session-${userId}-${Date.now()}`;
        const session = {
            id: sessionId,
            userId,
            questId,
            startTime: new Date(),
            markersFound: [],
            isActive: true,
        };
        this.activeSessions.set(sessionId, session);
        return session;
    }
    async endARSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error('AR session not found');
        }
        session.endTime = new Date();
        session.isActive = false;
        session.duration = session.endTime.getTime() - session.startTime.getTime();
        this.activeSessions.set(sessionId, session);
        return session;
    }
    async getARSession(sessionId) {
        return this.activeSessions.get(sessionId);
    }
    async getUserARSessions(userId) {
        return Array.from(this.activeSessions.values())
            .filter(session => session.userId === userId);
    }
    async detectARMarker(sessionId, markerId, position) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error('AR session not found');
        }
        const marker = this.arMarkers.get(markerId);
        if (!marker) {
            throw new Error('AR marker not found');
        }
        const detection = {
            sessionId,
            markerId,
            position,
            detectedAt: new Date(),
            confidence: Math.random() * 0.3 + 0.7,
            isSuccessful: true,
        };
        session.markersFound.push(detection);
        this.activeSessions.set(sessionId, session);
        return detection;
    }
    async calculateARScore(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error('AR session not found');
        }
        const markersFound = session.markersFound.length;
        const averageConfidence = session.markersFound.reduce((sum, detection) => sum + detection.confidence, 0) / markersFound;
        const timeBonus = session.duration ? Math.max(0, 1 - (session.duration / 300000)) : 0;
        const score = Math.round((markersFound * 100) + (averageConfidence * 50) + (timeBonus * 25));
        return Math.max(0, score);
    }
    async getARLeaderboard(questId) {
        const sessions = Array.from(this.activeSessions.values())
            .filter(session => !session.isActive)
            .filter(session => questId ? session.questId === questId : true);
        const leaderboard = await Promise.all(sessions.map(async (session) => ({
            userId: session.userId,
            questId: session.questId,
            score: await this.calculateARScore(session.id),
            markersFound: session.markersFound.length,
            duration: session.duration,
            completedAt: session.endTime,
        })));
        return leaderboard.sort((a, b) => b.score - a.score);
    }
    async validateARChallenge(markerId, challengeData) {
        const marker = this.arMarkers.get(markerId);
        if (!marker) {
            return false;
        }
        return Math.random() > 0.1;
    }
    async generateARReward(markerId, userId) {
        const marker = this.arMarkers.get(markerId);
        if (!marker) {
            throw new Error('AR marker not found');
        }
        const reward = {
            id: `reward-${Date.now()}`,
            markerId,
            userId,
            type: 'nft',
            rarity: this.calculateRarity(marker),
            points: Math.floor(Math.random() * 100) + 50,
            createdAt: new Date(),
        };
        return reward;
    }
    calculateRarity(marker) {
        const rarities = ['common', 'rare', 'epic', 'legendary'];
        const weights = [0.5, 0.3, 0.15, 0.05];
        const random = Math.random();
        let cumulative = 0;
        for (let i = 0; i < weights.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return rarities[i];
            }
        }
        return 'common';
    }
}
exports.ARService = ARService;
//# sourceMappingURL=ARService.js.map