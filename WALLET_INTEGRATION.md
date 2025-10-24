# Wallet Integration Guide

## Overview
This app now includes a custom wallet selection modal that provides a seamless experience for connecting crypto wallets, similar to the Reown/WalletConnect interface.

## Features

### 1. **Custom Wallet Modal**
- Beautiful, modern UI matching the Reown design
- Shows all popular crypto wallets
- Automatically detects which wallets are installed
- Search functionality to quickly find wallets

### 2. **Smart Wallet Detection**
- Checks if wallet apps are installed on the device
- Shows "INSTALLED" badge for apps that are already on the device
- Shows "GET" button for apps that need to be installed

### 3. **Automatic App Store Redirect**
- If user selects a wallet that's not installed, they're prompted to install it
- Automatically redirects to:
  - **iOS**: App Store
  - **Android**: Google Play Store
- After installation, user can return and complete the connection

### 4. **Connection Flow**

#### When wallet IS installed:
1. User clicks "Connect Wallet"
2. Modal opens showing all available wallets
3. User selects their installed wallet
4. Wallet app opens automatically
5. User approves the connection in their wallet
6. Connection complete!

#### When wallet is NOT installed:
1. User clicks "Connect Wallet"
2. Modal opens showing all available wallets
3. User selects a wallet (shows "GET" button)
4. Alert asks if they want to install
5. Redirects to App Store/Play Store
6. User installs the wallet
7. User returns to the app and clicks "Connect Wallet" again
8. Now the wallet shows as "INSTALLED"
9. Connection proceeds normally

## Supported Wallets

The modal includes 12 popular wallets:

1. **MetaMask** 🦊 - Most popular Ethereum wallet
2. **Trust Wallet** 🛡️ - Multi-chain wallet by Binance
3. **Rainbow** 🌈 - User-friendly Ethereum wallet
4. **Zerion** ⚡ - DeFi portfolio tracker & wallet
5. **Argent** 🔷 - Smart contract wallet
6. **Omni** 🔮 - Multi-chain wallet
7. **imToken** 💎 - Asian market leader
8. **Coinbase Wallet** 🔵 - By Coinbase exchange
9. **Phantom** 👻 - Popular Solana wallet (also supports Ethereum)
10. **Ledger Live** 🔐 - Hardware wallet companion
11. **SafePal** 🔒 - Hardware & software wallet
12. **Exodus** 💫 - Multi-asset wallet

## Technical Implementation

### Files Added:
- `WalletModal.tsx` - Custom wallet selection modal component

### Files Modified:
- `App.tsx` - Integrated the wallet modal
- `ios/WalletConnectTestApp/Info.plist` - Added LSApplicationQueriesSchemes for wallet detection
- `android/app/src/main/AndroidManifest.xml` - Added queries for wallet app detection

### How It Works:

1. **Wallet Detection**: Uses `Linking.canOpenURL()` to check if wallet apps are installed
2. **Deep Linking**: Opens wallet apps using their custom URL schemes (e.g., `metamask://`, `trust://`)
3. **Store Redirect**: If wallet not found, opens App Store/Play Store with direct link to wallet app
4. **WalletConnect Protocol**: Uses WalletConnect v2 for secure wallet connection

## Testing

### To test on iOS:
```bash
npm run ios
# or
yarn ios
```

### To test on Android:
```bash
npm run android
# or
yarn android
```

### Testing the flow:

1. **Without any wallet installed**:
   - Click "Connect Wallet"
   - Try selecting any wallet
   - Should show install prompt
   - Should redirect to App Store/Play Store

2. **With MetaMask installed**:
   - Install MetaMask from App Store/Play Store first
   - Click "Connect Wallet"
   - MetaMask should show "INSTALLED" badge
   - Select MetaMask
   - MetaMask app should open
   - Approve the connection
   - Should return to app with successful connection

3. **Search functionality**:
   - Click "Connect Wallet"
   - Type in search box (e.g., "meta")
   - Should filter to only show matching wallets
   - Shows count of matching wallets

## QR Code Option

The modal also includes a "WalletConnect" option at the top that shows a QR code. This is useful for:
- Desktop wallet apps
- Hardware wallets
- Advanced users who prefer QR scanning

## Customization

### Adding More Wallets:

Edit `WalletModal.tsx` and add to the `WALLETS` array:

```typescript
{
  id: 'newwallet',
  name: 'New Wallet',
  scheme: 'newwallet://',
  icon: '🔥',
  iosAppStore: 'https://apps.apple.com/app/...',
  androidPlayStore: 'https://play.google.com/store/apps/details?id=...',
}
```

Don't forget to add the scheme to:
- `ios/WalletConnectTestApp/Info.plist` (LSApplicationQueriesSchemes)
- `android/app/src/main/AndroidManifest.xml` (queries)

### Styling:

The modal uses React Native StyleSheet. Edit the `styles` object in `WalletModal.tsx` to customize colors, sizes, spacing, etc.

## Known Issues & Limitations

1. **iOS Limitation**: iOS only allows checking for up to 50 URL schemes in `Info.plist`
2. **Android 11+**: Requires `<queries>` in manifest to detect app installation
3. **Deep Linking**: Some wallets may have different deep link formats
4. **QR Code**: Currently shows as Alert, could be enhanced with actual QR code image

## Future Enhancements

- [ ] Display actual QR code instead of text
- [ ] Add wallet logos from CDN instead of emojis
- [ ] Support for WalletConnect Cloud for better wallet list
- [ ] Add "Recently Used" section
- [ ] Remember last used wallet
- [ ] Support for custom RPC networks
- [ ] Add wallet rankings/recommendations
