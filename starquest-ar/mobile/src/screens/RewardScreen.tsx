import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

export const RewardScreen: React.FC = () => {
  const { handleTabChange } = useGame();

  const rewardData = {
    nftId: 'nft-3',
    name: 'Gamma Star NFT',
    rarity: 'epic',
    image: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Gamma+Star',
    attributes: [
      { trait: 'Power', value: '95' },
      { trait: 'Rarity', value: 'Epic' },
      { trait: 'Element', value: 'Cosmic' },
      { trait: 'Generation', value: '1' },
    ],
    description:
      'A rare cosmic star collected from the depths of space. This NFT represents your achievement in completing the Gamma Star challenge.',
    blockchain: 'Ethereum',
    contractAddress: '0x1234...5678',
    tokenId: '0003',
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return colors.electricOrange;
      case 'epic': return colors.electricPurple;
      case 'rare': return colors.info;
      case 'common': return colors.mutedForeground;
      default: return colors.foreground;
    }
  };

  const handleViewInWallet = () => {
    Alert.alert('View in Wallet', 'This would open your connected wallet to view the NFT', [{ text: 'OK' }]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just earned a ${rewardData.rarity} NFT in StarQuest AR! 🎉 #StarQuestAR #NFT`,
        title: 'StarQuest AR Achievement',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContinue = () => {
    handleTabChange('home');
  };

  return (
    <MobileLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.successText}>🎉 Congratulations!</Text>
          <Text style={styles.subtitle}>You've earned a new NFT!</Text>
        </View>

        {/* NFT Card */}
        <NeoCard style={styles.nftCard}>
          <View style={styles.nftImageContainer}>
            <View style={[styles.nftImage, { backgroundColor: getRarityColor(rewardData.rarity) }]}>
              <Text style={styles.nftImageText}>🌟</Text>
            </View>
          </View>

          <View style={styles.nftInfo}>
            <Text style={styles.nftName}>{rewardData.name}</Text>
            <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(rewardData.rarity) }]}>
              <Text style={styles.rarityText}>{rewardData.rarity.toUpperCase()}</Text>
            </View>
          </View>
        </NeoCard>

        {/* NFT Details */}
        <NeoCard style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>NFT Details</Text>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{rewardData.description}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Blockchain</Text>
            <Text style={styles.detailValue}>{rewardData.blockchain}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Contract</Text>
            <Text style={styles.detailValue}>{rewardData.contractAddress}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Token ID</Text>
            <Text style={styles.detailValue}>{rewardData.tokenId}</Text>
          </View>
        </NeoCard>

        {/* Attributes */}
        <NeoCard style={styles.attributesCard}>
          <Text style={styles.sectionTitle}>Attributes</Text>
          <View style={styles.attributesGrid}>
            {rewardData.attributes.map((attr, index) => (
              <View key={index} style={styles.attributeItem}>
                <Text style={styles.attributeTrait}>{attr.trait}</Text>
                <Text style={styles.attributeValue}>{attr.value}</Text>
              </View>
            ))}
          </View>
        </NeoCard>

        {/* Blockchain Info */}
        <NeoCard style={styles.blockchainCard}>
          <Text style={styles.sectionTitle}>Blockchain Information</Text>
          <View style={styles.blockchainInfo}>
            <View style={styles.blockchainItem}>
              <Text style={styles.blockchainLabel}>Network</Text>
              <Text style={styles.blockchainValue}>Ethereum Mainnet</Text>
            </View>
            <View style={styles.blockchainItem}>
              <Text style={styles.blockchainLabel}>Standard</Text>
              <Text style={styles.blockchainValue}>ERC-721</Text>
            </View>
            <View style={styles.blockchainItem}>
              <Text style={styles.blockchainLabel}>Status</Text>
              <Text style={[styles.blockchainValue, { color: colors.success }]}>✅ Confirmed</Text>
            </View>
          </View>
        </NeoCard>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <NeoButton
            title="View in Wallet"
            onPress={handleViewInWallet}
            variant="electric"
            size="large"
            style={styles.actionButton}
          />
          <NeoButton
            title="Share Achievement"
            onPress={handleShare}
            variant="outline"
            size="large"
            style={styles.actionButton}
          />
          <NeoButton
            title="Continue Exploring"
            onPress={handleContinue}
            variant="default"
            size="large"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  successText: { ...typography.brutalLarge, color: colors.foreground, marginBottom: 8 },
  subtitle: { ...typography.body, color: colors.mutedForeground },
  nftCard: { alignItems: 'center', marginBottom: 24, padding: 24 },
  nftImageContainer: { marginBottom: 16 },
  nftImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.foreground,
    shadowColor: colors.foreground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 6,
  },
  nftImageText: { fontSize: 80 },
  nftInfo: { alignItems: 'center' },
  nftName: { ...typography.brutalMedium, color: colors.foreground, marginBottom: 12, textAlign: 'center' },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  rarityText: { ...typography.caption, color: colors.primaryForeground, fontWeight: '700' },
  detailsCard: { marginBottom: 24 },
  sectionTitle: { ...typography.brutalSmall, color: colors.foreground, marginBottom: 16 },
  detailItem: { marginBottom: 12 },
  detailLabel: { ...typography.body, color: colors.mutedForeground, marginBottom: 4, fontWeight: '600' },
  detailValue: { ...typography.body, color: colors.foreground },
  attributesCard: { marginBottom: 24 },
  attributesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  attributeItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: colors.muted,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.foreground,
    alignItems: 'center',
  },
  attributeTrait: { ...typography.caption, color: colors.mutedForeground, marginBottom: 4 },
  attributeValue: { ...typography.body, color: colors.foreground, fontWeight: '700' },
  blockchainCard: { marginBottom: 24 },
  blockchainInfo: { gap: 12 },
  blockchainItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  blockchainLabel: { ...typography.body, color: colors.mutedForeground },
  blockchainValue: { ...typography.body, color: colors.foreground, fontWeight: '600' },
  actionContainer: { gap: 12, marginBottom: 24 },
  actionButton: { marginBottom: 8 },
});
