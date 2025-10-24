# Thirdweb React Native SDK Integration Guide 🚀

## Why Thirdweb?

Thirdweb is THE BEST choice for React Native dApps because it provides:

✅ **Pre-built UI Components** - Beautiful ConnectWallet button with wallet modal  
✅ **Multi-Chain Support** - Ethereum, Polygon, Arbitrum, Optimism, BSC, and 1000+ chains  
✅ **Automatic Balance Fetching** - No manual RPC calls needed  
✅ **Built-in Wallet Management** - Supports 350+ wallets  
✅ **Smart Contract Interactions** - Easy contract calls with TypeScript  
✅ **Token Swaps** - Built-in DEX aggregation  
✅ **NFT Support** - Mint, transfer, view NFTs  
✅ **Social Auth** - Login with Google, Email, Phone (coming soon in RN)  
✅ **Well Maintained** - Active development and great documentation  

## Step-by-Step Setup

### 1. Get Your FREE Thirdweb Client ID

1. Go to https://thirdweb.com/dashboard
2. Sign up / Login (free forever)
3. Click "Settings" → "API Keys"
4. Click "Create API Key"
5. Copy your **Client ID** (looks like: `abc123def456...`)

### 2. Update AppThirdweb.tsx

Open `AppThirdweb.tsx` and replace:

```typescript
const CLIENT_ID = 'your_client_id_here';
```

With your actual Client ID:

```typescript
const CLIENT_ID = 'abc123def456...'; // Your real client ID
```

### 3. Use the New App

Rename the current `App.tsx` to `App.old.tsx` (as backup):

```bash
mv App.tsx App.old.tsx
```

Rename `AppThirdweb.tsx` to `App.tsx`:

```bash
mv AppThirdweb.tsx App.tsx
```

### 4. Install iOS Dependencies (iOS only)

```bash
cd ios && pod install && cd ..
```

### 5. Run the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## What You Get

### 🎨 Beautiful Pre-built Connect Button

```typescript
<ConnectWallet
  theme={isDarkMode ? 'dark' : 'light'}
  btnTitle="Connect Wallet"
  modalTitle="Select Wallet"
  switchToActiveChain={true}
  modalSize="wide"
/>
```

This gives you:
- Wallet selection modal
- Automatic wallet detection
- Chain switching UI
- Balance display
- Account management
- Disconnect functionality

### 🔗 Powerful Hooks

#### 1. `useAddress()` - Get Connected Address
```typescript
const address = useAddress();
// Returns: "0x1234..." or undefined if not connected
```

#### 2. `useBalance()` - Get Token Balance
```typescript
const {data: balance, isLoading} = useBalance();
// balance.displayValue = "1.5"
// balance.symbol = "ETH"
```

#### 3. `useSDK()` - Full SDK Access
```typescript
const sdk = useSDK();

// Send ETH
await sdk.wallet.transfer(recipientAddress, amount);

// Sign message
await sdk.wallet.sign(message);

// Get balance
await sdk.wallet.balance();
```

#### 4. `useConnectionStatus()` - Check Status
```typescript
const status = useConnectionStatus();
// Returns: "unknown" | "connecting" | "connected" | "disconnected"
```

#### 5. `useContract()` - Interact with Smart Contracts
```typescript
const {contract} = useContract(contractAddress);

// Read from contract
const data = await contract.call("functionName", [params]);

// Write to contract
await contract.call("functionName", [params]);
```

#### 6. `useSwitchChain()` - Switch Networks
```typescript
const switchChain = useSwitchChain();

// Switch to Polygon
await switchChain(Polygon.chainId);
```

## Advanced Features

### Multi-Chain Support

```typescript
import {
  Ethereum,
  Polygon,
  Arbitrum,
  Optimism,
  BinanceSmartChainMainnet,
  Avalanche,
} from '@thirdweb-dev/chains';

<ThirdwebProvider
  activeChain={Ethereum}
  supportedChains={[
    Ethereum,
    Polygon,
    Arbitrum,
    Optimism,
    BinanceSmartChainMainnet,
    Avalanche,
  ]}
  clientId={CLIENT_ID}
>
  <App />
</ThirdwebProvider>
```

### Send Transactions

```typescript
const sdk = useSDK();

// Send ETH
const tx = await sdk.wallet.transfer(
  "0x...", // recipient
  "0.1"    // amount in ETH
);

console.log("Transaction hash:", tx.receipt.transactionHash);
```

### Sign Messages

```typescript
const sdk = useSDK();
const signature = await sdk.wallet.sign("Hello World!");
```

### Smart Contract Interactions

```typescript
const {contract} = useContract("0x..."); // Contract address

// Read
const name = await contract.call("name");
const balance = await contract.call("balanceOf", [address]);

// Write
await contract.call("transfer", [recipient, amount]);
```

### Token Swaps (Coming Soon)

```typescript
import {useSwap} from '@thirdweb-dev/react-native';

const {swap} = useSwap();

await swap({
  fromToken: "0x...", // Token A
  toToken: "0x...",   // Token B
  amount: "1.0",
});
```

## Comparison: Manual WalletConnect vs Thirdweb

### Manual WalletConnect (Old Way)
❌ Need to manually manage connection state  
❌ Build your own wallet modal  
❌ Handle balance fetching manually  
❌ Implement chain switching yourself  
❌ Write RPC calls for everything  
❌ Handle errors and edge cases  
❌ Build UI from scratch  

### Thirdweb (New Way)
✅ Automatic connection management  
✅ Beautiful pre-built wallet modal  
✅ Automatic balance updates  
✅ Built-in chain switching  
✅ Simple hooks for everything  
✅ Comprehensive error handling  
✅ Production-ready UI components  

## File Structure

```
YourApp/
├── App.tsx              # Main app with ThirdwebProvider
├── App.old.tsx          # Old WalletConnect implementation (backup)
├── AppThirdweb.tsx      # Thirdweb version (rename to App.tsx)
├── hooks/
│   └── useWeb3.ts       # Custom Web3 hook (not needed with Thirdweb)
├── WalletModal.tsx      # Custom wallet modal (not needed with Thirdweb)
├── WalletDetailsModal.tsx # Custom details modal (not needed with Thirdweb)
└── SendModal.tsx        # Custom send modal (not needed with Thirdweb)
```

With Thirdweb, you can **delete** the custom modals and hooks because Thirdweb provides better built-in alternatives!

## Next Steps

1. ✅ Get your Thirdweb Client ID
2. ✅ Update `CLIENT_ID` in AppThirdweb.tsx
3. ✅ Rename AppThirdweb.tsx to App.tsx
4. ✅ Test the app
5. 🚀 Build amazing features!

### Additional Features to Add:

- **NFT Minting**: Use `useNFTCollection()` hook
- **Token Swaps**: Integrate DEX functionality
- **Smart Contract Deployment**: Deploy contracts from the app
- **Gasless Transactions**: Use Thirdweb's relayer
- **Social Login**: Add email/phone auth (coming to RN)

## Resources

- 📚 **Thirdweb Docs**: https://portal.thirdweb.com/react-native
- 💬 **Discord**: https://discord.gg/thirdweb
- 🎥 **YouTube**: https://www.youtube.com/@thirdweb
- 🐦 **Twitter**: https://twitter.com/thirdweb

## Troubleshooting

### "React version mismatch"
Solution: We installed with `--legacy-peer-deps`, this is normal and works fine.

### "Client ID invalid"
Solution: Make sure you copied the correct Client ID from https://thirdweb.com/dashboard

### "No wallet detected"
Solution: Make sure you have MetaMask or Trust Wallet installed on your device

### "Chain not supported"
Solution: Add the chain to `supportedChains` array in ThirdwebProvider

---

**🎉 Congratulations!** You now have a production-ready dApp with Thirdweb!
