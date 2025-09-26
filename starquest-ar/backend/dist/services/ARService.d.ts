export declare class ARService {
    private arMarkers;
    private activeSessions;
    constructor();
    private initializeARMarkers;
    createARMarker(markerData: any): Promise<any>;
    getARMarker(markerId: string): Promise<any>;
    getAllARMarkers(): Promise<any[]>;
    updateARMarker(markerId: string, updates: any): Promise<any>;
    deleteARMarker(markerId: string): Promise<boolean>;
    startARSession(userId: string, questId: string): Promise<any>;
    endARSession(sessionId: string): Promise<any>;
    getARSession(sessionId: string): Promise<any>;
    getUserARSessions(userId: string): Promise<any[]>;
    detectARMarker(sessionId: string, markerId: string, position: any): Promise<any>;
    calculateARScore(sessionId: string): Promise<number>;
    getARLeaderboard(questId?: string): Promise<any[]>;
    validateARChallenge(markerId: string, challengeData: any): Promise<boolean>;
    generateARReward(markerId: string, userId: string): Promise<any>;
    private calculateRarity;
}
//# sourceMappingURL=ARService.d.ts.map