// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

import LoginScreen       from '../screens/LoginScreen';
import HomeScreen        from '../screens/HomeScreen';
import MatchSetupScreen  from '../screens/MatchSetupScreen';
import ScoringScreen     from '../screens/ScoringScreen';
import MatchResultScreen from '../screens/MatchResultScreen';
import TournamentScreen  from '../screens/TournamentScreen';
import HistoryScreen     from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a1a',
          borderTopWidth: 0.5,
          paddingBottom: 4,
        },
        tabBarActiveTintColor: '#4fc3f7',
        tabBarInactiveTintColor: '#3a3a3a',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Home:       focused ? 'home'              : 'home-outline',
            Tournament: focused ? 'trophy'            : 'trophy-outline',
            History:    focused ? 'time'              : 'time-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"       component={HomeScreen} />
      <Tab.Screen name="Tournament" component={TournamentScreen} />
      <Tab.Screen name="History"    component={HistoryScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main"        component={MainTabs} />
            <Stack.Screen name="MatchSetup"  component={MatchSetupScreen} />
            <Stack.Screen
              name="Scoring"
              component={ScoringScreen}
              options={{ gestureEnabled: false }}  // block swipe-back mid-game
            />
            <Stack.Screen name="MatchResult" component={MatchResultScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
