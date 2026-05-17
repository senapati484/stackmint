import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('expo', {

  id: 'expo',
  files: (config: StackConfig): AdapterFile[] => [
    {
      path: 'app/(tabs)/index.tsx',
      content: `import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Expo</Text>
      <Text style={styles.subtitle}>Get started by editing app/(tabs)/index.tsx</Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Scaffolded with stackmint (https://stackmint-docs.vercel.app)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
`,
    },
    {
      path: 'app/_layout.tsx',
      content: `import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
`,
    },
    {
      path: 'app.json',
      content: JSON.stringify({
        expo: {
          name: config.projectName || 'my-app',
          slug: config.projectName || 'my-app',
          version: '1.0.0',
          scheme: config.projectName || 'my-app',
        },
        splash: {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        },
        ios: {
          supportsTablet: true
        },
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff'
          }
        },
        plugins: [
          'expo-router'
        ]
      }, null, 2),
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        extends: 'expo/tsconfig.base'
      }, null, 2),
    },
  ],
  scripts: {
    start: 'expo start',
    android: 'expo start --android',
    ios: 'expo start --ios',
  },
});