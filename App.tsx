/**
 * WalletConnect React Native Example
 * @format
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Linking,
  Alert,
} from 'react-native';
import 'react-native-get-random-values';
import '@walletconnect/react-native-compat';
import {SignClient} from '@walletconnect/sign-client';
import type {SignClientTypes} from '@walletconnect/types';

const PROJECT_ID = 'b5f59b62f46c8f9f155e7221f936a629';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [status, setStatus] = useState('Initializing...');
  const [wcUri, setWcUri] = useState('');
  const [session, setSession] = useState<any>(null);
  const signClient = useRef<SignClient | null>(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f3f4f6',
    flex: 1,
  };

  useEffect(() => {
    initializeWalletConnect();
  }, []);

  const initializeWalletConnect = async () => {
    try {
      setStatus('Initializing WalletConnect...');
      
      const client = await SignClient.init({
        projectId: PROJECT_ID,
        metadata: {
          name: 'WalletConnect Test App',
          description: 'React Native WalletConnect Integration',
          url: 'https://walletconnect.com',
          icons: ['https://walletconnect.com/walletconnect-logo.png'],
        },
      });

      signClient.current = client;
      setStatus('✅ WalletConnect initialized successfully!');

      // Check if there are any active sessions
      const sessions = client.session.getAll();
      if (sessions.length > 0) {
        setSession(sessions[0]);
        setStatus('✅ Active session found!');
      }

      // Subscribe to session events
      client.on('session_event', ({event}) => {
        console.log('session_event', event);
      });

      client.on('session_update', ({topic, params}) => {
        console.log('session_update', topic, params);
      });

      client.on('session_delete', () => {
        setSession(null);
        setStatus('Session disconnected');
      });
    } catch (error) {
      console.error('WalletConnect initialization error:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleConnect = async () => {
    try {
      if (!signClient.current) {
        Alert.alert('Error', 'WalletConnect client not initialized');
        return;
      }

      setStatus('Creating connection proposal...');

      const {uri, approval} = await signClient.current.connect({
        requiredNamespaces: {
          eip155: {
            methods: ['eth_sendTransaction', 'personal_sign'],
            chains: ['eip155:1'],
            events: ['chainChanged', 'accountsChanged'],
          },
        },
      });

      if (uri) {
        setWcUri(uri);
        setStatus(`Connection URI generated! Opening wallet...`);
        
        // Open the URI with the wallet app
        // For testing, this will try to open with any compatible wallet
        const supported = await Linking.canOpenURL(uri);
        if (supported) {
          await Linking.openURL(uri);
        } else {
          Alert.alert(
            'No Wallet Found',
            `Please install a WalletConnect compatible wallet or scan this URI manually:\n\n${uri}`,
            [{text: 'OK'}]
          );
        }

        // Wait for session approval
        const sessionData = await approval();
        setSession(sessionData);
        setStatus('✅ Connected successfully!');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setStatus(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (!signClient.current || !session) {
        return;
      }

      await signClient.current.disconnect({
        topic: session.topic,
        reason: {
          code: 6000,
          message: 'User disconnected',
        },
      });

      setSession(null);
      setStatus('Disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
      Alert.alert('Error', `Failed to disconnect: ${error}`);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.container}>
          <Text style={[styles.title, {color: isDarkMode ? '#fff' : '#000'}]}>
            WalletConnect Test App
          </Text>
          <Text style={[styles.subtitle, {color: isDarkMode ? '#ccc' : '#666'}]}>
            React Native Integration
          </Text>

          <View style={styles.statusContainer}>
            <Text style={[styles.status, {color: isDarkMode ? '#fff' : '#000'}]}>
              {status}
            </Text>
          </View>

          {!session ? (
            <TouchableOpacity
              style={styles.button}
              onPress={handleConnect}
              disabled={!signClient.current}>
              <Text style={styles.buttonText}>Connect Wallet</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.sessionContainer}>
                <Text style={[styles.sessionTitle, {color: isDarkMode ? '#fff' : '#000'}]}>
                  Connected!
                </Text>
                <Text style={[styles.sessionText, {color: isDarkMode ? '#ccc' : '#666'}]}>
                  Topic: {session.topic.substring(0, 20)}...
                </Text>
                {session.namespaces?.eip155?.accounts?.[0] && (
                  <Text style={[styles.sessionText, {color: isDarkMode ? '#ccc' : '#666'}]}>
                    Account: {session.namespaces.eip155.accounts[0].split(':')[2]?.substring(0, 10)}...
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.button, styles.disconnectButton]}
                onPress={handleDisconnect}>
                <Text style={styles.buttonText}>Disconnect</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.infoContainer}>
            <Text style={[styles.infoTitle, {color: isDarkMode ? '#fff' : '#000'}]}>
              Info:
            </Text>
            <Text style={[styles.infoText, {color: isDarkMode ? '#ccc' : '#666'}]}>
              • PROJECT_ID: {PROJECT_ID.substring(0, 12)}...{' \n'}
              • Make sure you have a WalletConnect compatible wallet installed{' \n'}
              • Tap "Connect Wallet" to start{' \n'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 600,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 20,
    minWidth: 200,
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 20,
    marginBottom: 10,
    padding: 15,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 10,
    width: '100%',
  },
  status: {
    fontSize: 14,
    textAlign: 'center',
  },
  sessionContainer: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 10,
    width: '100%',
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  sessionText: {
    fontSize: 12,
    marginVertical: 4,
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 10,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default App;
