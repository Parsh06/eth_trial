// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.6/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.6/contracts/security/ReentrancyGuard.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.6/contracts/security/Pausable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.6/contracts/utils/Counters.sol";

/**
 * @title StarQuest Core Contract
 * @dev Main game logic contract for StarQuest AR with staking and challenges
 * Deployed on Hedera EVM (Testnet/Mainnet)
 */
contract StarQuest is Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    // State variables
    address public storageWallet;
    address public oracleContract;
    uint256 public minimumStake = 0.01 ether;
    uint256 public maximumStake = 10 ether;
    uint256 public winMultiplier = 200; // 2x = 200% (in basis points)
    uint256 public houseFeePercent = 5; // 5% house fee
    
    Counters.Counter private _challengeIds;
    Counters.Counter private _sessionIds;

    // Enums
    enum ChallengeStatus { Active, Completed, Failed, Disputed }
    enum StarType { Common, Rare, Epic, Legendary }

    // Structs
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        bool active;
        uint256 challengeId;
    }

    struct Challenge {
        uint256 id;
        address player;
        uint256 stakeAmount;
        string challengeHash; // IPFS hash of challenge data
        string proofHash; // IPFS hash of proof submission
        ChallengeStatus status;
        uint256 createdAt;
        uint256 completedAt;
        bool aiVerified;
        uint256 starId;
        StarType starType;
    }

    struct Star {
        uint256 id;
        int256 latitude; // Stored as fixed point (multiply by 1e6)
        int256 longitude; // Stored as fixed point (multiply by 1e6)
        uint256 radius; // In meters
        StarType starType;
        bool active;
        uint256 challengesCompleted;
        uint256 totalStaked;
    }

    struct PlayerStats {
        uint256 totalStaked;
        uint256 totalWon;
        uint256 challengesCompleted;
        uint256 challengesFailed;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastPlayedTimestamp;
    }

    // Mappings
    mapping(address => Stake) public playerStakes;
    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => Star) public stars;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => bool) public authorizedAI; // AI agents that can verify challenges
    mapping(address => uint256[]) public playerChallengeHistory;

    // Events
    event Staked(address indexed player, uint256 amount, uint256 challengeId);
    event ChallengeCreated(uint256 indexed challengeId, address indexed player, uint256 starId, string challengeHash);
    event ChallengeCompleted(uint256 indexed challengeId, address indexed player, bool success, uint256 payout);
    event StarAdded(uint256 indexed starId, int256 latitude, int256 longitude, StarType starType);
    event StarUpdated(uint256 indexed starId, bool active);
    event AIAgentAuthorized(address indexed aiAgent, bool authorized);
    event EmergencyWithdrawal(address indexed player, uint256 amount);

    // Modifiers
    modifier onlyAuthorizedAI() {
        require(authorizedAI[msg.sender] || msg.sender == owner(), "Not authorized AI");
        _;
    }

    modifier validStakeAmount(uint256 amount) {
        require(amount >= minimumStake && amount <= maximumStake, "Invalid stake amount");
        _;
    }

    constructor(address _storageWallet) {
        storageWallet = _storageWallet;
        _transferOwnership(msg.sender);
    }

    /**
     * @dev Stake HBAR/ETH to participate in a challenge
     * @param starId The ID of the star to challenge
     */
    function createStake(uint256 starId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validStakeAmount(msg.value) 
    {
        require(stars[starId].active, "Star not active");
        require(!playerStakes[msg.sender].active, "Already have active stake");

        uint256 challengeId = _challengeIds.current();
        _challengeIds.increment();

        // Create stake
        playerStakes[msg.sender] = Stake({
            amount: msg.value,
            timestamp: block.timestamp,
            active: true,
            challengeId: challengeId
        });

        // Create challenge
        challenges[challengeId] = Challenge({
            id: challengeId,
            player: msg.sender,
            stakeAmount: msg.value,
            challengeHash: "",
            proofHash: "",
            status: ChallengeStatus.Active,
            createdAt: block.timestamp,
            completedAt: 0,
            aiVerified: false,
            starId: starId,
            starType: stars[starId].starType
        });

        // Update star stats
        stars[starId].totalStaked += msg.value;

        // Update player history
        playerChallengeHistory[msg.sender].push(challengeId);

        emit Staked(msg.sender, msg.value, challengeId);
    }

    /**
     * @dev Submit challenge data (called by AI service)
     * @param challengeId The challenge ID
     * @param challengeHash IPFS hash of challenge data
     */
    function submitChallenge(uint256 challengeId, string memory challengeHash) 
        external 
        onlyAuthorizedAI 
    {
        require(challenges[challengeId].status == ChallengeStatus.Active, "Challenge not active");
        
        challenges[challengeId].challengeHash = challengeHash;
        
        emit ChallengeCreated(challengeId, challenges[challengeId].player, challenges[challengeId].starId, challengeHash);
    }

    /**
     * @dev Complete challenge with AI verification
     * @param challengeId The challenge ID
     * @param proofHash IPFS hash of player's proof
     * @param success Whether the challenge was successful
     */
    function completeChallenge(
        uint256 challengeId, 
        string memory proofHash, 
        bool success
    ) 
        external 
        onlyAuthorizedAI 
        nonReentrant 
    {
        Challenge storage challenge = challenges[challengeId];
        require(challenge.status == ChallengeStatus.Active, "Challenge not active");
        
        address player = challenge.player;
        Stake storage playerStakeData = playerStakes[player];
        require(playerStakeData.active && playerStakeData.challengeId == challengeId, "Invalid stake");

        // Update challenge
        challenge.proofHash = proofHash;
        challenge.completedAt = block.timestamp;
        challenge.aiVerified = true;
        challenge.status = success ? ChallengeStatus.Completed : ChallengeStatus.Failed;

        // Deactivate stake
        playerStakeData.active = false;

        uint256 payout = 0;

        if (success) {
            // Calculate payout based on star type and multiplier
            uint256 baseMultiplier = getStarMultiplier(challenge.starType);
            payout = (playerStakeData.amount * baseMultiplier) / 100;
            
            // Deduct house fee
            uint256 houseFee = (payout * houseFeePercent) / 100;
            payout -= houseFee;

            // Transfer payout to player
            payable(player).transfer(payout);
            
            // Transfer house fee to storage wallet
            if (houseFee > 0) {
                payable(storageWallet).transfer(houseFee);
            }

            // Update player stats - success
            PlayerStats storage stats = playerStats[player];
            stats.totalWon += payout;
            stats.challengesCompleted++;
            stats.currentStreak++;
            if (stats.currentStreak > stats.longestStreak) {
                stats.longestStreak = stats.currentStreak;
            }
        } else {
            // Transfer stake to storage wallet
            payable(storageWallet).transfer(playerStakeData.amount);
            
            // Update player stats - failure
            PlayerStats storage stats = playerStats[player];
            stats.challengesFailed++;
            stats.currentStreak = 0;
        }

        // Update star stats
        stars[challenge.starId].challengesCompleted++;

        // Update player total stats
        playerStats[player].totalStaked += playerStakeData.amount;
        playerStats[player].lastPlayedTimestamp = block.timestamp;

        emit ChallengeCompleted(challengeId, player, success, payout);
    }

    /**
     * @dev Get multiplier based on star type
     */
    function getStarMultiplier(StarType starType) public pure returns (uint256) {
        if (starType == StarType.Common) return 150; // 1.5x
        if (starType == StarType.Rare) return 200;   // 2x
        if (starType == StarType.Epic) return 300;   // 3x
        if (starType == StarType.Legendary) return 500; // 5x
        return 150; // Default
    }

    /**
     * @dev Add a new star location (only owner)
     */
    function addStar(
        uint256 starId,
        int256 latitude,
        int256 longitude,
        uint256 radius,
        StarType starType
    ) external onlyOwner {
        require(stars[starId].id == 0, "Star already exists");
        
        stars[starId] = Star({
            id: starId,
            latitude: latitude,
            longitude: longitude,
            radius: radius,
            starType: starType,
            active: true,
            challengesCompleted: 0,
            totalStaked: 0
        });

        emit StarAdded(starId, latitude, longitude, starType);
    }

    /**
     * @dev Update star status
     */
    function updateStar(uint256 starId, bool active) external onlyOwner {
        require(stars[starId].id != 0, "Star does not exist");
        stars[starId].active = active;
        emit StarUpdated(starId, active);
    }

    /**
     * @dev Authorize AI agent
     */
    function authorizeAI(address aiAgent, bool authorized) external onlyOwner {
        authorizedAI[aiAgent] = authorized;
        emit AIAgentAuthorized(aiAgent, authorized);
    }

    /**
     * @dev Emergency withdrawal (only in case of issues)
     */
    function emergencyWithdraw() external nonReentrant {
        Stake storage playerStakeData = playerStakes[msg.sender];
        require(playerStakeData.active, "No active stake");
        require(block.timestamp > playerStakeData.timestamp + 24 hours, "Must wait 24 hours");

        uint256 amount = playerStakeData.amount;
        playerStakeData.active = false;

        // Mark challenge as failed
        if (challenges[playerStakeData.challengeId].status == ChallengeStatus.Active) {
            challenges[playerStakeData.challengeId].status = ChallengeStatus.Failed;
        }

        payable(msg.sender).transfer(amount);
        emit EmergencyWithdrawal(msg.sender, amount);
    }

    /**
     * @dev Get player's challenge history
     */
    function getPlayerChallengeHistory(address player) external view returns (uint256[] memory) {
        return playerChallengeHistory[player];
    }

    /**
     * @dev Get challenge details
     */
    function getChallengeDetails(uint256 challengeId) external view returns (Challenge memory) {
        return challenges[challengeId];
    }

    /**
     * @dev Get star details
     */
    function getStarDetails(uint256 starId) external view returns (Star memory) {
        return stars[starId];
    }

    /**
     * @dev Set game parameters (only owner)
     */
    function setGameParameters(
        uint256 _minimumStake,
        uint256 _maximumStake,
        uint256 _winMultiplier,
        uint256 _houseFeePercent,
        address _storageWallet
    ) external onlyOwner {
        minimumStake = _minimumStake;
        maximumStake = _maximumStake;
        winMultiplier = _winMultiplier;
        houseFeePercent = _houseFeePercent;
        storageWallet = _storageWallet;
    }

    /**
     * @dev Pause/unpause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdrawBalance() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Fallback function to receive HBAR/ETH
     */
    receive() external payable {}
}