import React, { useState, useRef } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import colors from '../../src/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginApi } from '../../src/api/login';
import { router } from 'expo-router';

export default function LoginScreen({ navigation = null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const passwordRef = useRef();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await loginApi(email, password);
      await AsyncStorage.setItem('userToken', token);
      setLoading(false);
      router.replace('/'); // Navigate to main app after login
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <Image source={require('../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Track IO</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email-outline" color={colors.primary} />}
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus password input if needed
                passwordRef?.current?.focus();
              }}
              blurOnSubmit={false}
            />
            <TextInput
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              left={<TextInput.Icon icon="lock-outline" color={colors.primary} />}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
              contentStyle={{ paddingVertical: 8 }}
              labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
            >
              Login
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.light,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 1,
  },
  button: {
    backgroundColor: colors.primary,
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
}); 