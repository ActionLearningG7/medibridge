/**
 * Google Maps Loader Utility
 * Safely loads Google Maps JS API using environment variable
 * Prevents duplicate loading and exposes clean API
 */

let mapsLoaderPromise = null;
let mapsLoaded = false;

/**
 * Load Google Maps API
 * @returns {Promise<window.google.maps>} Resolved google.maps namespace
 * @throws {Error} If API key is missing or loading fails
 */
export const loadGoogleMaps = () => {
  // Return cached promise if already loading or loaded
  if (mapsLoaderPromise) {
    return mapsLoaderPromise;
  }

  mapsLoaderPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (mapsLoaded && window.google?.maps) {
      return resolve(window.google.maps);
    }

    // Get API key from environment
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      const error = new Error('Google Maps API key not configured. Set REACT_APP_GOOGLE_MAPS_API_KEY in environment.');
      reject(error);
      return;
    }

    // Check if already loading (script tag exists)
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkInterval);
          mapsLoaded = true;
          resolve(window.google.maps);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.google?.maps) {
          reject(new Error('Google Maps API failed to load'));
        }
      }, 10000); // 10 second timeout
      return;
    }

    // Create and append script tag
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places,directions`;

    script.onload = () => {
      if (window.google?.maps) {
        mapsLoaded = true;
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps API failed to initialize'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API script'));
    };

    document.head.appendChild(script);
  });

  return mapsLoaderPromise;
};

/**
 * Check if Google Maps is available
 * @returns {boolean}
 */
export const isGoogleMapsLoaded = () => {
  return mapsLoaded && !!window.google?.maps;
};

/**
 * Get Google Maps namespace
 * Only use after loadGoogleMaps() is resolved
 * @returns {window.google.maps|null}
 */
export const getGoogleMaps = () => {
  if (isGoogleMapsLoaded()) {
    return window.google.maps;
  }
  return null;
};
