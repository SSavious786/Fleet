import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import colors from '../../../src/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
};

export default function ProfileScreen() {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Avatar.Icon size={100} icon="account" style={styles.avatar} color={colors.white} />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Button
        mode="contained"
        style={styles.button}
        labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
        onPress={handleLogout}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light,
    padding: 24,
  },
  avatar: {
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    elevation: 2,
    width: '60%',
    alignSelf: 'center',
  },
}); 