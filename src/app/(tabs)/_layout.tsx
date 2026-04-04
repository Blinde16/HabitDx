import { Redirect, Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';

export default function TabLayout() {
  const { user, initialized, loading } = useAuthStore();

  if (!initialized || loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#191c1e',
        tabBarInactiveTintColor: '#8a9199',
        tabBarStyle: {
          backgroundColor: '#f7f9fb',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 10,
          paddingBottom: 10,
          height: 62,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'PublicSans_500Medium',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
