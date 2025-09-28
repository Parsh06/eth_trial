// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title StarQuest Filecoin Storage Contract
 * @dev Handles AI training data storage on Filecoin with USDFC payments
 * Integrates with Synapse SDK for warm storage services
 */
contract StarQuestFilecoinStorage is Ownable, ReentrancyGuard {
    
    // USDFC Token interface
    IERC20 public usdfc;
    
    // State variables
    address public synapseSdk;
    address public starQuestCore;
    uint256 public storagePrice = 1e6; // 1 USDFC per GB per month
    uint256 public retrievalPrice = 0.1e6; // 0.1 USDFC per GB
    
    // Storage states
    enum StorageStatus { Pending, Stored, Retrieved, Expired }
    enum DataType { ChallengeData, AITrainingData, PlayerProofs, GameAssets }
    
    // Structs
    struct StorageRequest {
        bytes32 id;
        address requester;
        string cidHash; // IPFS/Filecoin CID
        DataType dataType;
        uint256 dataSize; // in bytes
        uint256 storageDuration; // in seconds
        uint256 cost; // in USDFC
        StorageStatus status;
        uint256 createdAt;
        uint256 expiresAt;
        string dealId; // Filecoin deal ID
        bool paid;
    }
    
    struct AIDataset {
        bytes32 id;
        string cidHash;
        string metadataCid;
        address contributor;
        uint256 size;
        uint256 rewardPool; // USDFC rewards for contributors
        uint256 accessPrice; // USDFC price for access
        bool verified;
        uint256 downloads;
        mapping(address => bool) hasAccess;
    }
    
    // Mappings
    mapping(bytes32 => StorageRequest) public storageRequests;
    mapping(bytes32 => AIDataset) public aiDatasets;
    mapping(address => bytes32[]) public userStorageRequests;
    mapping(address => bytes32[]) public userDatasets;
    mapping(DataType => uint256) public dataTypeCount;
    mapping(address => uint256) public userStorageBalance; // USDFC balance for storage
    
    // Events
    event StorageRequested(bytes32 indexed id, address indexed requester, string cidHash, uint256 cost);
    event StorageCompleted(bytes32 indexed id, string dealId);
    event DataRetrieved(bytes32 indexed id, address indexed retriever);
    event AIDatasetUploaded(bytes32 indexed id, address indexed contributor, string cidHash);
    event AIDatasetAccessed(bytes32 indexed id, address indexed accessor, uint256 cost);
    event PaymentReceived(address indexed payer, uint256 amount);
    event StorageBalanceUpdated(address indexed user, uint256 balance);
    
    // Modifiers
    modifier onlySynapse() {
        require(msg.sender == synapseSdk, "Only Synapse SDK");
        _;
    }
    
    modifier onlyStarQuestCore() {
        require(msg.sender == starQuestCore, "Only StarQuest core");
        _;
    }
    
    constructor(address _usdfc) {
        usdfc = IERC20(_usdfc);
    }
    
    /**
     * @dev Set contract addresses
     */
    function setContracts(address _synapseSdk, address _starQuestCore) external onlyOwner {
        synapseSdk = _synapseSdk;
        starQuestCore = _starQuestCore;
    }
    
    /**
     * @dev Set storage pricing
     */
    function setStoragePricing(uint256 _storagePrice, uint256 _retrievalPrice) external onlyOwner {
        storagePrice = _storagePrice;
        retrievalPrice = _retrievalPrice;
    }
    
    /**
     * @dev Deposit USDFC for storage services
     */
    function depositStorageBalance(uint256 amount) external {
        require(usdfc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        userStorageBalance[msg.sender] += amount;
        emit StorageBalanceUpdated(msg.sender, userStorageBalance[msg.sender]);
    }
    
    /**
     * @dev Request storage for game data
     */
    function requestStorage(
        string memory cidHash,
        DataType dataType,
        uint256 dataSize,
        uint256 storageDuration
    ) external returns (bytes32) {
        require(dataSize > 0, "Data size must be > 0");
        require(storageDuration > 0, "Storage duration must be > 0");
        
        // Calculate cost (dataSize in GB * duration in months * price per GB per month)
        uint256 sizeInGB = (dataSize + 1e9 - 1) / 1e9; // Round up to nearest GB
        uint256 durationInMonths = (storageDuration + 2592000 - 1) / 2592000; // Round up to nearest month
        uint256 totalCost = sizeInGB * durationInMonths * storagePrice;
        
        require(userStorageBalance[msg.sender] >= totalCost, "Insufficient balance");
        
        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, cidHash, block.timestamp));
        
        storageRequests[requestId] = StorageRequest({
            id: requestId,
            requester: msg.sender,
            cidHash: cidHash,
            dataType: dataType,
            dataSize: dataSize,
            storageDuration: storageDuration,
            cost: totalCost,
            status: StorageStatus.Pending,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + storageDuration,
            dealId: "",
            paid: false
        });
        
        // Deduct cost from user balance
        userStorageBalance[msg.sender] -= totalCost;
        storageRequests[requestId].paid = true;
        
        userStorageRequests[msg.sender].push(requestId);
        dataTypeCount[dataType]++;
        
        emit StorageRequested(requestId, msg.sender, cidHash, totalCost);
        return requestId;
    }
    
    /**
     * @dev Confirm storage completion (called by Synapse SDK)
     */
    function confirmStorage(bytes32 requestId, string memory dealId) external onlySynapse {
        StorageRequest storage request = storageRequests[requestId];
        require(request.status == StorageStatus.Pending, "Invalid status");
        
        request.status = StorageStatus.Stored;
        request.dealId = dealId;
        
        emit StorageCompleted(requestId, dealId);
    }
    
    /**
     * @dev Request data retrieval
     */
    function requestRetrieval(bytes32 requestId) external {
        StorageRequest storage request = storageRequests[requestId];
        require(request.status == StorageStatus.Stored, "Data not stored");
        require(block.timestamp < request.expiresAt, "Storage expired");
        
        // Calculate retrieval cost
        uint256 sizeInGB = (request.dataSize + 1e9 - 1) / 1e9;
        uint256 retrievalCost = sizeInGB * retrievalPrice;
        
        require(userStorageBalance[msg.sender] >= retrievalCost, "Insufficient balance for retrieval");
        
        // Deduct retrieval cost
        userStorageBalance[msg.sender] -= retrievalCost;
        request.status = StorageStatus.Retrieved;
        
        emit DataRetrieved(requestId, msg.sender);
    }
    
    /**
     * @dev Upload AI training dataset
     */
    function uploadAIDataset(
        string memory cidHash,
        string memory metadataCid,
        uint256 dataSize,
        uint256 accessPrice
    ) external returns (bytes32) {
        require(dataSize > 0, "Data size must be > 0");
        
        bytes32 datasetId = keccak256(abi.encodePacked(msg.sender, cidHash, block.timestamp));
        
        AIDataset storage dataset = aiDatasets[datasetId];
        dataset.id = datasetId;
        dataset.cidHash = cidHash;
        dataset.metadataCid = metadataCid;
        dataset.contributor = msg.sender;
        dataset.size = dataSize;
        dataset.accessPrice = accessPrice;
        dataset.verified = false;
        dataset.downloads = 0;
        
        userDatasets[msg.sender].push(datasetId);
        
        emit AIDatasetUploaded(datasetId, msg.sender, cidHash);
        return datasetId;
    }
    
    /**
     * @dev Purchase access to AI dataset
     */
    function purchaseDatasetAccess(bytes32 datasetId) external {
        AIDataset storage dataset = aiDatasets[datasetId];
        require(dataset.verified, "Dataset not verified");
        require(!dataset.hasAccess[msg.sender], "Already has access");
        require(dataset.accessPrice > 0, "Dataset is free");
        
        require(usdfc.transferFrom(msg.sender, address(this), dataset.accessPrice), "Payment failed");
        
        // Give access to dataset
        dataset.hasAccess[msg.sender] = true;
        dataset.downloads++;
        
        // Reward the contributor (80% to contributor, 20% to protocol)
        uint256 contributorReward = (dataset.accessPrice * 80) / 100;
        uint256 protocolFee = dataset.accessPrice - contributorReward;
        
        require(usdfc.transfer(dataset.contributor, contributorReward), "Contributor reward failed");
        dataset.rewardPool += contributorReward;
        
        emit AIDatasetAccessed(datasetId, msg.sender, dataset.accessPrice);
    }
    
    /**
     * @dev Verify AI dataset (only owner)
     */
    function verifyDataset(bytes32 datasetId, bool verified) external onlyOwner {
        aiDatasets[datasetId].verified = verified;
    }
    
    /**
     * @dev Get storage request details
     */
    function getStorageRequest(bytes32 requestId) external view returns (StorageRequest memory) {
        return storageRequests[requestId];
    }
    
    /**
     * @dev Get AI dataset details (excluding mapping)
     */
    function getAIDataset(bytes32 datasetId) external view returns (
        bytes32 id,
        string memory cidHash,
        string memory metadataCid,
        address contributor,
        uint256 size,
        uint256 rewardPool,
        uint256 accessPrice,
        bool verified,
        uint256 downloads
    ) {
        AIDataset storage dataset = aiDatasets[datasetId];
        return (
            dataset.id,
            dataset.cidHash,
            dataset.metadataCid,
            dataset.contributor,
            dataset.size,
            dataset.rewardPool,
            dataset.accessPrice,
            dataset.verified,
            dataset.downloads
        );
    }
    
    /**
     * @dev Check dataset access
     */
    function hasDatasetAccess(bytes32 datasetId, address user) external view returns (bool) {
        return aiDatasets[datasetId].hasAccess[user] || aiDatasets[datasetId].contributor == user;
    }
    
    /**
     * @dev Get user's storage requests
     */
    function getUserStorageRequests(address user) external view returns (bytes32[] memory) {
        return userStorageRequests[user];
    }
    
    /**
     * @dev Get user's datasets
     */
    function getUserDatasets(address user) external view returns (bytes32[] memory) {
        return userDatasets[user];
    }
    
    /**
     * @dev Get storage statistics
     */
    function getStorageStats() external view returns (
        uint256 totalChallengeData,
        uint256 totalAITrainingData,
        uint256 totalPlayerProofs,
        uint256 totalGameAssets
    ) {
        return (
            dataTypeCount[DataType.ChallengeData],
            dataTypeCount[DataType.AITrainingData],
            dataTypeCount[DataType.PlayerProofs],
            dataTypeCount[DataType.GameAssets]
        );
    }
    
    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdfc.balanceOf(address(this));
        require(usdfc.transfer(owner(), balance), "Withdrawal failed");
    }
    
    /**
     * @dev Withdraw user storage balance
     */
    function withdrawStorageBalance(uint256 amount) external {
        require(amount <= userStorageBalance[msg.sender], "Insufficient balance");
        userStorageBalance[msg.sender] -= amount;
        require(usdfc.transfer(msg.sender, amount), "Transfer failed");
        emit StorageBalanceUpdated(msg.sender, userStorageBalance[msg.sender]);
    }
}