import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

/**
 * Custom hook for Web3 interactions
 * This hook manages all blockchain operations like fetching balance, sending transactions, etc.
 */
export const useWeb3 = (address?: string, signClient?: any, session?: any) => {
  const [balance, setBalance] = useState<string>('0.000');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);

  // Initialize provider when component mounts
  useEffect(() => {
    // Using Cloudflare's free Ethereum RPC endpoint
    // This allows us to read data from the blockchain without needing an API key
    const rpcProvider = new ethers.providers.JsonRpcProvider(
      'https://cloudflare-eth.com'
    );
    setProvider(rpcProvider);
  }, []);

  // Fetch ETH balance whenever address changes
  useEffect(() => {
    if (address && provider) {
      fetchBalance();
    }
  }, [address, provider]);

  /**
   * Fetch the ETH balance for the connected wallet
   * Uses ethers.js to query the blockchain
   */
  const fetchBalance = async () => {
    if (!address || !provider) return;

    setIsLoading(true);
    try {
      // Get balance in Wei (smallest unit of ETH)
      const balanceWei = await provider.getBalance(address);
      
      // Convert Wei to ETH (1 ETH = 10^18 Wei)
      const balanceEth = ethers.utils.formatEther(balanceWei);
      
      // Format to 4 decimal places
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0.000');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send ETH to another address
   * This uses WalletConnect to request the wallet to sign and send the transaction
   */
  const sendTransaction = async (to: string, amount: string) => {
    if (!signClient || !session || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Convert ETH amount to Wei
      const value = ethers.utils.parseEther(amount).toHexString();

      // Prepare transaction request
      const tx = {
        from: address,
        to: to,
        value: value,
        // Gas limit - maximum gas willing to use
        gas: '0x5208', // 21000 in hex (standard for ETH transfer)
      };

      // Request wallet to sign and send transaction via WalletConnect
      const result = await signClient.request({
        topic: session.topic,
        chainId: 'eip155:1', // Ethereum mainnet
        request: {
          method: 'eth_sendTransaction',
          params: [tx],
        },
      });

      return result; // Returns transaction hash
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  };

  /**
   * Sign a message with the wallet
   * Used for proving ownership of an address
   */
  const signMessage = async (message: string) => {
    if (!signClient || !session || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await signClient.request({
        topic: session.topic,
        chainId: 'eip155:1',
        request: {
          method: 'personal_sign',
          params: [message, address],
        },
      });

      return result;
    } catch (error) {
      console.error('Sign message error:', error);
      throw error;
    }
  };

  /**
   * Get the current gas price
   * Useful for estimating transaction costs
   */
  const getGasPrice = async () => {
    if (!provider) return '0';

    try {
      const gasPrice = await provider.getGasPrice();
      return ethers.utils.formatUnits(gasPrice, 'gwei'); // Convert to Gwei
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return '0';
    }
  };

  /**
   * Get transaction history (simplified version)
   * Note: For full transaction history, you'd need Etherscan API or similar service
   */
  const getTransactionCount = async () => {
    if (!address || !provider) return 0;

    try {
      const count = await provider.getTransactionCount(address);
      return count;
    } catch (error) {
      console.error('Error fetching transaction count:', error);
      return 0;
    }
  };

  return {
    balance,
    isLoading,
    fetchBalance,
    sendTransaction,
    signMessage,
    getGasPrice,
    getTransactionCount,
    provider,
  };
};
