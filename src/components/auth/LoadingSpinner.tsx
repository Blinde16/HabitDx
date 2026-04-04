import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { HabitDxLogo } from '../brand';

interface LoadingSpinnerProps {
  message?: string;
  /** Show brand mark above the spinner (default true). */
  showLogo?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  showLogo = true,
}) => {
  return (
    <View style={styles.container}>
      {showLogo ? (
        <HabitDxLogo variant="mark" width={152} style={{ alignSelf: 'center', marginBottom: 24 }} />
      ) : null}
      <ActivityIndicator size="large" color="#191c1e" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fb',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#5c6370',
  },
});
