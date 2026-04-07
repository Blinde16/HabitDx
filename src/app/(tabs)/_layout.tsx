import { Redirect, Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

export default function TabLayout() {
  const { user, initialized, loading } = useAuthStore();
  const isWeb = Platform.OS === 'web';

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
        tabBarPosition: isWeb ? 'top' : 'bottom',
        tabBarStyle: {
          backgroundColor: '#f7f9fb',
          borderTopWidth: 0,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: isWeb ? 18 : 10,
          paddingBottom: isWeb ? 14 : 10,
          height: isWeb ? 78 : 62,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'PublicSans_500Medium',
          marginTop: isWeb ? 6 : 2,
        },
        tabBarItemStyle: {
          paddingVertical: isWeb ? 8 : 4,
          maxWidth: isWeb ? 180 : undefined,
        },
        tabBarIndicatorStyle: isWeb
          ? {
              backgroundColor: '#62c49d',
              height: 3,
              borderRadius: 999,
            }
          : undefined,
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
