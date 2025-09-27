import mongoose from 'mongoose';
import { Star } from '../models/Star';
import { Quest } from '../models/Quest';
import { config } from '../config';

// Sample location data around San Francisco (you can change this to your location)
const sampleLocations = [
  {
    name: "Golden Gate Bridge",
    coordinates: { latitude: 37.8199, longitude: -122.4783 },
    rarity: "legendary",
    type: "cosmic",
    description: "A legendary star hidden near the iconic Golden Gate Bridge. Only the most dedicated explorers can find it.",
    rewards: { experience: 1000, tokens: 500, nft: "golden-gate-star" }
  },
  {
    name: "Fisherman's Wharf",
    coordinates: { latitude: 37.8080, longitude: -122.4177 },
    rarity: "epic",
    type: "elemental",
    description: "An epic water-elemental star that glows with the energy of the ocean.",
    rewards: { experience: 750, tokens: 300 }
  },
  {
    name: "Lombard Street",
    coordinates: { latitude: 37.8021, longitude: -122.4187 },
    rarity: "rare",
    type: "mystical",
    description: "A rare mystical star that appears only to those who navigate the winding streets.",
    rewards: { experience: 500, tokens: 200 }
  },
  {
    name: "Coit Tower",
    coordinates: { latitude: 37.8024, longitude: -122.4058 },
    rarity: "rare",
    type: "digital",
    description: "A digital star that pulses with the energy of the city's tech scene.",
    rewards: { experience: 500, tokens: 200 }
  },
  {
    name: "Union Square",
    coordinates: { latitude: 37.7880, longitude: -122.4074 },
    rarity: "uncommon",
    type: "crystal",
    description: "A crystal star that reflects the energy of the bustling shopping district.",
    rewards: { experience: 300, tokens: 100 }
  },
  {
    name: "Chinatown Gate",
    coordinates: { latitude: 37.7941, longitude: -122.4078 },
    rarity: "uncommon",
    type: "mystical",
    description: "A mystical star that carries the wisdom of ancient traditions.",
    rewards: { experience: 300, tokens: 100 }
  },
  {
    name: "Alcatraz Island",
    coordinates: { latitude: 37.8270, longitude: -122.4230 },
    rarity: "epic",
    type: "cosmic",
    description: "An epic cosmic star that holds the secrets of the island's mysterious past.",
    rewards: { experience: 750, tokens: 300 }
  },
  {
    name: "Castro District",
    coordinates: { latitude: 37.7609, longitude: -122.4350 },
    rarity: "common",
    type: "elemental",
    description: "A common elemental star that celebrates the vibrant community spirit.",
    rewards: { experience: 150, tokens: 50 }
  },
  {
    name: "Mission Dolores Park",
    coordinates: { latitude: 37.7596, longitude: -122.4269 },
    rarity: "common",
    type: "crystal",
    description: "A crystal star that grows stronger with the energy of the park's visitors.",
    rewards: { experience: 150, tokens: 50 }
  },
  {
    name: "Twin Peaks",
    coordinates: { latitude: 37.7516, longitude: -122.4475 },
    rarity: "legendary",
    type: "cosmic",
    description: "A legendary cosmic star that offers the best view of the city and the most powerful rewards.",
    rewards: { experience: 1000, tokens: 500, nft: "twin-peaks-star" }
  }
];

// AR model data for different star types
const arModels = {
  cosmic: {
    arModel: "https://models.starquest.com/cosmic-star.glb",
    animation: "https://animations.starquest.com/cosmic-pulse.json",
    sound: "https://sounds.starquest.com/cosmic-hum.mp3",
    particleEffect: "cosmic-dust",
    glowColor: "#4A90E2",
    size: 1.5,
    rotation: { x: 0, y: 0, z: 0 }
  },
  elemental: {
    arModel: "https://models.starquest.com/elemental-star.glb",
    animation: "https://animations.starquest.com/elemental-flow.json",
    sound: "https://sounds.starquest.com/elemental-whisper.mp3",
    particleEffect: "elemental-sparkles",
    glowColor: "#50C878",
    size: 1.2,
    rotation: { x: 0, y: 0, z: 0 }
  },
  mystical: {
    arModel: "https://models.starquest.com/mystical-star.glb",
    animation: "https://animations.starquest.com/mystical-aura.json",
    sound: "https://sounds.starquest.com/mystical-chime.mp3",
    particleEffect: "mystical-mist",
    glowColor: "#9B59B6",
    size: 1.0,
    rotation: { x: 0, y: 0, z: 0 }
  },
  digital: {
    arModel: "https://models.starquest.com/digital-star.glb",
    animation: "https://animations.starquest.com/digital-pulse.json",
    sound: "https://sounds.starquest.com/digital-beep.mp3",
    particleEffect: "digital-pixels",
    glowColor: "#00FFFF",
    size: 0.8,
    rotation: { x: 0, y: 0, z: 0 }
  },
  crystal: {
    arModel: "https://models.starquest.com/crystal-star.glb",
    animation: "https://animations.starquest.com/crystal-shimmer.json",
    sound: "https://sounds.starquest.com/crystal-tinkle.mp3",
    particleEffect: "crystal-fragments",
    glowColor: "#FFD700",
    size: 1.3,
    rotation: { x: 0, y: 0, z: 0 }
  }
};

async function seedLocationData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing stars
    await Star.deleteMany({});
    console.log('🗑️ Cleared existing stars');

    // Create a sample quest
    const sampleQuest = await Quest.findOne({ name: "City Explorer" });
    let questId = sampleQuest?._id;
    
    if (!questId) {
      const newQuest = new Quest({
        name: "City Explorer",
        description: "Explore the city and discover hidden stars in famous locations",
        objectives: [
          "Discover 5 stars in different neighborhoods",
          "Complete AR challenges at legendary locations",
          "Collect tokens and experience points"
        ],
        rewards: { experience: 2000, tokens: 1000 },
        status: "active"
      });
      await newQuest.save();
      questId = newQuest._id;
      console.log('✅ Created sample quest');
    }

    // Create stars for each location
    const createdStars = [];
    for (const location of sampleLocations) {
      const star = new Star({
        name: location.name,
        description: location.description,
        rarity: location.rarity,
        type: location.type,
        location: {
          name: location.name,
          coordinates: location.coordinates
        },
        quest: questId,
        metadata: arModels[location.type as keyof typeof arModels],
        rewards: location.rewards,
        conditions: {
          timeOfDay: 'any',
          requiredItems: []
        },
        status: 'hidden'
      });

      await star.save();
      createdStars.push(star);
    }

    console.log(`✅ Created ${createdStars.length} stars with location data`);
    console.log('🌟 Sample locations seeded successfully!');
    
    // Print summary
    console.log('\n📍 Seeded Locations:');
    createdStars.forEach(star => {
      console.log(`  - ${star.name} (${star.rarity} ${star.type}) at ${star.location.coordinates.latitude}, ${star.location.coordinates.longitude}`);
    });

  } catch (error) {
    console.error('❌ Error seeding location data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedLocationData();
}

export { seedLocationData };

