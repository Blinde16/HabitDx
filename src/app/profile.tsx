import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { getProfile, updateProfile } from '../lib/db';
import type { UserProfile, UserProfileUpdate } from '../types/database';
import { AuthButton } from '../components/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await getProfile(user.id);

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setTimezone(data.timezone);
        setNotificationEnabled(data.notification_enabled);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      const updates: UserProfileUpdate = {
        full_name: fullName || null,
        timezone,
        notification_enabled: notificationEnabled,
      };

      const { data, error: updateError } = await updateProfile(user.id, updates);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      if (data) {
        setProfile(data);
        setEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.full_name || '');
      setTimezone(profile.timezone);
      setNotificationEnabled(profile.notification_enabled);
    }
    setEditing(false);
    setError(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.valueSmall}>{user?.id}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Member Since</Text>
          <Text style={styles.value}>
            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
            />
          ) : (
            <Text style={styles.value}>{profile?.full_name || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Timezone</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={timezone}
              onChangeText={setTimezone}
              placeholder="America/New_York"
            />
          ) : (
            <Text style={styles.value}>{profile?.timezone}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notifications</Text>
          {editing ? (
            <TouchableOpacity
              style={styles.toggle}
              onPress={() => setNotificationEnabled(!notificationEnabled)}
            >
              <View style={[styles.toggleTrack, notificationEnabled && styles.toggleTrackActive]}>
                <View
                  style={[styles.toggleThumb, notificationEnabled && styles.toggleThumbActive]}
                />
              </View>
              <Text style={styles.toggleLabel}>{notificationEnabled ? 'Enabled' : 'Disabled'}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>
              {profile?.notification_enabled ? 'Enabled' : 'Disabled'}
            </Text>
          )}
        </View>

        {editing && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Onboarding Status</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Completed</Text>
          <Text style={styles.value}>{profile?.onboarding_completed ? 'Yes ✓' : 'No'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <AuthButton title="Sign Out" onPress={handleSignOut} variant="outline" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  backButton: {
    marginTop: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
    marginBottom: 16,
  },
  editButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111',
  },
  valueSmall: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTrack: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#d1d5db',
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#3b82f6',
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  toggleLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#111',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
