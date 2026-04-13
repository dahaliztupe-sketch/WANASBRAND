/**
 * Deep Linking Configuration for WANAS Mobile App.
 */

export const deepLinkingConfig = {
  prefixes: ['wanas://', 'https://wanasbrand.com'],
  config: {
    screens: {
      Home: 'home',
      Product: 'product/:slug',
      Collection: 'collections/:id',
      Account: 'account',
    },
  },
};
