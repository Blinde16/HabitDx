import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import FailureProfileService from '../../lib/failureProfileService';
import type { HabitFailureProfile } from '../../types/failure-profile';
import { logInfo, logError } from '../../lib/logger';

export default function FailureProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<HabitFailureProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const existingProfile = await FailureProfileService.getActiveProfile(user.id);

      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        await generateProfile();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      logError(err as Error, { context: 'failureProfile.load', userId: user.id });
    } finally {
      setLoading(false);
    }
  };

  const generateProfile = async () => {
    if (!user) return;

    try {
      setGenerating(true);
      setError(null);

      logInfo('User initiated profile generation', { userId: user.id });

      const result = await FailureProfileService.generateProfile(user.id);

      if (result.cached) {
        logInfo('Returned cached profile', { userId: user.id });
      }

      setProfile(result.profile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate profile';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    Alert.alert(
      'Regenerate Profile?',
      'This will create a new analysis based on your current data. Your previous profile will be archived.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              setGenerating(true);
              const result = await FailureProfileService.regenerateProfile(user.id);
              setProfile(result.profile);
              Alert.alert('Profile Updated', 'Your diagnostic profile has been regenerated.');
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate';
              Alert.alert('Error', errorMessage);
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!profile?.share_token) return;

    try {
      const shareUrl = FailureProfileService.getShareUrl(profile.share_token);

      await Share.share({
        message: `HabitDx habit profile (diagnostic readout): ${shareUrl}`,
        url: shareUrl,
        title: 'Habit profile',
      });

      logInfo('User shared profile', { userId: user?.id, shareToken: profile.share_token });
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), {
        context: 'failureProfile.share',
      });
    }
  };

  const handleContinue = () => {
    router.push('/(onboarding)/habits');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#191c1e" />
        <Text className="mt-4 font-public text-on_surface_variant">Loading profile…</Text>
      </View>
    );
  }

  if (generating) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-7">
        <ActivityIndicator size="large" color="#191c1e" />
        <Text className="mt-4 text-xl font-manrope text-on_surface text-center">
          Synthesizing Patterns
        </Text>
        <Text className="mt-2 font-public text-on_surface_variant text-center leading-6">
          Reviewing your inputs—this usually takes a few seconds.
        </Text>
        <Text className="mt-6 text-sm font-public text-on_surface_variant text-center leading-5">
          What follows is tailored to your history and constraints—not generic advice.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-7">
        <Text className="text-xl font-manrope text-on_surface mb-2 text-center">
          Something Went Wrong
        </Text>
        <Text className="font-public text-on_surface_variant text-center mb-8 leading-6">
          {error}
        </Text>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={loadProfile}
          className="rounded-full overflow-hidden"
        >
          <LinearGradient
            colors={['#000000', '#131b2e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradBtn}
          >
            <Text className="text-white font-public-sb">Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-7">
        <Text className="text-xl font-manrope text-on_surface mb-6 text-center">
          No Profile Yet
        </Text>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={generateProfile}
          className="rounded-full overflow-hidden"
        >
          <LinearGradient
            colors={['#000000', '#131b2e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradBtn}
          >
            <Text className="text-white font-public-sb">Generate Profile</Text>
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
        <View className="mb-8 self-start">
          <Text className="font-manrope text-display-lg text-on_surface mb-2">Habit Profile</Text>
          <Text className="font-public text-on_surface_variant leading-6">
            Based on your history and stated constraints
          </Text>
        </View>

        <View className="bg-surface_container_lowest rounded-xl p-6 mb-5">
          <Text className="font-manrope-md text-lg text-on_surface mb-4">Patterns We Noticed</Text>
          {profile.failure_patterns.map((pattern, index) => (
            <View key={index} className="flex-row mb-4">
              <Text className="text-tertiary_fixed_dim mr-3 font-public-sb">·</Text>
              <Text className="flex-1 font-public text-on_surface leading-6">{pattern}</Text>
            </View>
          ))}
        </View>

        <View className="bg-surface_container_lowest rounded-xl p-6 mb-5">
          <Text className="font-manrope-md text-lg text-on_surface mb-4">Underlying Drivers</Text>
          {profile.root_causes.map((cause, index) => (
            <View key={index} className="flex-row mb-4">
              <Text className="text-on_surface_variant mr-3 font-public-sb w-6">{index + 1}.</Text>
              <Text className="flex-1 font-public text-on_surface leading-6">{cause}</Text>
            </View>
          ))}
        </View>

        <View className="bg-growth_muted rounded-xl p-6 mb-5">
          <Text className="font-manrope-md text-lg text-on_surface mb-3">Working Style</Text>
          <Text className="text-lg font-public-sb text-on_surface mb-3">
            {personalityInsights.archetype}
          </Text>
          <Text className="font-public text-on_surface leading-6 mb-3">
            <Text className="font-public-sb">Strength: </Text>
            {personalityInsights.strength}
          </Text>
          <Text className="font-public text-on_surface leading-6">
            <Text className="font-public-sb">Tension: </Text>
            {personalityInsights.weakness}
          </Text>
        </View>

        <View className="bg-surface_container_lowest rounded-xl p-6 mb-8">
          <Text className="font-manrope-md text-lg text-on_surface mb-4">What Would Help</Text>
          {profile.recommendations.map((rec, index) => (
            <View key={index} className="flex-row mb-4">
              <Text className="text-tertiary_fixed_dim mr-3 font-public-sb w-6">{index + 1}.</Text>
              <Text className="flex-1 font-public text-on_surface leading-6">{rec}</Text>
            </View>
          ))}
        </View>

        <View className="mb-4">
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={handleContinue}
            className="rounded-full overflow-hidden mb-3"
          >
            <LinearGradient
              colors={['#000000', '#131b2e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradBtnWide}
            >
              <Text className="text-white font-public-sb text-lg">Continue To Habits</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.92}
            onPress={handleShare}
            className="rounded-full overflow-hidden mb-3"
          >
            <LinearGradient
              colors={['#e0e3e5', '#d1d5d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradBtnWide}
            >
              <Text className="text-on_surface font-public-sb">Share Readout</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity className="py-4 items-center" onPress={handleRegenerate}>
            <Text className="text-on_surface_variant font-public-sb">Regenerate Profile</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4 bg-surface_container_low rounded-xl p-4">
          <Text className="text-xs font-public text-on_surface_variant text-center">
            Generated {new Date(profile.created_at).toLocaleDateString()}
          </Text>
          {profile.view_count > 0 && (
            <Text className="text-xs font-public text-on_surface_variant text-center mt-2">
              Opened {profile.view_count} times
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gradBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  gradBtnWide: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
