import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { AuthButton } from '../components/auth';

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut, loading } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HabitDx</Text>
      <Text style={styles.subtitle}>Welcome to your habit tracking journey!</Text>

      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome, {user.email}!</Text>
          {user.user_metadata?.name && (
            <Text style={styles.nameText}>{user.user_metadata.name}</Text>
          )}
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.contentText}>Phase 2: Authentication System ✅</Text>
        <Text style={styles.contentSubtext}>
          You&apos;re now signed in and ready to start building habits.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
          <Text style={styles.profileButtonText}>View Profile</Text>
        </TouchableOpacity>

        <AuthButton title="Sign Out" onPress={handleSignOut} loading={loading} variant="outline" />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    marginBottom: 32,
    alignItems: 'center',
  },
  contentText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 8,
    textAlign: 'center',
  },
  contentSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  profileButton: {
    backgroundColor: '#3b82f6',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
