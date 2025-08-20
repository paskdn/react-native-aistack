import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingDisplayProps {
  isLoading: boolean;
  loadingText?: string;
}

export function LoadingDisplay({
  isLoading,
  loadingText = 'Loading...',
}: LoadingDisplayProps) {
  if (!isLoading) return null;

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>{loadingText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
