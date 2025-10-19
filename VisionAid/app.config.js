require('dotenv').config();
const appJson = require('./app.json');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo?.extra || {}),
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    },
    ios: {
      ...(appJson.expo?.ios || {}),
      config: {
        ...(appJson.expo?.ios?.config || {}),
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      ...(appJson.expo?.android || {}),
      config: {
        ...(appJson.expo?.android?.config || {}),
        googleMaps: {
          ...(appJson.expo?.android?.config?.googleMaps || {}),
          apiKey: GOOGLE_MAPS_API_KEY,
        },
      },
    },
  },
};