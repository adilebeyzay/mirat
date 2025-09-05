import React from 'react';
import {StatusBar} from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
};

export default App;