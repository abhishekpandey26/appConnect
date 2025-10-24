import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import SendModal from './SendModal';
import {useWeb3} from './hooks/useWeb3';

interface WalletDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  address: string;
  signClient: any;
  session: any;
  onDisconnect: () => void;
}

export default function WalletDetailsModal({
  visible,
  onClose,
  address,
  signClient,
  session,
  onDisconnect,
}: WalletDetailsModalProps) {
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  
  // Use our custom Web3 hook for all blockchain interactions
  const {balance, isLoading, sendTransaction, fetchBalance} = useWeb3(
    address,
    signClient,
    session
  );

  const getShortAddress = () => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const generateAvatar = () => {
    // Generate a simple gradient based on address
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const index = parseInt(address.substring(2, 4), 16) % colors.length;
    return colors[index];
  };

  // Copy address to clipboard
  const handleCopyAddress = () => {
    Clipboard.setString(address);
    Alert.alert('Copied!', 'Address copied to clipboard');
  };

  // Handle different actions
  const handleFundWallet = () => {
    Alert.alert(
      'Fund Wallet',
      'You can fund your wallet by:\n\n1. Transferring from another wallet\n2. Using a crypto exchange\n3. Buying with credit card (via exchanges)',
      [{text: 'OK'}]
    );
  };

  const handleSwap = () => {
    Alert.alert(
      'Swap Tokens',
      'Swap functionality coming soon!\n\nYou can use external DEXs like:\n• Uniswap\n• 1inch\n• SushiSwap',
      [{text: 'OK'}]
    );
  };

  const handleSend = () => {
    setSendModalVisible(true);
  };

  const handleActivity = async () => {
    Alert.alert(
      'Transaction History',
      `View your transactions on Etherscan`,
      [
        {text: 'Cancel'},
        {
          text: 'Open Etherscan',
          onPress: () => {
            // You can open Etherscan here using Linking
            Alert.alert('Info', `Etherscan: https://etherscan.io/address/${address}`);
          },
        },
      ]
    );
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            onDisconnect();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff'},
          ]}>
          {/* Header with close button */}
          <View style={styles.header}>
            <View style={styles.networkIndicator}>
              <View style={styles.networkDot} />
              <Text style={[styles.networkText, {color: isDarkMode ? '#fff' : '#000'}]}>
                Ethereum
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeIcon, {color: isDarkMode ? '#fff' : '#000'}]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              {backgroundColor: generateAvatar()},
            ]}>
            <Text style={styles.avatarText}>
              {address.substring(2, 4).toUpperCase()}
            </Text>
          </View>

          {/* Address */}
          <TouchableOpacity 
            style={styles.addressContainer}
            onPress={handleCopyAddress}
            activeOpacity={0.7}>
            <Text style={[styles.address, {color: isDarkMode ? '#fff' : '#000'}]}>
              🦊 {getShortAddress()}
            </Text>
            <Text style={styles.copyHint}>Tap to copy</Text>
          </TouchableOpacity>

          {/* Balance */}
          <View style={styles.balanceContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <>
                <Text style={[styles.balanceAmount, {color: isDarkMode ? '#fff' : '#000'}]}>
                  {balance}
                </Text>
                <Text style={[styles.balanceCurrency, {color: isDarkMode ? '#999' : '#666'}]}>
                  ETH
                </Text>
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {backgroundColor: isDarkMode ? '#3a3a3a' : '#f5f5f5'},
              ]}
              onPress={handleFundWallet}>
              <Text style={styles.actionIcon}>💵</Text>
              <Text style={[styles.actionText, {color: isDarkMode ? '#fff' : '#000'}]}>
                Fund wallet
              </Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                {backgroundColor: isDarkMode ? '#3a3a3a' : '#f5f5f5'},
              ]}
              onPress={handleSwap}>
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={[styles.actionText, {color: isDarkMode ? '#fff' : '#000'}]}>
                Swap
              </Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                {backgroundColor: isDarkMode ? '#3a3a3a' : '#f5f5f5'},
              ]}
              onPress={handleSend}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={[styles.actionText, {color: isDarkMode ? '#fff' : '#000'}]}>
                Send
              </Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                {backgroundColor: isDarkMode ? '#3a3a3a' : '#f5f5f5'},
              ]}
              onPress={handleActivity}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={[styles.actionText, {color: isDarkMode ? '#fff' : '#000'}]}>
                Activity
              </Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            {/* Disconnect Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.disconnectButton]}
              onPress={handleDisconnect}>
              <Text style={styles.actionIcon}>🔌</Text>
              <Text style={[styles.actionText, {color: '#ef4444'}]}>
                Disconnect
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Send Transaction Modal */}
      <SendModal
        visible={sendModalVisible}
        onClose={() => setSendModalVisible(false)}
        onSend={sendTransaction}
        balance={balance}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  networkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  networkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addressContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
  },
  copyHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 32,
    gap: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  balanceCurrency: {
    fontSize: 20,
    fontWeight: '600',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  actionArrow: {
    fontSize: 24,
    color: '#999',
  },
  disconnectButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginTop: 8,
  },
});
