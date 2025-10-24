import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Linking,
  Platform,
  useColorScheme,
} from 'react-native';

interface Wallet {
  id: string;
  name: string;
  scheme: string;
  icon: string;
  installed?: boolean;
  iosAppStore: string;
  androidPlayStore: string;
}

const WALLETS: Wallet[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    scheme: 'metamask://',
    icon: '🦊',
    iosAppStore: 'https://apps.apple.com/app/metamask/id1438144202',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=io.metamask',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    scheme: 'trust://',
    icon: '🛡️',
    iosAppStore: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    scheme: 'rainbow://',
    icon: '🌈',
    iosAppStore: 'https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=me.rainbow',
  },
  {
    id: 'zerion',
    name: 'Zerion',
    scheme: 'zerion://',
    icon: '⚡',
    iosAppStore: 'https://apps.apple.com/app/zerion-wallet-for-web3-defi/id1456732565',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=io.zerion.android',
  },
  {
    id: 'argent',
    name: 'Argent',
    scheme: 'argent://',
    icon: '🔷',
    iosAppStore: 'https://apps.apple.com/app/argent/id1358741926',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=im.argent.contractwalletclient',
  },
  {
    id: 'omni',
    name: 'Omni',
    scheme: 'omni://',
    icon: '🔮',
    iosAppStore: 'https://apps.apple.com/app/omni/id1569808693',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=fi.steakwallet.app',
  },
  {
    id: 'imtoken',
    name: 'imToken',
    scheme: 'imtoken://',
    icon: '💎',
    iosAppStore: 'https://apps.apple.com/app/imtoken2/id1384798940',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=im.token.app',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    scheme: 'cbwallet://',
    icon: '🔵',
    iosAppStore: 'https://apps.apple.com/app/coinbase-wallet-nfts-crypto/id1278383455',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=org.toshi',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    scheme: 'phantom://',
    icon: '👻',
    iosAppStore: 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=app.phantom',
  },
  {
    id: 'ledger',
    name: 'Ledger Live',
    scheme: 'ledgerlive://',
    icon: '🔐',
    iosAppStore: 'https://apps.apple.com/app/ledger-live-crypto-nft-app/id1361671700',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=com.ledger.live',
  },
  {
    id: 'safepal',
    name: 'SafePal',
    scheme: 'safepal://',
    icon: '🔒',
    iosAppStore: 'https://apps.apple.com/app/safepal-wallet/id1548297139',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=io.safepal.wallet',
  },
  {
    id: 'exodus',
    name: 'Exodus',
    scheme: 'exodus://',
    icon: '💫',
    iosAppStore: 'https://apps.apple.com/app/exodus-crypto-bitcoin-wallet/id1414384820',
    androidPlayStore: 'https://play.google.com/store/apps/details?id=exodusmovement.exodus',
  },
];

interface WalletModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectWallet: (wallet: Wallet) => void;
  onShowQRCode: () => void;
}

export default function WalletModal({
  visible,
  onClose,
  onSelectWallet,
  onShowQRCode,
}: WalletModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [walletsWithStatus, setWalletsWithStatus] = useState<Wallet[]>(WALLETS);
  const isDarkMode = useColorScheme() === 'dark';

  React.useEffect(() => {
    if (visible) {
      checkInstalledWallets();
    }
  }, [visible]);

  const checkInstalledWallets = async () => {
    const updatedWallets = await Promise.all(
      WALLETS.map(async wallet => {
        try {
          const installed = await Linking.canOpenURL(wallet.scheme);
          return {...wallet, installed};
        } catch {
          return {...wallet, installed: false};
        }
      })
    );
    setWalletsWithStatus(updatedWallets);
  };

  const filteredWallets = walletsWithStatus.filter(wallet =>
    wallet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const installedWallets = filteredWallets.filter(w => w.installed);
  const notInstalledWallets = filteredWallets.filter(w => !w.installed);

  const renderWalletItem = ({item}: {item: Wallet}) => (
    <TouchableOpacity
      style={[
        styles.walletItem,
        {
          backgroundColor: isDarkMode ? '#2a2a2a' : '#f9f9f9',
          borderColor: isDarkMode ? '#3a3a3a' : '#e5e5e5',
        },
      ]}
      onPress={() => onSelectWallet(item)}>
      <View style={styles.walletInfo}>
        <Text style={styles.walletIcon}>{item.icon}</Text>
        <Text
          style={[styles.walletName, {color: isDarkMode ? '#fff' : '#000'}]}>
          {item.name}
        </Text>
      </View>
      {item.installed ? (
        <View style={styles.installedBadge}>
          <Text style={styles.installedText}>INSTALLED</Text>
        </View>
      ) : (
        <View style={styles.installButton}>
          <Text style={styles.installText}>GET</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
            <TouchableOpacity onPress={onClose} style={styles.helpButton}>
              <Text style={styles.helpIcon}>?</Text>
            </TouchableOpacity>
            <Text
              style={[styles.title, {color: isDarkMode ? '#fff' : '#000'}]}>
              Connect Wallet
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text
                style={[
                  styles.closeIcon,
                  {color: isDarkMode ? '#fff' : '#000'},
                ]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* WalletConnect Option */}
          <TouchableOpacity
            style={[
              styles.walletConnectOption,
              {
                backgroundColor: isDarkMode ? '#2a2a2a' : '#f9f9f9',
                borderColor: isDarkMode ? '#3a3a3a' : '#e5e5e5',
              },
            ]}
            onPress={onShowQRCode}>
            <View style={styles.walletInfo}>
              <View style={styles.wcIconContainer}>
                <Text style={styles.wcIcon}>⟁</Text>
              </View>
              <Text
                style={[
                  styles.walletName,
                  {color: isDarkMode ? '#fff' : '#000'},
                ]}>
                WalletConnect
              </Text>
            </View>
            <Text style={[styles.qrCodeText, {color: '#3b82f6'}]}>
              QR CODE
            </Text>
          </TouchableOpacity>

          {/* Search Input */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: isDarkMode ? '#2a2a2a' : '#f9f9f9',
                borderColor: isDarkMode ? '#3a3a3a' : '#e5e5e5',
              },
            ]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[
                styles.searchInput,
                {color: isDarkMode ? '#fff' : '#000'},
              ]}
              placeholder="Search Wallet"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {filteredWallets.length > 0 && (
              <Text style={[styles.resultCount, {color: '#999'}]}>
                {filteredWallets.length}
              </Text>
            )}
          </View>

          {/* Wallet List */}
          <FlatList
            data={[...installedWallets, ...notInstalledWallets]}
            renderItem={renderWalletItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.walletList}
            showsVerticalScrollIndicator={false}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, {color: '#999'}]}>
              UX by{' '}
              <Text style={styles.reownText}>
                <Text style={{fontSize: 10}}>●</Text> reown
              </Text>
            </Text>
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
    width: '90%',
    maxWidth: 450,
    height: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 15,
  },
  helpButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIcon: {
    fontSize: 16,
    color: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 24,
  },
  walletConnectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  wcIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  wcIcon: {
    fontSize: 24,
    color: '#fff',
  },
  qrCodeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  walletList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '500',
  },
  installedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  installedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22c55e',
  },
  installButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  installText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3b82f6',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
  },
  reownText: {
    fontWeight: '600',
  },
});
