const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for socket.io-client with Metro bundler
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Handle ESM modules
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
