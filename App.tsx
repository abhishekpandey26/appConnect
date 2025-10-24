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
  Platform,
} from 'react-native';
import 'react-native-get-random-values';
import '@walletconnect/react-native-compat';
import {SignClient} from '@walletconnect/sign-client';
import type {SignClientTypes} from '@walletconnect/types';
import WalletModal from './WalletModal';
import WalletDetailsModal from './WalletDetailsModal';

const PROJECT_ID = 'b5f59b62f46c8f9f155e7221f936a629';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [status, setStatus] = useState('Initializing...');
  const [wcUri, setWcUri] = useState('');
  const [session, setSession] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [walletDetailsVisible, setWalletDetailsVisible] = useState(false);
  const signClient = useRef<SignClient | null>(null);
  const pendingApproval = useRef<any>(null);

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
        pendingApproval.current = approval;
        setModalVisible(true);
        setStatus('Select a wallet to connect');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setStatus(
        `❌ Connection failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const handleWalletSelect = async (wallet: any) => {
    try {
      setModalVisible(false);

      if (wallet.installed) {
        // Wallet is installed, open it directly
        setStatus(`Opening ${wallet.name}...`);
        const walletUri = `${wallet.scheme.replace('://', '')}://wc?uri=${encodeURIComponent(wcUri)}`;
        
        const canOpen = await Linking.canOpenURL(walletUri);
        if (canOpen) {
          await Linking.openURL(walletUri);
          setStatus(`Please approve the connection in ${wallet.name}`);
        } else {
          // Fallback to regular WC URI
          await Linking.openURL(wcUri);
          setStatus('Please approve the connection in your wallet app');
        }
      } else {
        // Wallet not installed, redirect to store
        const storeUrl = Platform.OS === 'ios' ? wallet.iosAppStore : wallet.androidPlayStore;
        Alert.alert(
          `${wallet.name} Not Installed`,
          `${wallet.name} is not installed. Would you like to install it?`,
          [
            {
              text: 'Install',
              onPress: () => {
                Linking.openURL(storeUrl);
                setStatus(`Please install ${wallet.name} and try connecting again`);
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setStatus('Connection cancelled'),
            },
          ]
        );
        return;
      }

      // Wait for session approval
      if (pendingApproval.current) {
        const sessionData = await pendingApproval.current();
        setSession(sessionData);
        setStatus('✅ Connected successfully!');
        pendingApproval.current = null;
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setStatus(
        `❌ Connection failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const handleShowQRCode = () => {
    setModalVisible(false);
    setShowQRCode(true);
    Alert.alert(
      'Scan QR Code',
      `Scan this URI with your wallet app:\n\n${wcUri}`,
      [{text: 'OK', onPress: () => setShowQRCode(false)}]
    );
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
              <View style={styles.connectedContainer}>
                <Text style={[styles.connectedTitle, {color: isDarkMode ? '#fff' : '#000'}]}>
                  ✅ Wallet Connected
                </Text>
                
                {session.namespaces?.eip155?.accounts?.[0] && (
                  <TouchableOpacity
                    style={[
                      styles.addressButton,
                      {
                        backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                        borderColor: isDarkMode ? '#3b82f6' : '#2563eb',
                      },
                    ]}
                    onPress={() => setWalletDetailsVisible(true)}>
                    <Text style={[styles.addressButtonText, {color: isDarkMode ? '#3b82f6' : '#2563eb'}]}>
                      {session.namespaces.eip155.accounts[0].split(':')[2]?.substring(0, 6)}...
                      {session.namespaces.eip155.accounts[0].split(':')[2]?.substring(
                        session.namespaces.eip155.accounts[0].split(':')[2].length - 4
                      )}
                    </Text>
                    <Text style={styles.tapHint}>Tap to view details</Text>
                  </TouchableOpacity>
                )}
              </View>
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
      
      <WalletModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectWallet={handleWalletSelect}
        onShowQRCode={handleShowQRCode}
      />
      
      {session?.namespaces?.eip155?.accounts?.[0] && (
        <WalletDetailsModal
          visible={walletDetailsVisible}
          onClose={() => setWalletDetailsVisible(false)}
          address={session.namespaces.eip155.accounts[0].split(':')[2]}
          onDisconnect={handleDisconnect}
        />
      )}
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
  connectedContainer: {
    width: '100%',
    marginVertical: 30,
    alignItems: 'center',
  },
  connectedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addressButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    minWidth: 200,
  },
  addressButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tapHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
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
