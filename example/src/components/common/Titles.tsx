import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface TitleProps {
  children: React.ReactNode;
}

export function Title({ children }: TitleProps) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

interface SubtitleProps {
  children: React.ReactNode;
}

export function Subtitle({ children }: SubtitleProps) {
  return <Text style={styles.modelInfo}>{children}</Text>;
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modelInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
});
