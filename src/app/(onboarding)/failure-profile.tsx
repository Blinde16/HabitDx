import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import FailureProfileService from '../../lib/failureProfileService';
import type { HabitFailureProfile, PersonalityInsights } from '../../types/failure-profile';
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
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get existing profile first
      const existingProfile = await FailureProfileService.getActiveProfile(user.id);

      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        // No profile exists, generate one
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
      'This will create a new analysis based on your current data. Your old profile will be archived.',
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
              Alert.alert('Success', 'Your profile has been regenerated!');
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
        message: `Check out my Habit Failure Profile! ${shareUrl}`,
        url: shareUrl, // iOS only
        title: 'My Habit Failure Profile',
      });

      logInfo('User shared profile', { userId: user?.id, shareToken: profile.share_token });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleContinue = () => {
    // Navigate to habit stack screen
    router.push('/(onboarding)/habits');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="mt-4 text-gray-600">Loading your profile...</Text>
      </View>
    );
  }

  if (generating) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="mt-4 text-xl font-semibold text-gray-900">
          Analyzing Your Patterns...
        </Text>
        <Text className="mt-2 text-gray-600 text-center">
          Our AI is reviewing your data and identifying insights. This usually takes 3-5 seconds.
        </Text>
        <Text className="mt-4 text-sm text-gray-500 text-center">
          💡 Tip: The insights you're about to see are personalized to YOU—not generic advice.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-6xl mb-4">⚠️</Text>
        <Text className="text-xl font-semibold text-gray-900 mb-2">Oops!</Text>
        <Text className="text-gray-600 text-center mb-6">{error}</Text>
        <TouchableOpacity
          className="bg-purple-600 px-6 py-3 rounded-lg"
          onPress={loadProfile}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">
          No Profile Found
        </Text>
        <TouchableOpacity
          className="bg-purple-600 px-6 py-3 rounded-lg"
          onPress={generateProfile}
        >
          <Text className="text-white font-semibold">Generate Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const personalityInsights = FailureProfileService.parsePersonalityInsights(
    profile.personality_insights
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 py-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Your Habit Failure Profile
          </Text>
          <Text className="text-gray-600">
            Based on your personal history and constraints
          </Text>
        </View>

        {/* Failure Patterns */}
        <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Patterns We Noticed
          </Text>
          {profile.failure_patterns.map((pattern, index) => (
            <View key={index} className="flex-row mb-3">
              <Text className="text-purple-600 mr-2">•</Text>
              <Text className="flex-1 text-gray-800">{pattern}</Text>
            </View>
          ))}
        </View>

        {/* Root Causes */}
        <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-4">Root Causes</Text>
          {profile.root_causes.map((cause, index) => (
            <View key={index} className="flex-row mb-3">
              <Text className="text-gray-500 mr-3 font-semibold">{index + 1}.</Text>
              <Text className="flex-1 text-gray-800">{cause}</Text>
            </View>
          ))}
        </View>

        {/* Personality Insights */}
        <View className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-4 border-2 border-purple-200">
          <Text className="text-xl font-bold text-purple-900 mb-4">
            Your Superpower
          </Text>
          <Text className="text-lg font-semibold text-purple-700 mb-2">
            {personalityInsights.archetype}
          </Text>
          <Text className="text-gray-800 mb-3">
            <Text className="font-semibold">Strength:</Text> {personalityInsights.strength}
          </Text>
          <Text className="text-gray-800">
            <Text className="font-semibold">Challenge:</Text> {personalityInsights.weakness}
          </Text>
        </View>

        {/* Recommendations */}
        <View className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            What You Need
          </Text>
          {profile.recommendations.map((rec, index) => (
            <View key={index} className="flex-row mb-3">
              <Text className="text-green-600 mr-3 font-semibold">{index + 1}.</Text>
              <Text className="flex-1 text-gray-800">{rec}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="space-y-3">
          <TouchableOpacity
            className="bg-purple-600 py-4 rounded-lg items-center"
            onPress={handleContinue}
          >
            <Text className="text-white font-bold text-lg">
              Continue to Your Habits
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-blue-500 py-4 rounded-lg items-center"
            onPress={handleShare}
          >
            <Text className="text-white font-semibold">Share Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-gray-300 py-3 rounded-lg items-center"
            onPress={handleRegenerate}
          >
            <Text className="text-gray-700 font-semibold">Regenerate Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View className="mt-6 p-4 bg-gray-100 rounded-lg">
          <Text className="text-xs text-gray-600 text-center">
            Profile generated: {new Date(profile.created_at).toLocaleDateString()}
          </Text>
          {profile.view_count > 0 && (
            <Text className="text-xs text-gray-600 text-center mt-1">
              Shared {profile.view_count} times
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
