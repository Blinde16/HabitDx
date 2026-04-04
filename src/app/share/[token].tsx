import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FailureProfileService from '../../lib/failureProfileService';
import type { HabitFailureProfile } from '../../types/failure-profile';
import { logInfo, logError } from '../../lib/logger';
import { HabitDxLogo } from '../../components/brand';

export default function SharedProfileScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<HabitFailureProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSharedProfile(token);
    }
  }, [token]);

  const loadSharedProfile = async (shareToken: string) => {
    try {
      setLoading(true);
      setError(null);

      logInfo('Loading shared profile', { shareToken, event: 'sharedProfile.view' });

      const sharedProfile = await FailureProfileService.getProfileByShareToken(shareToken);

      if (!sharedProfile) {
        setError('Profile not found or has been deleted');
        return;
      }

      setProfile(sharedProfile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      logError(err as Error, { context: 'sharedProfile.load', shareToken });
    } finally {
      setLoading(false);
    }
  };

  const handleGetApp = () => {
    router.push('/(auth)/signup');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-7">
        <HabitDxLogo variant="mark" width={160} style={{ alignSelf: 'center', marginBottom: 20 }} />
        <ActivityIndicator size="large" color="#191c1e" />
        <Text className="mt-4 font-public text-on_surface_variant">Loading profile…</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-7">
        <HabitDxLogo variant="full" width={160} style={{ alignSelf: 'center', marginBottom: 24 }} />
        <Text className="text-xl font-manrope text-on_surface mb-2 text-center">
          {error || 'Profile Not Found'}
        </Text>
        <Text className="font-public text-on_surface_variant text-center mb-8 leading-6">
          This link may be expired or the profile was removed.
        </Text>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={handleGetApp}
          className="rounded-full overflow-hidden w-full max-w-sm"
        >
          <LinearGradient
            colors={['#000000', '#131b2e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            <Text className="text-white font-public-sb text-lg">Open HabitDx</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const personalityInsights = FailureProfileService.parsePersonalityInsights(
    profile.personality_insights
  );

  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="px-7 py-10">
        <View className="mb-8">
          <HabitDxLogo width={200} style={{ marginBottom: 16 }} />
          <Text className="font-manrope text-display-lg text-on_surface mb-2">
            Shared Habit Profile
          </Text>
          <Text className="font-public text-on_surface_variant leading-6">
            A diagnostic readout someone chose to share with you
          </Text>
        </View>

        <View className="bg-surface_container_lowest rounded-xl p-6 mb-5">
          <Text className="font-manrope-md text-lg text-on_surface mb-4">Patterns Identified</Text>
          {profile.failure_patterns.map((pattern, index) => (
            <View key={index} className="flex-row mb-4">
              <Text className="text-tertiary_fixed_dim mr-2">·</Text>
              <Text className="flex-1 font-public text-on_surface leading-6">{pattern}</Text>
            </View>
          ))}
        </View>

        <View className="bg-surface_container_lowest rounded-xl p-6 mb-5">
          <Text className="font-manrope-md text-lg text-on_surface mb-4">Root Causes</Text>
          {profile.root_causes.map((cause, index) => (
            <View key={index} className="flex-row mb-4">
              <Text className="text-on_surface_variant mr-3 font-public-sb w-6">{index + 1}.</Text>
              <Text className="flex-1 font-public text-on_surface leading-6">{cause}</Text>
            </View>
          ))}
        </View>

        <View className="bg-growth_muted rounded-xl p-6 mb-5">
          <Text className="font-manrope-md text-lg text-on_surface mb-3">Working Style</Text>
          <Text className="text-lg font-public-sb text-on_surface mb-2">
            {personalityInsights.archetype}
          </Text>
          <Text className="font-public text-on_surface leading-6 mb-2">
            <Text className="font-public-sb">Strength: </Text>
            {personalityInsights.strength}
          </Text>
          <Text className="font-public text-on_surface leading-6">
            <Text className="font-public-sb">Tension: </Text>
            {personalityInsights.weakness}
          </Text>
        </View>

        <View className="bg-surface_container_lowest rounded-xl p-6 mb-8">
          <Text className="font-manrope-md text-lg text-on_surface mb-4">Recommendations</Text>
          {profile.recommendations.map((rec, index) => (
            <View key={index} className="flex-row mb-4">
              <Text className="text-tertiary_fixed_dim mr-3 font-public-sb w-6">{index + 1}.</Text>
              <Text className="flex-1 font-public text-on_surface leading-6">{rec}</Text>
            </View>
          ))}
        </View>

        <View className="bg-surface_container_low rounded-xl p-6 mb-8">
          <Text className="font-manrope-md text-lg text-on_surface mb-2">Your Own Readout</Text>
          <Text className="font-public text-on_surface_variant mb-5 leading-6">
            HabitDx synthesizes why habits stall for you personally—then supports weekly
            adjustments.
          </Text>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={handleGetApp}
            className="rounded-full overflow-hidden"
          >
            <LinearGradient
              colors={['#000000', '#131b2e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}
            >
              <Text className="text-white font-public-sb text-lg">Get HabitDx</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View className="items-center pb-8">
          <Text className="text-xs font-public text-on_surface_variant">
            Views: {profile.view_count}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cta: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 9999,
  },
});
