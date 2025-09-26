import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../utils/colors';
import { typography } from '../../utils/typography';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Tab[];
  style?: ViewStyle;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  tabs,
  style,
}) => {
  return (
    <View style={[styles.bottomNav, style]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab,
          ]}
          onPress={() => onTabChange(tab.id)}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            <Text style={[
              styles.tabIcon,
              activeTab === tab.id && styles.activeTabIcon,
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel,
            ]}>
              {tab.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 3,
    borderTopColor: colors.foreground,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: colors.foreground,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  tabContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: colors.mutedForeground,
  },
  activeTabIcon: {
    color: colors.primaryForeground,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  activeTabLabel: {
    color: colors.primaryForeground,
  },
});