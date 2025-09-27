// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


// Hedera Token Service System Contract Interface
interface IHederaTokenService {
    function createFungibleToken(
        address token,
        uint256 initialTotalSupply,
        uint32 decimals,
        string memory name,
        string memory symbol
    ) external returns (int256 responseCode);
    
    function createNonFungibleToken(
        address token,
        string memory name,
        string memory symbol
    ) external returns (int256 responseCode);
    
    function mintToken(
        address token,
        uint64 amount,
        bytes[] memory metadata
    ) external returns (int256 responseCode, uint64 newTotalSupply, int64[] memory serialNumbers);
    
    function burnToken(
        address token,
        uint64 amount,
        int64[] memory serialNumbers
    ) external returns (int256 responseCode, uint64 newTotalSupply);
    
    function associateToken(address account, address token) external returns (int256 responseCode);
    
    function dissociateToken(address account, address token) external returns (int256 responseCode);
    
    function transferToken(
        address token,
        address from,
        address to,
        uint64 amount
    ) external returns (int256 responseCode);
    
    function transferNFT(
        address token,
        address from,
        address to,
        int64 serialNumber
    ) external returns (int256 responseCode);
}

/**
 * @title StarQuest HTS Integration Contract
 * @dev Hybrid EVM and Native Hedera Token Service integration
 * Creates and manages game tokens using HTS system contracts
 */
contract StarQuestHTS is Ownable, ReentrancyGuard {
    
    // Hedera Token Service system contract
    IHederaTokenService constant HTS = IHederaTokenService(0x0000000000000000000000000000000000000167);
    
    // Token addresses (will be set after creation)
    address public starQuestToken; // Main game token (fungible)
    address public starQuestNFT;   // Achievement NFTs (non-fungible)
    address public rewardToken;    // Reward distribution token
    
    // State variables
    address public starQuestCore;
    bool public tokensCreated = false;
    
    // Optimized structs
    struct TokenInfo {
        uint32 decimals;
        bool created;
    }
    
    struct NFTData {
        address owner;
        bytes metadata;
    }
    
    // Mappings
    mapping(address => TokenInfo) public tokenInfo;
    mapping(address => mapping(address => bool)) public tokenAssociations;
    mapping(address => mapping(int64 => NFTData)) public nftData;
    mapping(address => uint256) public userBalances;
    mapping(address => int64[]) public userNFTs;
    
    // Events
    event TokenCreated(address indexed token, string name, string symbol, bool isFungible);
    event TokenMinted(address indexed token, address indexed to, uint64 amount, int64[] serialNumbers);
    event TokenBurned(address indexed token, uint64 amount, int64[] serialNumbers);
    event TokenAssociated(address indexed user, address indexed token);
    event TokenTransferred(address indexed token, address indexed from, address indexed to, uint64 amount);
    event NFTTransferred(address indexed token, address indexed from, address indexed to, int64 serialNumber);
    
    // Modifiers
    modifier onlyStarQuestCore() {
        require(msg.sender == starQuestCore, "Core only");
        _;
    }
    
    modifier tokenExists(address token) {
        require(tokenInfo[token].created, "Token !exist");
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
     * @dev Create the main game tokens using HTS
     */
    function createGameTokens() external onlyOwner {
        require(!tokensCreated, "Already created");
        
        // Create main game token
        starQuestToken = address(uint160(uint256(keccak256(abi.encodePacked(address(this), "SQ_TOKEN")))));
        int256 response1 = HTS.createFungibleToken(starQuestToken, 1000000 * 10**18, 18, "StarQuest Token", "SQ");
        require(response1 == 22, "Token creation failed");
        tokenInfo[starQuestToken] = TokenInfo({decimals: 18, created: true});
        
        // Create NFT token
        starQuestNFT = address(uint160(uint256(keccak256(abi.encodePacked(address(this), "SQ_NFT")))));
        int256 response2 = HTS.createNonFungibleToken(starQuestNFT, "StarQuest NFT", "SQNFT");
        require(response2 == 22, "NFT creation failed");
        tokenInfo[starQuestNFT] = TokenInfo({decimals: 0, created: true});
        
        // Create reward token
        rewardToken = address(uint160(uint256(keccak256(abi.encodePacked(address(this), "SQ_REWARD")))));
        int256 response3 = HTS.createFungibleToken(rewardToken, 10000000 * 10**18, 18, "StarQuest Rewards", "SQR");
        require(response3 == 22, "Reward creation failed");
        tokenInfo[rewardToken] = TokenInfo({decimals: 18, created: true});
        
        tokensCreated = true;
        
        emit TokenCreated(starQuestToken, "StarQuest Token", "SQ", true);
        emit TokenCreated(starQuestNFT, "StarQuest NFT", "SQNFT", false);
        emit TokenCreated(rewardToken, "StarQuest Rewards", "SQR", true);
    }
    
    /**
     * @dev Associate user with token
     */
    function associateUserWithToken(address user, address token) external returns (bool) {
        require(tokenInfo[token].created, "Token !exist");
        require(!tokenAssociations[user][token], "Already associated");
        
        int256 response = HTS.associateToken(user, token);
        if (response == 22) {
            tokenAssociations[user][token] = true;
            emit TokenAssociated(user, token);
            return true;
        }
        return false;
    }
    
    /**
     * @dev Mint fungible tokens
     */
    function mintFungibleTokens(address token, address to, uint64 amount) external tokenExists(token) returns (bool) {
        require(msg.sender == starQuestCore || msg.sender == owner(), "!authorized");
        require(tokenAssociations[to][token], "!associated");
        require(token == starQuestToken || token == rewardToken, "!fungible");
        
        bytes[] memory metadata = new bytes[](0);
        (int256 response, uint64 newSupply, int64[] memory serialNumbers) = HTS.mintToken(token, amount, metadata);
        
        if (response == 22) {
            userBalances[to] += amount;
            emit TokenMinted(token, to, amount, serialNumbers);
            return true;
        }
        return false;
    }
    
    /**
     * @dev Mint NFT with metadata
     */
    function mintNFT(address to, bytes memory metadata) external onlyStarQuestCore returns (int64) {
        require(tokenAssociations[to][starQuestNFT], "!associated");
        
        bytes[] memory metadataArray = new bytes[](1);
        metadataArray[0] = metadata;
        
        (int256 response, uint64 newSupply, int64[] memory serialNumbers) = HTS.mintToken(starQuestNFT, 1, metadataArray);
        
        if (response == 22 && serialNumbers.length > 0) {
            int64 serialNumber = serialNumbers[0];
            nftData[starQuestNFT][serialNumber] = NFTData({metadata: metadata, owner: to});
            userNFTs[to].push(serialNumber);
            emit TokenMinted(starQuestNFT, to, 1, serialNumbers);
            return serialNumber;
        }
        
        revert("Mint failed");
    }
    
    /**
     * @dev Transfer fungible tokens
     */
    function transferFungibleToken(address token, address from, address to, uint64 amount) external returns (bool) {
        require(msg.sender == from || msg.sender == starQuestCore || msg.sender == owner(), "!authorized");
        require(tokenAssociations[to][token], "!associated");
        require(userBalances[from] >= amount, "!balance");
        
        int256 response = HTS.transferToken(token, from, to, amount);
        
        if (response == 22) {
            userBalances[from] -= amount;
            userBalances[to] += amount;
            emit TokenTransferred(token, from, to, amount);
            return true;
        }
        return false;
    }
    
    /**
     * @dev Transfer NFT
     */
    function transferNFT(address from, address to, int64 serialNumber) external returns (bool) {
        require(msg.sender == from || msg.sender == starQuestCore || msg.sender == owner(), "!authorized");
        require(tokenAssociations[to][starQuestNFT], "!associated");
        require(nftData[starQuestNFT][serialNumber].owner == from, "!owner");
        
        int256 response = HTS.transferNFT(starQuestNFT, from, to, serialNumber);
        
        if (response == 22) {
            nftData[starQuestNFT][serialNumber].owner = to;
            
            // Update NFT arrays
            int64[] storage fromNFTs = userNFTs[from];
            for (uint256 i = 0; i < fromNFTs.length; i++) {
                if (fromNFTs[i] == serialNumber) {
                    fromNFTs[i] = fromNFTs[fromNFTs.length - 1];
                    fromNFTs.pop();
                    break;
                }
            }
            userNFTs[to].push(serialNumber);
            
            emit NFTTransferred(starQuestNFT, from, to, serialNumber);
            return true;
        }
        return false;
    }
    
    /**
     * @dev Burn fungible tokens
     */
    function burnFungibleTokens(address token, uint64 amount) external {
        require(userBalances[msg.sender] >= amount, "!balance");
        require(token == starQuestToken || token == rewardToken, "!fungible");
        
        int64[] memory serialNumbers = new int64[](0);
        (int256 response, uint64 newSupply) = HTS.burnToken(token, amount, serialNumbers);
        
        if (response == 22) {
            userBalances[msg.sender] -= amount;
            emit TokenBurned(token, amount, serialNumbers);
        }
    }
    
    // View functions
    function getUserTokenBalance(address user, address token) external view returns (uint256) {
        if (token == starQuestToken || token == rewardToken) {
            return userBalances[user];
        }
        return 0;
    }
    
    function getUserNFTs(address user) external view returns (int64[] memory) {
        return userNFTs[user];
    }
    
    function getNFTData(int64 serialNumber) external view returns (NFTData memory) {
        return nftData[starQuestNFT][serialNumber];
    }
    
    function isUserAssociatedWithToken(address user, address token) external view returns (bool) {
        return tokenAssociations[user][token];
    }
    
    function getTokenInfo(address token) external view returns (TokenInfo memory) {
        return tokenInfo[token];
    }
    
    /**
     * @dev Batch associate user with multiple tokens
     */
    function batchAssociateTokens(address user, address[] memory tokens) external returns (bool[] memory) {
        bool[] memory results = new bool[](tokens.length);
        
        for (uint256 i = 0; i < tokens.length; i++) {
            if (!tokenAssociations[user][tokens[i]] && tokenInfo[tokens[i]].created) {
                int256 response = HTS.associateToken(user, tokens[i]);
                if (response == 22) {
                    tokenAssociations[user][tokens[i]] = true;
                    emit TokenAssociated(user, tokens[i]);
                    results[i] = true;
                }
            }
        }
        return results;
    }
    
    /**
     * @dev Emergency token recovery (owner only)
     */
    function emergencyTokenRecovery(address token, address to, uint64 amount) external onlyOwner {
        require(tokenInfo[token].created, "!exist");
        int256 response = HTS.transferToken(token, address(this), to, amount);
        require(response == 22, "Recovery failed");
    }
    
    /**
     * @dev Get all created token addresses
     */
    function getAllTokens() external view returns (address[] memory) {
        address[] memory tokens = new address[](3);
        tokens[0] = starQuestToken;
        tokens[1] = starQuestNFT;
        tokens[2] = rewardToken;
        return tokens;
    }
}