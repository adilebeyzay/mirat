import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';

// Screens
import SensorDataScreen from '../screens/SensorDataScreen';
import CameraDataScreen from '../screens/CameraDataScreen';
import SystemHealthScreen from '../screens/SystemHealthScreen';
import MovementControlScreen from '../screens/MovementControlScreen';
import GalleryScreen from '../screens/GalleryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Camera Stack Navigator
const CameraStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CameraMain"
        component={CameraDataScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Sensör Verileri') {
            iconName = 'analytics';
          } else if (route.name === 'Kamera Verileri') {
            iconName = 'videocam';
          } else if (route.name === 'Sistem Sağlığı') {
            iconName = 'medical';
          } else if (route.name === 'Hareket Kontrol') {
            iconName = 'game-controller';
          } else {
            iconName = 'help';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}>
      <Tab.Screen
        name="Sensör Verileri"
        component={SensorDataScreen}
        options={{
          title: 'Sensör Verileri',
        }}
      />
      <Tab.Screen
        name="Kamera Verileri"
        component={CameraStack}
        options={{
          title: 'Kamera Verileri',
        }}
      />
      <Tab.Screen
        name="Sistem Sağlığı"
        component={SystemHealthScreen}
        options={{
          title: 'Sistem Sağlığı',
        }}
      />
      <Tab.Screen
        name="Hareket Kontrol"
        component={MovementControlScreen}
        options={{
          title: 'Hareket Kontrol',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;

