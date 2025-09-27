import { starQuestWeb3Service } from './StarQuestWeb3Service';

export interface GameResult {
  success: boolean;
  challengeId: number;
  transactionHash?: string;
  payout?: string;
  error?: string;
}

export class GameCompletionService {
  /**
   * Complete a challenge with game result
   */
  async completeChallenge(
    challengeId: number, 
    gameSuccess: boolean, 
    proofHash: string = ''
  ): Promise<GameResult> {
    try {
      console.log(`🎯 Completing challenge ${challengeId}, success: ${gameSuccess}`);

      // In a real implementation, this would call the smart contract
      // For now, we'll simulate the completion
      const result = await this.simulateChallengeCompletion(challengeId, gameSuccess);

      if (result.success) {
        console.log('✅ Challenge completed successfully!');
        return {
          success: true,
          challengeId,
          transactionHash: result.transactionHash,
          payout: result.payout
        };
      } else {
        console.log('❌ Challenge failed');
        return {
          success: false,
          challengeId,
          error: 'Challenge completion failed'
        };
      }
    } catch (error: any) {
      console.error('❌ Failed to complete challenge:', error);
      return {
        success: false,
        challengeId,
        error: error.message
      };
    }
  }

  /**
   * Get challenge status
   */
  async getChallengeStatus(challengeId: number): Promise<any> {
    try {
      return await starQuestWeb3Service.getChallengeInfo(challengeId);
    } catch (error) {
      console.error('❌ Failed to get challenge status:', error);
      throw error;
    }
  }

  /**
   * Listen for challenge completion events
   */
  startChallengeEventListener(callbacks: {
    onChallengeCompleted?: (result: any) => void;
    onError?: (error: any) => void;
  }) {
    starQuestWeb3Service.startEventListening({
      onChallengeCompleted: (event) => {
        console.log('🎯 Challenge completed event received:', event);
        if (callbacks.onChallengeCompleted) {
          callbacks.onChallengeCompleted(event);
        }
      },
      onError: (error) => {
        console.error('❌ Challenge event error:', error);
        if (callbacks.onError) {
          callbacks.onError(error);
        }
      }
    });
  }

  /**
   * Stop listening to events
   */
  stopChallengeEventListener() {
    starQuestWeb3Service.stopEventListening();
  }

  /**
   * Simulate challenge completion (replace with real smart contract call)
   */
  private async simulateChallengeCompletion(
    challengeId: number, 
    gameSuccess: boolean
  ): Promise<{ success: boolean; transactionHash?: string; payout?: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (gameSuccess) {
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        payout: '0.02' // Example payout
      };
    } else {
      return {
        success: false
      };
    }
  }
}

// Export singleton instance
export const gameCompletionService = new GameCompletionService();
