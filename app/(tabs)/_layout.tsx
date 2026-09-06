import React from 'react';
import { Tabs } from 'expo-router';
import { ClockIcon, DumbbellIcon, HomeIcon } from '../../components/icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#9618D1',
        tabBarInactiveTintColor: '#8A8190',
        tabBarStyle: { backgroundColor: '#332838', borderTopColor: '#463a4d' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color, size }) => <DumbbellIcon color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <ClockIcon color={color as string} size={size} />,
        }}
      />
    </Tabs>
  );
}
