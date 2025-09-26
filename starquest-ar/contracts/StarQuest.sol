// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract StarQuest is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // StarQuest Token (SQT) - ERC20 token for rewards
    ERC20 public starQuestToken;
    
    // Star NFT structure
    struct StarNFT {
        uint256 id;
        string name;
        string description;
        uint8 rarity; // 1-5 (common to legendary)
        uint8 starType; // 1-5 (cosmic, elemental, mystical, digital, crystal)
        uint256 experienceReward;
        uint256 tokenReward;
        string metadataURI;
        address discoverer;
        uint256 discoveredAt;
        bool isClaimed;
    }
    
    // Quest structure
    struct Quest {
        uint256 id;
        string title;
        string description;
        uint8 difficulty; // 1-4 (easy to legendary)
        uint8 category; // 1-5 (exploration, puzzle, social, creative, challenge)
        address creator;
        uint256 rewardPool;
        uint256 maxParticipants;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        mapping(address => bool) participants;
        mapping(address => bool) completions;
    }
    
    // Mappings
    mapping(uint256 => StarNFT) public stars;
    mapping(uint256 => Quest) public quests;
    mapping(address => uint256[]) public userStars;
    mapping(address => uint256[]) public userQuests;
    mapping(address => uint256) public userExperience;
    mapping(address => uint256) public userLevel;
    
    // Events
    event StarDiscovered(uint256 indexed starId, address indexed discoverer, uint256 timestamp);
    event StarClaimed(uint256 indexed starId, address indexed claimer, uint256 experience, uint256 tokens);
    event QuestCreated(uint256 indexed questId, address indexed creator, uint256 rewardPool);
    event QuestJoined(uint256 indexed questId, address indexed participant);
    event QuestCompleted(uint256 indexed questId, address indexed participant, uint256 reward);
    
    // Modifiers
    modifier onlyActiveQuest(uint256 questId) {
        require(quests[questId].isActive, "Quest is not active");
        require(block.timestamp >= quests[questId].startTime, "Quest has not started");
        require(block.timestamp <= quests[questId].endTime, "Quest has ended");
        _;
    }
    
    constructor(address _starQuestToken) ERC721("StarQuest Stars", "STARS") {
        starQuestToken = ERC20(_starQuestToken);
    }
    
    // Create a new star NFT
    function createStar(
        string memory name,
        string memory description,
        uint8 rarity,
        uint8 starType,
        uint256 experienceReward,
        uint256 tokenReward,
        string memory metadataURI
    ) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newStarId = _tokenIds.current();
        
        stars[newStarId] = StarNFT({
            id: newStarId,
            name: name,
            description: description,
            rarity: rarity,
            starType: starType,
            experienceReward: experienceReward,
            tokenReward: tokenReward,
            metadataURI: metadataURI,
            discoverer: address(0),
            discoveredAt: 0,
            isClaimed: false
        });
        
        return newStarId;
    }
    
    // Discover a star (called when user finds it in AR)
    function discoverStar(uint256 starId) external nonReentrant {
        require(_exists(starId), "Star does not exist");
        require(stars[starId].discoverer == address(0), "Star already discovered");
        
        stars[starId].discoverer = msg.sender;
        stars[starId].discoveredAt = block.timestamp;
        
        userStars[msg.sender].push(starId);
        
        emit StarDiscovered(starId, msg.sender, block.timestamp);
    }
    
    // Claim star rewards
    function claimStar(uint256 starId) external nonReentrant {
        require(_exists(starId), "Star does not exist");
        require(stars[starId].discoverer == msg.sender, "Not the discoverer");
        require(!stars[starId].isClaimed, "Star already claimed");
        
        stars[starId].isClaimed = true;
        
        // Mint NFT to user
        _safeMint(msg.sender, starId);
        
        // Add experience
        userExperience[msg.sender] += stars[starId].experienceReward;
        _updateLevel(msg.sender);
        
        // Transfer tokens
        if (stars[starId].tokenReward > 0) {
            starQuestToken.transfer(msg.sender, stars[starId].tokenReward);
        }
        
        emit StarClaimed(starId, msg.sender, stars[starId].experienceReward, stars[starId].tokenReward);
    }
    
    // Create a new quest
    function createQuest(
        string memory title,
        string memory description,
        uint8 difficulty,
        uint8 category,
        uint256 maxParticipants,
        uint256 duration
    ) external payable returns (uint256) {
        require(msg.value > 0, "Must provide reward pool");
        require(maxParticipants > 0, "Invalid max participants");
        require(duration > 0, "Invalid duration");
        
        uint256 questId = block.timestamp; // Simple ID generation
        
        quests[questId].id = questId;
        quests[questId].title = title;
        quests[questId].description = description;
        quests[questId].difficulty = difficulty;
        quests[questId].category = category;
        quests[questId].creator = msg.sender;
        quests[questId].rewardPool = msg.value;
        quests[questId].maxParticipants = maxParticipants;
        quests[questId].startTime = block.timestamp;
        quests[questId].endTime = block.timestamp + duration;
        quests[questId].isActive = true;
        
        userQuests[msg.sender].push(questId);
        
        emit QuestCreated(questId, msg.sender, msg.value);
        
        return questId;
    }
    
    // Join a quest
    function joinQuest(uint256 questId) external onlyActiveQuest(questId) {
        require(!quests[questId].participants[msg.sender], "Already participating");
        require(quests[questId].maxParticipants > 0, "Quest is full");
        
        quests[questId].participants[msg.sender] = true;
        quests[questId].maxParticipants--;
        
        emit QuestJoined(questId, msg.sender);
    }
    
    // Complete a quest
    function completeQuest(uint256 questId) external onlyActiveQuest(questId) {
        require(quests[questId].participants[msg.sender], "Not a participant");
        require(!quests[questId].completions[msg.sender], "Already completed");
        
        quests[questId].completions[msg.sender] = true;
        
        // Calculate reward based on difficulty and participation
        uint256 reward = _calculateQuestReward(questId);
        
        // Transfer reward
        if (reward > 0) {
            payable(msg.sender).transfer(reward);
        }
        
        // Add experience
        userExperience[msg.sender] += _getQuestExperience(questId);
        _updateLevel(msg.sender);
        
        emit QuestCompleted(questId, msg.sender, reward);
    }
    
    // Get user's stars
    function getUserStars(address user) external view returns (uint256[] memory) {
        return userStars[user];
    }
    
    // Get user's quests
    function getUserQuests(address user) external view returns (uint256[] memory) {
        return userQuests[user];
    }
    
    // Get user stats
    function getUserStats(address user) external view returns (
        uint256 experience,
        uint256 level,
        uint256 starCount,
        uint256 questCount
    ) {
        return (
            userExperience[user],
            userLevel[user],
            userStars[user].length,
            userQuests[user].length
        );
    }
    
    // Internal functions
    function _updateLevel(address user) internal {
        uint256 currentLevel = userLevel[user];
        uint256 requiredExp = currentLevel * 1000; // 1000 exp per level
        
        while (userExperience[user] >= requiredExp) {
            userLevel[user]++;
            currentLevel++;
            requiredExp = currentLevel * 1000;
        }
    }
    
    function _calculateQuestReward(uint256 questId) internal view returns (uint256) {
        Quest storage quest = quests[questId];
        uint256 baseReward = quest.rewardPool / 10; // 10% of pool as base
        uint256 difficultyMultiplier = uint256(quest.difficulty) * 25; // 25% per difficulty level
        return baseReward + (baseReward * difficultyMultiplier / 100);
    }
    
    function _getQuestExperience(uint256 questId) internal view returns (uint256) {
        Quest storage quest = quests[questId];
        return uint256(quest.difficulty) * 100; // 100 exp per difficulty level
    }
    
    // Override tokenURI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return stars[tokenId].metadataURI;
    }
    
    // Withdraw contract balance (owner only)
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Emergency functions
    function pauseQuest(uint256 questId) external onlyOwner {
        quests[questId].isActive = false;
    }
    
    function resumeQuest(uint256 questId) external onlyOwner {
        quests[questId].isActive = true;
    }
}

