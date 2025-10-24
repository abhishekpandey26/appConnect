import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';

interface SendModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (to: string, amount: string) => Promise<string>;
  balance: string;
}

/**
 * SendModal Component
 * 
 * This modal allows users to send ETH to another address
 * It validates the recipient address and amount before sending
 */
export default function SendModal({
  visible,
  onClose,
  onSend,
  balance,
}: SendModalProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  // Validate if string is a valid Ethereum address
  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Handle send transaction
  const handleSend = async () => {
    // Validation checks
    if (!recipientAddress) {
      Alert.alert('Error', 'Please enter recipient address');
      return;
    }

    if (!isValidAddress(recipientAddress)) {
      Alert.alert('Error', 'Invalid Ethereum address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    // Confirm transaction with user
    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ETH to\n${recipientAddress.substring(0, 10)}...${recipientAddress.substring(recipientAddress.length - 8)}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Send',
          onPress: async () => {
            setIsSending(true);
            try {
              // Call the send function passed from parent
              const txHash = await onSend(recipientAddress, amount);
              
              Alert.alert(
                'Success!',
                `Transaction sent!\n\nTx Hash: ${txHash.substring(0, 10)}...`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Reset form and close modal
                      setRecipientAddress('');
                      setAmount('');
                      onClose();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Transaction Failed', error.message || 'Unknown error');
            } finally {
              setIsSending(false);
            }
          },
        },
      ]
    );
  };

  // Quick amount buttons (25%, 50%, 75%, 100% of balance)
  const setPercentage = (percentage: number) => {
    const calculatedAmount = (parseFloat(balance) * percentage).toFixed(4);
    setAmount(calculatedAmount);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff'},
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, {color: isDarkMode ? '#fff' : '#000'}]}>
              Send ETH
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, {color: isDarkMode ? '#fff' : '#000'}]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Balance Display */}
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel, {color: '#999'}]}>Available Balance</Text>
            <Text style={[styles.balanceValue, {color: isDarkMode ? '#fff' : '#000'}]}>
              {balance} ETH
            </Text>
          </View>

          {/* Recipient Address Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: isDarkMode ? '#ccc' : '#666'}]}>
              Recipient Address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                  color: isDarkMode ? '#fff' : '#000',
                },
              ]}
              placeholder="0x..."
              placeholderTextColor="#999"
              value={recipientAddress}
              onChangeText={setRecipientAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: isDarkMode ? '#ccc' : '#666'}]}>
              Amount (ETH)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                  color: isDarkMode ? '#fff' : '#000',
                },
              ]}
              placeholder="0.0"
              placeholderTextColor="#999"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            {/* Quick percentage buttons */}
            <View style={styles.percentageContainer}>
              {[0.25, 0.5, 0.75, 1.0].map((percentage) => (
                <TouchableOpacity
                  key={percentage}
                  style={styles.percentageButton}
                  onPress={() => setPercentage(percentage)}>
                  <Text style={styles.percentageText}>
                    {percentage === 1 ? 'MAX' : `${percentage * 100}%`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              isSending && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isSending}>
            {isSending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Send ETH</Text>
            )}
          </TouchableOpacity>

          {/* Info Note */}
          <Text style={[styles.infoText, {color: '#999'}]}>
            ⚠️ Make sure the recipient address is correct. Transactions cannot be reversed.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 28,
  },
  balanceContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  percentageContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  percentageButton: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 8,
    alignItems: 'center',
  },
  percentageText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
});
