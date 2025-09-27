// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title StarQuest Consensus Service Contract
 * @dev Integrates with Hedera Consensus Service (HCS) for immutable game logs
 * Records game events, leaderboards, and AI decision logs
 */
contract StarQuestConsensusService is Ownable, ReentrancyGuard {
    
    // State variables
    address public starQuestCore;
    string public topicId; // HCS Topic ID
    uint256 public messageCount;
    
    // Message types for HCS
    enum MessageType { 
        GameEvent,      // General game events
        ChallengeLog,   // Challenge completion logs
        AIDecision,     // AI verification decisions
        LeaderboardUpdate, // Leaderboard changes
        AchievementUnlock, // Player achievements
        SystemEvent     // System-level events
    }
    
    // Structs
    struct ConsensusMessage {
        uint256 id;
        MessageType messageType;
        address player;
        bytes32 dataHash;
        string ipfsHash; // Full data stored on IPFS
        uint256 timestamp;
        bool submitted;
        string hcsMessageId; // HCS message ID after submission
    }
    
    struct GameEventLog {
        address player;
        string eventType;
        bytes32 challengeId;
        uint256 stakeAmount;
        bool success;
        uint256 payout;
        uint256 timestamp;
        string proofHash;
    }
    
    struct AIDecisionLog {
        bytes32 challengeId;
        address aiAgent;
        string challengeType;
        bool verified;
        uint256 confidence; // AI confidence score (0-100)
        string reasoningHash; // IPFS hash of AI reasoning
        uint256 timestamp;
    }
    
    struct LeaderboardEntry {
        address player;
        uint256 totalStaked;
        uint256 totalWon;
        uint256 winRate; // Percentage (0-10000, where 10000 = 100%)
        uint256 streak;
        uint256 lastUpdated;
    }
    
    // Mappings
    mapping(uint256 => ConsensusMessage) public consensusMessages;
    mapping(bytes32 => GameEventLog) public gameEventLogs;
    mapping(bytes32 => AIDecisionLog) public aiDecisionLogs;
    mapping(address => LeaderboardEntry) public leaderboard;
    mapping(address => uint256[]) public playerMessageHistory;
    mapping(MessageType => uint256) public messageTypeCount;
    
    // Arrays for rankings
    address[] public topPlayers;
    mapping(address => uint256) public playerRankings; // player => rank index
    
    // Events
    event MessageSubmitted(uint256 indexed messageId, MessageType messageType, address indexed player);
    event HCSMessageConfirmed(uint256 indexed messageId, string hcsMessageId);
    event GameEventLogged(bytes32 indexed eventId, address indexed player, bool success);
    event AIDecisionLogged(bytes32 indexed challengeId, address indexed aiAgent, bool verified);
    event LeaderboardUpdated(address indexed player, uint256 newRank);
    event TopicUpdated(string newTopicId);
    
    // Modifiers
    modifier onlyStarQuestCore() {
        require(msg.sender == starQuestCore, "Only StarQuest core");
        _;
    }
    
    modifier onlyAuthorizedSender() {
        require(msg.sender == starQuestCore || msg.sender == owner(), "Not authorized");
        _;
    }
    
    constructor(string memory _topicId) {
        topicId = _topicId;
    }
    
    /**
     * @dev Set StarQuest core contract
     */
    function setStarQuestCore(address _starQuestCore) external onlyOwner {
        starQuestCore = _starQuestCore;
    }
    
    /**
     * @dev Update HCS topic ID
     */
    function updateTopicId(string memory _topicId) external onlyOwner {
        topicId = _topicId;
        emit TopicUpdated(_topicId);
    }
    
    /**
     * @dev Submit game event to consensus service
     */
    function submitGameEvent(
        address player,
        bytes32 challengeId,
        uint256 stakeAmount,
        bool success,
        uint256 payout,
        string memory proofHash,
        string memory ipfsHash
    ) external onlyStarQuestCore returns (uint256) {
        uint256 messageId = messageCount++;
        bytes32 eventId = keccak256(abi.encodePacked(challengeId, player, block.timestamp));
        
        // Create game event log
        gameEventLogs[eventId] = GameEventLog({
            player: player,
            eventType: success ? "challenge_success" : "challenge_failed",
            challengeId: challengeId,
            stakeAmount: stakeAmount,
            success: success,
            payout: payout,
            timestamp: block.timestamp,
            proofHash: proofHash
        });
        
        // Create consensus message
        bytes32 dataHash = keccak256(abi.encodePacked(
            player,
            challengeId,
            stakeAmount,
            success,
            payout,
            block.timestamp
        ));
        
        consensusMessages[messageId] = ConsensusMessage({
            id: messageId,
            messageType: MessageType.GameEvent,
            player: player,
            dataHash: dataHash,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            submitted: false,
            hcsMessageId: ""
        });
        
        playerMessageHistory[player].push(messageId);
        messageTypeCount[MessageType.GameEvent]++;
        
        emit MessageSubmitted(messageId, MessageType.GameEvent, player);
        emit GameEventLogged(eventId, player, success);
        
        // Update leaderboard
        _updateLeaderboard(player, stakeAmount, payout, success);
        
        return messageId;
    }
    
    /**
     * @dev Submit AI decision to consensus service
     */
    function submitAIDecision(
        bytes32 challengeId,
        address aiAgent,
        string memory challengeType,
        bool verified,
        uint256 confidence,
        string memory reasoningHash,
        string memory ipfsHash
    ) external onlyAuthorizedSender returns (uint256) {
        uint256 messageId = messageCount++;
        
        // Create AI decision log
        aiDecisionLogs[challengeId] = AIDecisionLog({
            challengeId: challengeId,
            aiAgent: aiAgent,
            challengeType: challengeType,
            verified: verified,
            confidence: confidence,
            reasoningHash: reasoningHash,
            timestamp: block.timestamp
        });
        
        // Create consensus message
        bytes32 dataHash = keccak256(abi.encodePacked(
            challengeId,
            aiAgent,
            verified,
            confidence,
            block.timestamp
        ));
        
        consensusMessages[messageId] = ConsensusMessage({
            id: messageId,
            messageType: MessageType.AIDecision,
            player: address(0), // AI decisions are not player-specific
            dataHash: dataHash,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            submitted: false,
            hcsMessageId: ""
        });
        
        messageTypeCount[MessageType.AIDecision]++;
        
        emit MessageSubmitted(messageId, MessageType.AIDecision, address(0));
        emit AIDecisionLogged(challengeId, aiAgent, verified);
        
        return messageId;
    }
    
    /**
     * @dev Submit achievement unlock to consensus service
     */
    function submitAchievementUnlock(
        address player,
        uint256 achievementType,
        string memory achievementName,
        string memory ipfsHash
    ) external onlyStarQuestCore returns (uint256) {
        uint256 messageId = messageCount++;
        
        bytes32 dataHash = keccak256(abi.encodePacked(
            player,
            achievementType,
            achievementName,
            block.timestamp
        ));
        
        consensusMessages[messageId] = ConsensusMessage({
            id: messageId,
            messageType: MessageType.AchievementUnlock,
            player: player,
            dataHash: dataHash,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            submitted: false,
            hcsMessageId: ""
        });
        
        playerMessageHistory[player].push(messageId);
        messageTypeCount[MessageType.AchievementUnlock]++;
        
        emit MessageSubmitted(messageId, MessageType.AchievementUnlock, player);
        
        return messageId;
    }
    
    /**
     * @dev Confirm HCS message submission (called by backend service)
     */
    function confirmHCSMessage(uint256 messageId, string memory hcsMessageId) external onlyOwner {
        require(messageId < messageCount, "Invalid message ID");
        ConsensusMessage storage message = consensusMessages[messageId];
        require(!message.submitted, "Already confirmed");
        
        message.submitted = true;
        message.hcsMessageId = hcsMessageId;
        
        emit HCSMessageConfirmed(messageId, hcsMessageId);
    }
    
    /**
     * @dev Update player leaderboard entry
     */
    function _updateLeaderboard(
        address player,
        uint256 stakeAmount,
        uint256 payout,
        bool success
    ) private {
        LeaderboardEntry storage entry = leaderboard[player];
        
        // Update stats
        entry.player = player;
        entry.totalStaked += stakeAmount;
        
        if (success) {
            entry.totalWon += payout;
            entry.streak++;
        } else {
            entry.streak = 0;
        }
        
        // Calculate win rate (percentage with 2 decimal precision)
        if (entry.totalStaked > 0) {
            entry.winRate = (entry.totalWon * 10000) / entry.totalStaked;
        }
        
        entry.lastUpdated = block.timestamp;
        
        // Update player ranking
        _updatePlayerRanking(player);
    }
    
    /**
     * @dev Update player ranking in leaderboard
     */
    function _updatePlayerRanking(address player) private {
        LeaderboardEntry memory playerEntry = leaderboard[player];
        
        // Remove player from current position if already in leaderboard
        if (playerRankings[player] > 0) {
            uint256 currentIndex = playerRankings[player] - 1;
            if (currentIndex < topPlayers.length && topPlayers[currentIndex] == player) {
                // Remove player from array
                for (uint256 i = currentIndex; i < topPlayers.length - 1; i++) {
                    topPlayers[i] = topPlayers[i + 1];
                    playerRankings[topPlayers[i]] = i + 1;
                }
                topPlayers.pop();
            }
        }
        
        // Find correct position for player
        uint256 insertIndex = topPlayers.length;
        for (uint256 i = 0; i < topPlayers.length; i++) {
            LeaderboardEntry memory currentEntry = leaderboard[topPlayers[i]];
            
            // Compare by win rate first, then by total won
            if (playerEntry.winRate > currentEntry.winRate || 
                (playerEntry.winRate == currentEntry.winRate && playerEntry.totalWon > currentEntry.totalWon)) {
                insertIndex = i;
                break;
            }
        }
        
        // Insert player at correct position
        topPlayers.push(player);
        for (uint256 i = topPlayers.length - 1; i > insertIndex; i--) {
            topPlayers[i] = topPlayers[i - 1];
        }
        topPlayers[insertIndex] = player;
        
        // Update all rankings
        for (uint256 i = 0; i < topPlayers.length; i++) {
            playerRankings[topPlayers[i]] = i + 1;
        }
        
        emit LeaderboardUpdated(player, insertIndex + 1);
    }
    
    /**
     * @dev Get top N players from leaderboard
     */
    function getTopPlayers(uint256 count) external view returns (address[] memory, LeaderboardEntry[] memory) {
        uint256 actualCount = count > topPlayers.length ? topPlayers.length : count;
        address[] memory players = new address[](actualCount);
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](actualCount);
        
        for (uint256 i = 0; i < actualCount; i++) {
            players[i] = topPlayers[i];
            entries[i] = leaderboard[topPlayers[i]];
        }
        
        return (players, entries);
    }
    
    /**
     * @dev Get player's message history
     */
    function getPlayerMessageHistory(address player) external view returns (uint256[] memory) {
        return playerMessageHistory[player];
    }
    
    /**
     * @dev Get message details
     */
    function getConsensusMessage(uint256 messageId) external view returns (ConsensusMessage memory) {
        require(messageId < messageCount, "Invalid message ID");
        return consensusMessages[messageId];
    }
    
    /**
     * @dev Get game event log
     */
    function getGameEventLog(bytes32 eventId) external view returns (GameEventLog memory) {
        return gameEventLogs[eventId];
    }
    
    /**
     * @dev Get AI decision log
     */
    function getAIDecisionLog(bytes32 challengeId) external view returns (AIDecisionLog memory) {
        return aiDecisionLogs[challengeId];
    }
    
    /**
     * @dev Get message count by type
     */
    function getMessageCountByType(MessageType messageType) external view returns (uint256) {
        return messageTypeCount[messageType];
    }
    
    /**
     * @dev Get player ranking
     */
    function getPlayerRanking(address player) external view returns (uint256) {
        return playerRankings[player]; // 0 means not ranked, 1+ is actual ranking
    }
    
    /**
     * @dev Get total message count
     */
    function getTotalMessageCount() external view returns (uint256) {
        return messageCount;
    }
    
    /**
     * @dev Get leaderboard stats
     */
    function getLeaderboardStats() external view returns (
        uint256 totalPlayers,
        uint256 totalStaked,
        uint256 totalWon
    ) {
        totalPlayers = topPlayers.length;
        
        for (uint256 i = 0; i < topPlayers.length; i++) {
            LeaderboardEntry memory entry = leaderboard[topPlayers[i]];
            totalStaked += entry.totalStaked;
            totalWon += entry.totalWon;
        }
        
        return (totalPlayers, totalStaked, totalWon);
    }
}