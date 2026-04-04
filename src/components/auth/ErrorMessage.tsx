import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontFamily } from '../../lib/fonts';

interface ErrorMessageProps {
  message: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0e6e8',
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
  },
  text: {
    color: '#6b2f38',
    fontSize: 14,
    fontFamily: fontFamily.publicSans,
    lineHeight: 21,
  },
});
