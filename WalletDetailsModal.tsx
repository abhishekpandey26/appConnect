import React, {useState, useEffect} from 'react';
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

interface WalletDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  address: string;
  onDisconnect: () => void;
}

export default function WalletDetailsModal({
  visible,
  onClose,
  address,
  onDisconnect,
}: WalletDetailsModalProps) {
  const [balance, setBalance] = useState<string>('0.000');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    if (visible && address) {
      fetchBalance();
    }
  }, [visible, address]);

  const fetchBalance = async () => {
    setIsLoadingBalance(true);
    try {
      // Fetch ETH balance from Ethereum JSON-RPC
      const response = await fetch('https://cloudflare-eth.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      });

      const data = await response.json();
      if (data.result) {
        // Convert from Wei to ETH
        const balanceWei = parseInt(data.result, 16);
        const balanceEth = (balanceWei / 1e18).toFixed(4);
        setBalance(balanceEth);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0.000');
    } finally {
      setIsLoadingBalance(false);
    }
  };

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

  const handleAction = (action: string) => {
    Alert.alert(
      action,
      `${action} feature will be implemented here`,
      [{text: 'OK'}]
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
          <View style={styles.addressContainer}>
            <Text style={[styles.address, {color: isDarkMode ? '#fff' : '#000'}]}>
              🦊 {getShortAddress()}
            </Text>
          </View>

          {/* Balance */}
          <View style={styles.balanceContainer}>
            {isLoadingBalance ? (
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
              onPress={() => handleAction('Fund wallet')}>
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
              onPress={() => handleAction('Swap')}>
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
              onPress={() => handleAction('Send')}>
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
              onPress={() => handleAction('Activity')}>
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
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
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
