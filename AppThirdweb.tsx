/**
 * Thirdweb-powered dApp
 * 
 * This is a complete rewrite using Thirdweb React Native SDK
 * which provides:
 * - Beautiful UI components
 * - Automatic balance fetching
 * - Multi-chain support
 * - Built-in wallet management
 * - Smart contract interactions
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ThirdwebProvider,
  ConnectWallet,
  useAddress,
  useBalance,
  useSDK,
  useConnectionStatus,
} from '@thirdweb-dev/react-native';
import {Ethereum, Polygon, Arbitrum, Optimism} from '@thirdweb-dev/chains';

// Your Thirdweb Client ID (get free one from https://thirdweb.com/dashboard)
const CLIENT_ID = 'your_client_id_here'; // Replace with your actual client ID

/**
 * Main App Component
 * Wrapped with ThirdwebProvider for Web3 functionality
 */
function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  
  // Thirdweb hooks - these give us everything we need!
  const address = useAddress(); // Get connected wallet address
  const connectionStatus = useConnectionStatus(); // Check connection status
  const {data: balance, isLoading: isLoadingBalance} = useBalance(); // Get ETH balance
  const sdk = useSDK(); // Access SDK for advanced operations

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f3f4f6',
    flex: 1,
  };

  /**
   * Send ETH transaction
   * Uses Thirdweb SDK to send transactions
   */
  const handleSendETH = async () => {
    if (!address || !sdk) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    Alert.prompt(
      'Send ETH',
      'Enter recipient address:',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Next',
          onPress: (recipientAddress) => {
            if (!recipientAddress) return;
            
            Alert.prompt(
              'Send ETH',
              'Enter amount in ETH:',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Send',
                  onPress: async (amount) => {
                    if (!amount) return;
                    
                    try {
                      // Send transaction using Thirdweb SDK
                      const tx = await sdk.wallet.transfer(
                        recipientAddress,
                        amount
                      );
                      
                      Alert.alert(
                        'Success!',
                        `Transaction sent!\\n\\nTx Hash: ${tx.receipt.transactionHash}`
                      );
                    } catch (error: any) {
                      Alert.alert('Error', error.message);
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ],
      'plain-text'
    );
  };

  /**
   * Sign a message
   * Demonstrates personal_sign functionality
   */
  const handleSignMessage = async () => {
    if (!address || !sdk) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    Alert.prompt(
      'Sign Message',
      'Enter message to sign:',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign',
          onPress: async (message) => {
            if (!message) return;
            
            try {
              const signature = await sdk.wallet.sign(message);
              Alert.alert(
                'Signed!',
                `Signature: ${signature.substring(0, 20)}...`
              );
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  /**
   * Get short address format
   */
  const getShortAddress = () => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
          {/* Title */}
          <Text style={[styles.title, {color: isDarkMode ? '#fff' : '#000'}]}>
            Thirdweb dApp
          </Text>
          <Text style={[styles.subtitle, {color: isDarkMode ? '#ccc' : '#666'}]}>
            Powered by Thirdweb React Native SDK
          </Text>

          {/* Thirdweb's Beautiful Connect Wallet Button */}
          <View style={styles.connectContainer}>
            <ConnectWallet
              theme={isDarkMode ? 'dark' : 'light'}
              btnTitle="Connect Wallet"
              modalTitle="Select Wallet"
              switchToActiveChain={true}
              modalSize="wide"
            />
          </View>

          {/* Connection Status */}
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, {color: isDarkMode ? '#fff' : '#000'}]}>
              Status: {connectionStatus}
            </Text>
          </View>

          {/* Show Wallet Info when connected */}
          {address && (
            <View style={styles.walletInfo}>
              {/* Address */}
              <View style={styles.infoCard}>
                <Text style={[styles.infoLabel, {color: isDarkMode ? '#999' : '#666'}]}>
                  Wallet Address
                </Text>
                <Text style={[styles.infoValue, {color: isDarkMode ? '#fff' : '#000'}]}>
                  {getShortAddress()}
                </Text>
              </View>

              {/* Balance */}
              <View style={styles.infoCard}>
                <Text style={[styles.infoLabel, {color: isDarkMode ? '#999' : '#666'}]}>
                  Balance
                </Text>
                {isLoadingBalance ? (
                  <Text style={[styles.infoValue, {color: isDarkMode ? '#fff' : '#000'}]}>
                    Loading...
                  </Text>
                ) : (
                  <Text style={[styles.infoValue, {color: isDarkMode ? '#fff' : '#000'}]}>
                    {balance?.displayValue} {balance?.symbol}
                  </Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, {backgroundColor: '#3b82f6'}]}
                  onPress={handleSendETH}>
                  <Text style={styles.actionButtonText}>📤 Send ETH</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, {backgroundColor: '#8b5cf6'}]}
                  onPress={handleSignMessage}>
                  <Text style={styles.actionButtonText}>✍️ Sign Message</Text>
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View style={styles.featuresList}>
                <Text style={[styles.featuresTitle, {color: isDarkMode ? '#fff' : '#000'}]}>
                  ✨ Features Included:
                </Text>
                <Text style={[styles.featureItem, {color: isDarkMode ? '#ccc' : '#666'}]}>
                  ✅ Multi-wallet support (MetaMask, Trust, Rainbow, etc.)
                </Text>
                <Text style={[styles.featureItem, {color: isDarkMode ? '#ccc' : '#666'}]}>
                  ✅ Multi-chain support (Ethereum, Polygon, Arbitrum, Optimism)
                </Text>
                <Text style={[styles.featureItem, {color: isDarkMode ? '#ccc' : '#666'}]}>
                  ✅ Automatic balance fetching
                </Text>
                <Text style={[styles.featureItem, {color: isDarkMode ? '#ccc' : '#666'}]}>
                  ✅ Send transactions
                </Text>
                <Text style={[styles.featureItem, {color: isDarkMode ? '#ccc' : '#666'}]}>
                  ✅ Sign messages
                </Text>
                <Text style={[styles.featureItem, {color: isDarkMode ? '#ccc' : '#666'}]}>
                  ✅ Smart contract interactions
                </Text>
              </View>
            </View>
          )}

          {/* Instructions when not connected */}
          {!address && (
            <View style={styles.instructions}>
              <Text style={[styles.instructionsText, {color: isDarkMode ? '#ccc' : '#666'}]}>
                👆 Tap "Connect Wallet" above to get started!
              </Text>
              <Text style={[styles.instructionsText, {color: isDarkMode ? '#ccc' : '#666'}]}>
                {'\n'}Thirdweb provides everything you need for a production-ready dApp:
              </Text>
              <Text style={[styles.instructionsText, {color: isDarkMode ? '#ccc' : '#666'}]}>
                • Beautiful pre-built UI components{'\n'}
                • Automatic wallet detection{'\n'}
                • Multi-chain support{'\n'}
                • Token swapping (coming soon){'\n'}
                • NFT support{'\n'}
                • And much more!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Root App with ThirdwebProvider
 * This wraps the entire app with Web3 context
 */
export default function App() {
  return (
    <ThirdwebProvider
      activeChain={Ethereum} // Default chain
      supportedChains={[Ethereum, Polygon, Arbitrum, Optimism]} // Supported chains
      clientId={CLIENT_ID} // Your Thirdweb client ID
      autoConnect={true} // Auto-connect to last used wallet
    >
      <AppContent />
    </ThirdwebProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    minHeight: 600,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  connectContainer: {
    marginVertical: 30,
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 10,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  walletInfo: {
    width: '100%',
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresList: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 12,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 14,
    marginVertical: 4,
    lineHeight: 20,
  },
  instructions: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
