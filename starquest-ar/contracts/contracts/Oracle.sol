// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


/**
 * @title StarQuest Oracle Contract
 * @dev Oracle contract for external data feeds and AI verification
 * Integrates with Chainlink, Pyth, or other oracle services
 */
contract StarQuestOracle is Ownable, ReentrancyGuard {
    
    // State variables
    mapping(address => bool) public authorizedOracles;
    mapping(bytes32 => uint256) public priceFeeds; // Asset => Price (in wei)
    mapping(bytes32 => uint256) public lastUpdated;
    mapping(bytes32 => bool) public validAssets;
    
    address public starQuestCore;
    uint256 public constant PRICE_DECIMALS = 18;
    uint256 public constant MAX_PRICE_AGE = 3600; // 1 hour
    
    // Structs
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        address oracle;
    }
    
    struct LocationData {
        int256 latitude;
        int256 longitude;
        uint256 accuracy;
        uint256 timestamp;
        address verifier;
    }
    
    // Mappings
    mapping(bytes32 => PriceData) public prices;
    mapping(bytes32 => LocationData) public locationVerifications;
    mapping(address => mapping(bytes32 => bool)) public oracleAssetAccess;
    
    // Events
    event PriceUpdated(bytes32 indexed asset, uint256 price, address oracle, uint256 timestamp);
    event LocationVerified(bytes32 indexed locationHash, int256 latitude, int256 longitude, address verifier);
    event OracleAuthorized(address indexed oracle, bool authorized);
    event AssetAdded(bytes32 indexed asset, string name);
    
    // Modifiers
    modifier onlyAuthorizedOracle() {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        _;
    }
    
    modifier onlyStarQuestCore() {
        require(msg.sender == starQuestCore, "Only StarQuest core");
        _;
    }
    
    modifier validAsset(bytes32 asset) {
        require(validAssets[asset], "Invalid asset");
        _;
    }
    
    constructor() {}
    
    /**
     * @dev Set StarQuest core contract
     */
    function setStarQuestCore(address _starQuestCore) external onlyOwner {
        starQuestCore = _starQuestCore;
    }
    
    /**
     * @dev Authorize oracle address
     */
    function authorizeOracle(address oracle, bool authorized) external onlyOwner {
        authorizedOracles[oracle] = authorized;
        emit OracleAuthorized(oracle, authorized);
    }
    
    /**
     * @dev Add valid asset for price feeds
     */
    function addAsset(bytes32 asset, string memory name) external onlyOwner {
        validAssets[asset] = true;
        emit AssetAdded(asset, name);
    }
    
    /**
     * @dev Grant oracle access to specific asset
     */
    function grantOracleAssetAccess(address oracle, bytes32 asset, bool access) external onlyOwner {
        oracleAssetAccess[oracle][asset] = access;
    }
    
    /**
     * @dev Update price feed (only authorized oracles)
     */
    function updatePrice(
        bytes32 asset, 
        uint256 price
    ) external onlyAuthorizedOracle validAsset(asset) {
        require(oracleAssetAccess[msg.sender][asset], "No access to this asset");
        require(price > 0, "Price must be greater than 0");
        
        prices[asset] = PriceData({
            price: price,
            timestamp: block.timestamp,
            oracle: msg.sender
        });
        
        lastUpdated[asset] = block.timestamp;
        
        emit PriceUpdated(asset, price, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get latest price for asset
     */
    function getPrice(bytes32 asset) external view validAsset(asset) returns (uint256, uint256) {
        PriceData memory priceData = prices[asset];
        require(priceData.timestamp > 0, "Price not available");
        require(block.timestamp - priceData.timestamp <= MAX_PRICE_AGE, "Price too old");
        
        return (priceData.price, priceData.timestamp);
    }
    
    /**
     * @dev Verify location (called by authorized services)
     */
    function verifyLocation(
        bytes32 locationHash,
        int256 latitude,
        int256 longitude,
        uint256 accuracy
    ) external onlyAuthorizedOracle {
        locationVerifications[locationHash] = LocationData({
            latitude: latitude,
            longitude: longitude,
            accuracy: accuracy,
            timestamp: block.timestamp,
            verifier: msg.sender
        });
        
        emit LocationVerified(locationHash, latitude, longitude, msg.sender);
    }
    
    /**
     * @dev Get location verification data
     */
    function getLocationVerification(bytes32 locationHash) external view returns (LocationData memory) {
        return locationVerifications[locationHash];
    }
    
    /**
     * @dev Batch update multiple prices
     */
    function batchUpdatePrices(
        bytes32[] memory assets,
        uint256[] memory priceValues
    ) external onlyAuthorizedOracle {
        require(assets.length == priceValues.length, "Array length mismatch");
        
        for (uint256 i = 0; i < assets.length; i++) {
            require(validAssets[assets[i]], "Invalid asset");
            require(oracleAssetAccess[msg.sender][assets[i]], "No access to asset");
            require(priceValues[i] > 0, "Price must be greater than 0");
            
            prices[assets[i]] = PriceData({
                price: priceValues[i],
                timestamp: block.timestamp,
                oracle: msg.sender
            });
            
            lastUpdated[assets[i]] = block.timestamp;
            
            emit PriceUpdated(assets[i], priceValues[i], msg.sender, block.timestamp);
        }
    }
    
    /**
     * @dev Get multiple asset prices
     */
    function getMultiplePrices(bytes32[] memory assets) external view returns (uint256[] memory, uint256[] memory) {
        uint256[] memory priceValues = new uint256[](assets.length);
        uint256[] memory timestamps = new uint256[](assets.length);
        
        for (uint256 i = 0; i < assets.length; i++) {
            require(validAssets[assets[i]], "Invalid asset");
            PriceData memory priceData = prices[assets[i]];
            require(priceData.timestamp > 0, "Price not available");
            
            priceValues[i] = priceData.price;
            timestamps[i] = priceData.timestamp;
        }
        
        return (priceValues, timestamps);
    }
    
    /**
     * @dev Check if price is fresh
     */
    function isPriceFresh(bytes32 asset) external view returns (bool) {
        PriceData memory priceData = prices[asset];
        return priceData.timestamp > 0 && (block.timestamp - priceData.timestamp <= MAX_PRICE_AGE);
    }
    
    /**
     * @dev Emergency price update (only owner)
     */
    function emergencyPriceUpdate(bytes32 asset, uint256 price) external onlyOwner {
        require(validAssets[asset], "Invalid asset");
        require(price > 0, "Price must be greater than 0");
        
        prices[asset] = PriceData({
            price: price,
            timestamp: block.timestamp,
            oracle: msg.sender
        });
        
        lastUpdated[asset] = block.timestamp;
        
        emit PriceUpdated(asset, price, msg.sender, block.timestamp);
    }
}