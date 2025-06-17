import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';

export const useFullscreen = () => {
  useEffect(() => {
    const setupFullscreen = async () => {
      if (Platform.OS === 'android') {
        try {
          // Configure status bar for edge-to-edge mode
          StatusBar.setHidden(false);
          StatusBar.setTranslucent(true);
          StatusBar.setBarStyle('light-content', true);
          
          // For edge-to-edge mode, we only need to hide the navigation bar
          // System UI colors are handled by the framework
          await NavigationBar.setVisibilityAsync('hidden');
          
        } catch (error) {
          console.log('Fullscreen configuration failed:', error);
        }
      }
    };

    setupFullscreen();
  }, []);
};
