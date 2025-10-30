export default ({ config }) => {
  const environment = process.env.APP_ENV || 'development';

  const envConfigs = {
    development: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000/api',
    },
    production: {
      apiBaseUrl: process.env.API_BASE_URL || 'https://your-app.vercel.app/api',
    },
  };

  return {
    ...config,
    name: 'SquadRun',
    slug: 'squadrun',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#111827',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.squadrun.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#111827',
      },
      package: 'com.squadrun.app',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      ...envConfigs[environment],
      environment,
    },
  };
};
