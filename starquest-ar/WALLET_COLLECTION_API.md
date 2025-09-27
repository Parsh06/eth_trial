# Wallet Collection API Documentation

## Overview

This document outlines the backend API endpoints available for the **Wallet Collection Screen** in the StarQuest AR application. These endpoints provide comprehensive functionality for displaying, managing, and interacting with a user's NFT collection.

## Base URL

```
http://localhost:5000/api/wallet
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get User's NFT Collection

**GET** `/collection`

Retrieves the user's complete NFT collection with filtering, sorting, and pagination options.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Number of NFTs to return |
| `offset` | number | 0 | Number of NFTs to skip |
| `sortBy` | string | 'discoveredAt' | Sort field ('discoveredAt', 'rarity', 'name') |
| `sortOrder` | string | 'desc' | Sort order ('asc', 'desc') |
| `rarity` | string | - | Filter by rarity ('common', 'uncommon', 'rare', 'epic', 'legendary') |
| `starType` | string | - | Filter by star type ('cosmic', 'elemental', 'mystical', 'digital', 'crystal') |
| `status` | string | - | Filter by status ('minted', 'transferred', 'burned', 'locked') |

#### Example Request

```javascript
const response = await fetch('/api/wallet/collection?limit=10&rarity=legendary', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "nfts": [
      {
        "id": "64f...",
        "tokenId": "1002",
        "contractAddress": "0x1234...",
        "name": "Fire Elemental NFT",
        "description": "A rare elemental star burning with eternal flames",
        "imageUrl": "https://starquest-assets.s3.amazonaws.com/nfts/fire-elemental.png",
        "animationUrl": "https://starquest-assets.s3.amazonaws.com/animations/fire-elemental.mp4",
        "rarity": "legendary",
        "starType": "elemental",
        "attributes": [
          {
            "trait_type": "Rarity",
            "value": "Legendary"
          },
          {
            "trait_type": "Power Level",
            "value": 98,
            "display_type": "number",
            "max_value": 100
          }
        ],
        "owner": "0x742d35cc...",
        "discoveredAt": "2024-09-25T10:30:00.000Z",
        "stats": {
          "views": 32,
          "likes": 24,
          "transfers": 1
        },
        "starId": {
          "name": "Fire Elemental",
          "location": {
            "name": "Times Square Center"
          },
          "rewards": {
            "experience": 250,
            "tokens": 125
          }
        },
        "questId": {
          "title": "Elemental Hunt",
          "difficulty": "hard",
          "category": "challenge"
        }
      }
    ],
    "total": 15,
    "hasMore": true,
    "statistics": {
      "totalNFTs": 15,
      "rarityBreakdown": {
        "common": 5,
        "rare": 4,
        "epic": 3,
        "legendary": 3
      },
      "typeBreakdown": {
        "cosmic": 6,
        "elemental": 4,
        "mystical": 3,
        "crystal": 2
      },
      "totalValue": 1250
    }
  }
}
```

### 2. Get Wallet Summary

**GET** `/summary`

Provides an overview of the user's wallet with key statistics and recent activity.

#### Example Response

```json
{
  "success": true,
  "data": {
    "totalNFTs": 15,
    "totalValue": 1250,
    "rarityDistribution": {
      "common": 5,
      "rare": 4,
      "epic": 3,
      "legendary": 3
    },
    "typeDistribution": {
      "cosmic": 6,
      "elemental": 4,
      "mystical": 3,
      "crystal": 2
    },
    "recentActivity": [
      {
        "type": "nft_discovered",
        "nftId": "64f...",
        "timestamp": "2024-09-27T03:55:01.000Z",
        "details": {
          "starName": "Alpha Centauri Star"
        }
      }
    ],
    "topNFTs": [
      {
        "name": "Fire Elemental NFT",
        "rarity": "legendary",
        "imageUrl": "https://starquest-assets.s3.amazonaws.com/nfts/fire-elemental.png"
      }
    ],
    "achievements": [
      "First Star",
      "Explorer",
      "Cosmic Collector",
      "Rare Finder"
    ]
  }
}
```

### 3. Get Wallet Info

**GET** `/info`

Returns blockchain-related wallet information including balance and network details.

#### Example Response

```json
{
  "success": true,
  "data": {
    "balance": "1.234567",
    "network": {
      "chainId": "137",
      "name": "polygon"
    },
    "transactionCount": 42,
    "isConnected": true
  }
}
```

### 4. Get NFT Details

**GET** `/nft/:contractAddress/:tokenId`

Retrieves detailed information about a specific NFT, including all metadata and related information.

#### Example Response

```json
{
  "success": true,
  "data": {
    "id": "64f...",
    "tokenId": "1001",
    "contractAddress": "0x1234...",
    "name": "Alpha Centauri Star NFT",
    "description": "A brilliant cosmic star from the Alpha Centauri system",
    "imageUrl": "https://starquest-assets.s3.amazonaws.com/nfts/alpha-centauri.png",
    "animationUrl": "https://starquest-assets.s3.amazonaws.com/animations/alpha-centauri.mp4",
    "rarity": "epic",
    "starType": "cosmic",
    "attributes": [...],
    "metadata": {
      "background_color": "1a1b3e",
      "properties": {
        "constellation": "Alpha Centauri",
        "energy_type": "Cosmic"
      },
      "stats": {
        "power": 85,
        "rarity_score": 8.5
      }
    },
    "stats": {
      "views": 16,
      "likes": 8,
      "transfers": 0
    },
    "starId": {
      "name": "Alpha Centauri Star",
      "description": "A brilliant cosmic star...",
      "location": {
        "name": "Central Park North"
      }
    },
    "discoverer": {
      "username": "TestExplorer_NFT",
      "level": 5
    }
  }
}
```

### 5. Get NFT Metadata (OpenSea Compatible)

**GET** `/nft/:contractAddress/:tokenId/metadata`

Returns OpenSea-compatible metadata for an NFT. This endpoint does not require authentication.

#### Example Response

```json
{
  "name": "Alpha Centauri Star NFT",
  "description": "A brilliant cosmic star from the Alpha Centauri system",
  "image": "https://starquest-assets.s3.amazonaws.com/nfts/alpha-centauri.png",
  "external_url": null,
  "animation_url": "https://starquest-assets.s3.amazonaws.com/animations/alpha-centauri.mp4",
  "background_color": "1a1b3e",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Epic"
    },
    {
      "trait_type": "Power Level",
      "value": 85,
      "display_type": "number",
      "max_value": 100
    }
  ],
  "properties": {
    "rarity": "epic",
    "star_type": "cosmic",
    "discoverer": "0x742d35cc...",
    "discovered_at": "2024-09-22T10:00:00.000Z"
  }
}
```

### 6. Like an NFT

**POST** `/nft/:contractAddress/:tokenId/like`

Increments the like counter for a specific NFT.

#### Example Response

```json
{
  "success": true,
  "data": {
    "likes": 9
  }
}
```

### 7. Get Wallet Statistics

**GET** `/stats`

Returns comprehensive wallet statistics combining summary and blockchain information.

#### Example Response

```json
{
  "success": true,
  "data": {
    "totalNFTs": 15,
    "totalValue": 1250,
    "rarityDistribution": {...},
    "typeDistribution": {...},
    "recentActivity": [...],
    "topNFTs": [...],
    "achievements": [...],
    "blockchain": {
      "balance": "1.234567",
      "network": {...},
      "transactionCount": 42,
      "isConnected": true
    }
  }
}
```

### 8. Get Wallet Activity

**GET** `/activity`

Retrieves the user's recent wallet activity history.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Number of activities to return |
| `offset` | number | 0 | Number of activities to skip |

#### Example Response

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "type": "nft_discovered",
        "nftId": "64f...",
        "timestamp": "2024-09-27T03:55:01.000Z",
        "details": {
          "starName": "Alpha Centauri Star"
        }
      },
      {
        "type": "nft_claimed",
        "nftId": "64f...",
        "timestamp": "2024-09-27T01:55:01.000Z",
        "details": {
          "rewards": "100 SQT"
        }
      }
    ],
    "total": 25,
    "hasMore": true
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (missing parameters, validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (valid token but insufficient permissions)
- `404` - Not Found (NFT or resource not found)
- `500` - Internal Server Error

## Frontend Integration Example

Here's a complete example of how to integrate these APIs in your React Native wallet collection screen:

```javascript
// WalletCollectionService.js
class WalletCollectionService {
  constructor(baseUrl, authToken) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  async getCollection(options = {}) {
    const queryParams = new URLSearchParams({
      limit: options.limit || 20,
      offset: options.offset || 0,
      sortBy: options.sortBy || 'discoveredAt',
      sortOrder: options.sortOrder || 'desc',
      ...(options.rarity && { rarity: options.rarity }),
      ...(options.starType && { starType: options.starType })
    });

    const response = await fetch(`${this.baseUrl}/api/wallet/collection?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getSummary() {
    const response = await fetch(`${this.baseUrl}/api/wallet/summary`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.json();
  }

  async getNFTDetails(contractAddress, tokenId) {
    const response = await fetch(`${this.baseUrl}/api/wallet/nft/${contractAddress}/${tokenId}`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.json();
  }

  async likeNFT(contractAddress, tokenId) {
    const response = await fetch(`${this.baseUrl}/api/wallet/nft/${contractAddress}/${tokenId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.json();
  }
}

// Usage in React Native component
const WalletCollectionScreen = () => {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const walletService = new WalletCollectionService(
    'http://localhost:5000',
    userToken
  );

  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    try {
      const result = await walletService.getCollection({
        limit: 20,
        sortBy: 'discoveredAt',
        sortOrder: 'desc'
      });
      
      setCollection(result.data);
    } catch (error) {
      console.error('Failed to load collection:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render your wallet collection UI using the collection data
  return (
    <View>
      {/* Your wallet collection UI components */}
    </View>
  );
};
```

## Testing

### Setup Test Data

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Seed test data:
   ```bash
   npx ts-node backend/seeders/wallet-collection-seeder.ts
   ```

3. Run API tests:
   ```bash
   node backend/test-wallet-api.js
   ```

### Test User Credentials

For testing purposes, use this wallet address:
- **Wallet Address**: `0x742d35Cc6834C0532925a3b8A9C9b0a4c0c5e1a4`
- **Username**: `TestExplorer_NFT`
- **NFTs**: 3 sample NFTs (1 Epic, 1 Legendary, 1 Rare)

## Notes

1. **Pagination**: All list endpoints support pagination. Use `hasMore` flag to determine if more data is available.

2. **Caching**: Consider implementing client-side caching for collection data to improve performance.

3. **Real-time Updates**: The backend supports WebSocket connections for real-time updates when new NFTs are minted or transferred.

4. **Image Optimization**: NFT images are served from CDN. Consider implementing lazy loading and image optimization in your frontend.

5. **Error Handling**: Always implement proper error handling and user feedback for API failures.

6. **Authentication**: JWT tokens expire after 7 days. Implement token refresh logic in your frontend.

This API provides everything needed to build a comprehensive wallet collection screen with filtering, sorting, detailed views, and interactive features.
