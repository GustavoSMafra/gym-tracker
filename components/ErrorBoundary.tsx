import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './ui/Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Defense-in-depth: keeps an unexpected crash anywhere in the tree (e.g. a
// third-party module throwing synchronously) from blanking the whole app.
// This does not replace fixing the underlying bug — it's a fallback for the
// next one we haven't found yet.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled error in app tree:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center gap-4 bg-background p-8">
          <Text className="text-center text-lg font-bold text-white">Something went wrong</Text>
          <Text className="text-center text-sm text-white/60">
            {this.state.error.message}
          </Text>
          <Button label="Try Again" onPress={() => this.setState({ error: null })} />
        </View>
      );
    }
    return this.props.children;
  }
}
