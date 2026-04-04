import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FailureProfileService from '../../lib/failureProfileService';
import type { HabitFailureProfile } from '../../types/failure-profile';
import { logInfo, logError } from '../../lib/logger';

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
    // Navigate to auth/signup or show download options
    router.push('/(auth)/signup');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-6xl mb-4">🔍</Text>
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          {error || 'Profile Not Found'}
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          This profile may have been deleted or the link is invalid.
        </Text>
        <TouchableOpacity
          className="bg-purple-600 px-6 py-3 rounded-lg"
          onPress={handleGetApp}
        >
          <Text className="text-white font-semibold">Get HabitDx</Text>
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
        {/* Header with Branding */}
        <View className="mb-6">
          <Text className="text-sm text-purple-600 font-semibold mb-2">HABITDX</Text>
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Habit Profile
          </Text>
          <Text className="text-gray-600">
            Someone shared their personalized habit analysis with you
          </Text>
        </View>

        {/* Failure Patterns */}
        <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Patterns Identified
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
            Personality Type
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
            Recommendations
          </Text>
          {profile.recommendations.map((rec, index) => (
            <View key={index} className="flex-row mb-3">
              <Text className="text-green-600 mr-3 font-semibold">{index + 1}.</Text>
              <Text className="flex-1 text-gray-800">{rec}</Text>
            </View>
          ))}
        </View>

        {/* CTA to Get App */}
        <View className="bg-purple-100 rounded-lg p-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-2">
            Get Your Own Habit Profile
          </Text>
          <Text className="text-gray-700 mb-4">
            HabitDx analyzes why YOUR habits fail and gives you personalized insights
            and weekly adjustments. No generic advice—just what works for you.
          </Text>
          <TouchableOpacity
            className="bg-purple-600 py-4 rounded-lg items-center"
            onPress={handleGetApp}
          >
            <Text className="text-white font-bold text-lg">Get HabitDx Free</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center">
          <Text className="text-xs text-gray-500">
            This profile has been viewed {profile.view_count} times
          </Text>
          <Text className="text-xs text-gray-400 mt-2">
            Powered by AI-driven behavioral analysis
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
