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

const PROJECT_ID = 'b5f59b62f46c8f9f155e7221f936a629';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [status, setStatus] = useState('Initializing...');
  const [wcUri, setWcUri] = useState('');
  const [session, setSession] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
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
              <View style={styles.walletDetailsContainer}>
                <Text style={[styles.walletDetailsTitle, {color: isDarkMode ? '#fff' : '#000'}]}>
                  💼 Wallet Connected
                </Text>

                {/* Wallet Address */}
                {session.namespaces?.eip155?.accounts?.[0] && (
                  <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, {color: isDarkMode ? '#999' : '#666'}]}>
                      Address
                    </Text>
                    <Text style={[styles.detailValue, {color: isDarkMode ? '#fff' : '#000'}]}>
                      {session.namespaces.eip155.accounts[0].split(':')[2]}
                    </Text>
                    <Text style={[styles.detailValueShort, {color: isDarkMode ? '#3b82f6' : '#2563eb'}]}>
                      {session.namespaces.eip155.accounts[0].split(':')[2]?.substring(0, 6)}...
                      {session.namespaces.eip155.accounts[0].split(':')[2]?.substring(
                        session.namespaces.eip155.accounts[0].split(':')[2].length - 4
                      )}
                    </Text>
                  </View>
                )}

                {/* Chain Information */}
                {session.namespaces?.eip155?.chains && (
                  <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, {color: isDarkMode ? '#999' : '#666'}]}>
                      Network
                    </Text>
                    <Text style={[styles.detailValue, {color: isDarkMode ? '#fff' : '#000'}]}>
                      {session.namespaces.eip155.chains.map(chain => {
                        const chainId = chain.split(':')[1];
                        const chainNames: {[key: string]: string} = {
                          '1': 'Ethereum Mainnet',
                          '5': 'Goerli Testnet',
                          '137': 'Polygon',
                          '80001': 'Mumbai Testnet',
                          '56': 'BNB Smart Chain',
                          '43114': 'Avalanche',
                          '42161': 'Arbitrum',
                          '10': 'Optimism',
                        };
                        return chainNames[chainId] || `Chain ${chainId}`;
                      }).join(', ')}
                    </Text>
                  </View>
                )}

                {/* Peer Metadata (Wallet Info) */}
                {session.peer?.metadata && (
                  <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, {color: isDarkMode ? '#999' : '#666'}]}>
                      Connected Wallet
                    </Text>
                    <Text style={[styles.detailValue, {color: isDarkMode ? '#fff' : '#000'}]}>
                      {session.peer.metadata.name}
                    </Text>
                    {session.peer.metadata.description && (
                      <Text style={[styles.detailDescription, {color: isDarkMode ? '#999' : '#666'}]}>
                        {session.peer.metadata.description}
                      </Text>
                    )}
                  </View>
                )}

                {/* Session Topic */}
                <View style={styles.detailCard}>
                  <Text style={[styles.detailLabel, {color: isDarkMode ? '#999' : '#666'}]}>
                    Session ID
                  </Text>
                  <Text style={[styles.detailValueSmall, {color: isDarkMode ? '#ccc' : '#666'}]}>
                    {session.topic}
                  </Text>
                </View>

                {/* Supported Methods */}
                {session.namespaces?.eip155?.methods && (
                  <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, {color: isDarkMode ? '#999' : '#666'}]}>
                      Supported Methods
                    </Text>
                    <View style={styles.methodsContainer}>
                      {session.namespaces.eip155.methods.map((method, index) => (
                        <View key={index} style={styles.methodBadge}>
                          <Text style={styles.methodText}>{method}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Events */}
                {session.namespaces?.eip155?.events && (
                  <View style={styles.detailCard}>
                    <Text style={[styles.detailLabel, {color: isDarkMode ? '#999' : '#666'}]}>
                      Subscribed Events
                    </Text>
                    <View style={styles.methodsContainer}>
                      {session.namespaces.eip155.events.map((event, index) => (
                        <View key={index} style={[styles.methodBadge, styles.eventBadge]}>
                          <Text style={styles.methodText}>{event}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, styles.disconnectButton]}
                onPress={handleDisconnect}>
                <Text style={styles.buttonText}>Disconnect Wallet</Text>
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
      
      <WalletModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectWallet={handleWalletSelect}
        onShowQRCode={handleShowQRCode}
      />
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
  walletDetailsContainer: {
    width: '100%',
    marginVertical: 20,
  },
  walletDetailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValueShort: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  detailValueSmall: {
    fontSize: 10,
    fontFamily: 'Courier',
    lineHeight: 16,
  },
  detailDescription: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  methodBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  eventBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
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
