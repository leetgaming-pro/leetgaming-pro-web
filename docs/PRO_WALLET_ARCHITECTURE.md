# Pro Wallet Architecture - Award-Winning Player Wallet

## Overview

The LeetGaming Pro Wallet is the **industry-leading gaming wallet** designed specifically for competitive esports players. Whether you're a casual gamer earning your first prize or a professional managing high-value tournament winnings, we've built a wallet that grows with you.

### Why LeetGaming Wallet?

- **🎮 Built for Gamers**: Every feature designed around competitive gaming workflows
- **🔐 Bank-Grade Security**: MPC technology trusted by institutional crypto custodians
- **⚡ Zero Gas Fees**: We sponsor your transactions so you keep 100% of your winnings
- **🌐 Multi-Chain**: Polygon, Base, Arbitrum, Solana - play anywhere, earn everywhere
- **📊 Tax-Ready**: Automatic tracking and export for tax compliance

---

## Wallet Types

### 1. 💚 Leet Wallet (Custodial)

**Perfect For**: New players, casual gamers, anyone who wants simplicity

> _"Just want to play and get paid? This is for you."_

| Feature        | Description                                      |
| -------------- | ------------------------------------------------ |
| Key Management | Platform holds keys in secure HSM vaults         |
| Recovery       | Password reset via email + phone 2FA             |
| Transactions   | Instant, gasless, no blockchain knowledge needed |
| Limits         | $500/day (Basic KYC), $5,000/day (Verified)      |
| Protection     | Platform insurance, fraud monitoring             |

**Best For**:

- ✅ Players new to crypto
- ✅ Quick deposits from debit cards
- ✅ Automatic prize claiming
- ✅ Simple password recovery

### 2. 💎 Leet Wallet Pro (MPC - Recommended)

**Perfect For**: Tournament players, semi-pros, anyone who takes security seriously

> _"The security of self-custody with the convenience of a managed wallet."_

| Feature            | Description                                           |
| ------------------ | ----------------------------------------------------- |
| Key Management     | 2-of-3 MPC threshold signing (you always hold 1 key)  |
| Shard Distribution | Your Device + LeetGaming HSM + Recovery Service       |
| Recovery           | Social recovery (trusted contacts) + encrypted backup |
| Transactions       | Biometric approval on device, gasless sponsored       |
| Limits             | Fully customizable, up to $50,000/day                 |

**MPC Signing Protocols**:

- **GG20**: Battle-tested threshold ECDSA (Ethereum, Polygon, Base)
- **CMP**: Communication-optimized variant (faster signing)
- **FROST**: Schnorr threshold signatures (Solana-native)

**Best For**:

- ✅ Tournament players with significant winnings
- ✅ Users who want key control without complexity
- ✅ Hardware wallet users (Ledger as a shard)
- ✅ Teams managing shared wallets

### 3. 🦊 DeFi Wallet (Non-Custodial)

**Perfect For**: Crypto natives, DeFi enthusiasts, privacy-focused players

> _"Not your keys, not your crypto. We get it."_

| Feature           | Description                                      |
| ----------------- | ------------------------------------------------ |
| Key Management    | You hold all keys in your own wallet             |
| Wallet Connection | MetaMask, Phantom, WalletConnect, Ledger, Trezor |
| Recovery          | Your responsibility (seed phrase backup)         |
| Transactions      | You pay network gas fees                         |
| Limits            | None - full control                              |

**Best For**:

- ✅ Existing crypto wallet users
- ✅ Privacy maximalists
- ✅ Hardware wallet enthusiasts
- ✅ Users who want DeFi composability

---

## Core Components Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRO WALLET DASHBOARD                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   OVERVIEW   │  │   SECURITY   │  │  ANALYTICS   │          │
│  │   Dashboard  │  │    Center    │  │  Dashboard   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   ESCROW     │  │ TRANSACTION  │  │   SETTINGS   │          │
│  │   Matches    │  │   History    │  │    Panel     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                     WALLET CORE SERVICES                        │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  MPC Signing  │  Chain Manager  │  Balance Tracker         ││
│  ├────────────────────────────────────────────────────────────┤│
│  │  Key Shards   │  Gas Optimizer  │  Price Oracle            ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Comparison Matrix

| Feature                  | 💚 Leet Wallet      | 💎 Leet Wallet Pro   | 🦊 DeFi Wallet      |
| ------------------------ | ------------------- | -------------------- | ------------------- |
| **Onboarding**           | 1 minute            | 2-3 minutes          | Connect existing    |
| **Gas Fees**             | ✅ Zero (sponsored) | ✅ Zero (sponsored)  | ❌ User pays        |
| **Instant Transactions** | ✅ Always           | ✅ Always            | ❌ Blockchain speed |
| **Password Recovery**    | ✅ Email + Phone    | ❌                   | ❌                  |
| **Social Recovery**      | ❌                  | ✅ Trusted contacts  | ❌                  |
| **Hardware Wallet**      | ❌                  | ✅ As MPC shard      | ✅ Native           |
| **MPC Signing**          | ❌                  | ✅ 2-of-3 threshold  | ❌                  |
| **Multi-Sig**            | ❌                  | ✅ Built-in          | ✅ External         |
| **Emergency Freeze**     | ✅ Platform         | ✅ Requires 2 shards | ❌                  |
| **Withdrawal Whitelist** | ✅                  | ✅                   | ❌                  |
| **Auto-Claim Prizes**    | ✅                  | ✅                   | ❌ Manual           |
| **Tax Reports**          | ✅                  | ✅                   | ✅                  |
| **API Access**           | ❌                  | ✅                   | ✅                  |
| **Daily Limits**         | $500 / $5,000       | Up to $50,000        | Unlimited           |
| **Security Score**       | 70%                 | 92%                  | 98%                 |

### Which Wallet is Right for You?

```
┌─────────────────────────────────────────────────────────────────┐
│                    WALLET SELECTION GUIDE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  "I'm new to crypto"              → 💚 Leet Wallet              │
│  "I play tournaments"             → 💎 Leet Wallet Pro ⭐       │
│  "I have MetaMask/Phantom"        → 🦊 DeFi Wallet              │
│  "I want the best security"       → 💎 Leet Wallet Pro ⭐       │
│  "I manage large winnings"        → 💎 Leet Wallet Pro ⭐       │
│  "I want full control"            → 🦊 DeFi Wallet              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Tiers

### 🟡 Tier 1: Starter (Score 0-50)

- Email verification
- Password protection
- Basic limits ($100/day)
- **Upgrade tip**: Add phone 2FA to unlock more features

### 🟠 Tier 2: Enhanced (Score 51-75)

- ✅ 2FA enabled (TOTP or SMS)
- ✅ Phone verification
- ✅ Withdrawal whitelist
- Medium limits ($1,000/day)
- **Upgrade tip**: Upgrade to Leet Wallet Pro for MPC security

### 🟢 Tier 3: Tournament Grade (Score 76-100)

- ✅ Hardware key / Passkey / Biometric
- ✅ Leet Wallet Pro (MPC enabled)
- ✅ Trusted devices only
- ✅ Social recovery configured
- High limits ($10,000+/day)
- **This is where pros play**

---

## Dashboard Components

### 1. 📊 Overview Dashboard

- **Total Balance**: Aggregated across all chains (real-time USD value)
- **Escrow Status**: Funds locked in active matches
- **Available Balance**: Ready to play or withdraw
- **Activity Feed**: Last 10 transactions with one-click details
- **Quick Actions**: Deposit, Withdraw, Find Match buttons

### 2. 🔐 Security Center

- **Security Score**: Visual ring with breakdown
- **MPC Key Shards**: Status of each shard (device, platform, recovery)
- **Trusted Devices**: Manage devices with one-click revoke
- **Active Sessions**: See where you're logged in
- **Security Recommendations**: AI-powered tips
- **Audit Log**: Complete history of security events

### 3. 📈 Analytics Dashboard

- **Earnings Chart**: Interactive timeline with zoom
- **Win Rate**: Overall and per-game statistics
- **ROI Analysis**: Entry fees vs prizes breakdown
- **Game Performance**: Which games are most profitable
- **Tax Export**: Download IRS-ready reports (CSV, PDF)

### 4. 🎮 Escrow Management

- **Active Matches**: Real-time escrow status
- **Prize Claims**: One-click claim with gas sponsorship
- **Match History**: Full history with blockchain proofs
- **Refund Tracker**: Status of any refunds
- **Dispute Center**: Submit and track disputes

### 5. Transaction Center

- Pending transactions
- Transaction history
- Batch operations
- Scheduled withdrawals
- Failed transaction recovery

### 6. Settings Panel

- Wallet type management
- Chain preferences
- Notification settings
- Spending limits
- Withdrawal rules
- API key management

---

## MPC Implementation Details

### Key Generation Ceremony

1. User initiates wallet creation
2. Platform generates dealer-free key shares
3. User device receives encrypted shard
4. Platform stores its shard in HSM
5. Recovery shard sent to trusted service
6. User backs up recovery codes

### Signing Flow

```
User Action → Platform Validates → MPC Signing Ceremony
     ↓              ↓                      ↓
Device Shard → Platform Shard → Signature Aggregation
     ↓              ↓                      ↓
   (local)       (HSM)              (threshold met)
                                          ↓
                                   Broadcast TX
```

### Recovery Scenarios

| Scenario              | Solution                   |
| --------------------- | -------------------------- |
| Lost device           | Platform + Recovery shards |
| Platform compromised  | User + Recovery shards     |
| Recovery service down | User + Platform shards     |
| 2 of 3 lost           | Cannot recover (by design) |

---

## Integration Points

### Blockchain Networks

- **EVM**: Ethereum, Polygon, Base, Arbitrum, Optimism
- **Solana**: Mainnet, with Switchboard VRF
- **Future**: Aptos, Sui, TON

### External Wallets (DeFi Wallet)

- MetaMask / Injected providers
- WalletConnect v2
- Coinbase Wallet
- Phantom (Solana)
- Ledger Live
- Trezor Suite

### Payment Rails

- Crypto deposits (native)
- Fiat on-ramp (MoonPay, Transak)
- Fiat off-ramp (to bank)
- Stablecoin swaps

---

## Compliance & Safety

### KYC Levels

| Level    | Verification | Limits      |
| -------- | ------------ | ----------- |
| None     | Email only   | $100/day    |
| Basic    | Phone + ID   | $1,000/day  |
| Verified | Full KYC     | $10,000/day |
| Premium  | Enhanced DD  | Unlimited   |

### Risk Management

- Velocity checks on withdrawals
- Suspicious activity monitoring
- Cooling-off periods for new addresses
- Geographic restrictions
- OFAC/sanctions screening

---

## File Structure

```
leetgaming-pro-web/
├── app/
│   └── wallet/
│       └── pro/
│           ├── page.tsx              # Main dashboard
│           ├── security/
│           │   └── page.tsx          # Security center
│           ├── analytics/
│           │   └── page.tsx          # Analytics dashboard
│           ├── transactions/
│           │   └── page.tsx          # Transaction history
│           ├── escrow/
│           │   └── page.tsx          # Escrow management
│           └── settings/
│               └── page.tsx          # Wallet settings
├── components/
│   └── wallet/
│       ├── escrow/                   # Escrow components
│       ├── security/                 # Security components
│       ├── analytics/                # Analytics components
│       ├── transactions/             # Transaction components
│       └── onboarding/               # Wallet setup flow
├── hooks/
│   ├── use-escrow-wallet.ts          # Main wallet hook
│   ├── use-mpc-signing.ts            # MPC signing hook
│   ├── use-wallet-analytics.ts       # Analytics hook
│   └── use-wallet-security.ts        # Security hook
└── types/
    └── replay-api/
        └── escrow-wallet.types.ts    # Wallet types
```

---

## Implementation Phases

### Phase 1: Foundation ✅

- [x] Core wallet types
- [x] Escrow match card
- [x] Chain selector
- [x] Basic security card
- [x] History panel
- [x] Wallet hook
- [x] Onboarding flow

### Phase 2: Security Center (Current)

- [ ] Security dashboard
- [ ] Device management
- [ ] Session management
- [ ] MPC key rotation
- [ ] Emergency controls

### Phase 3: Analytics

- [ ] Earnings charts
- [ ] Performance metrics
- [ ] Tax reporting
- [ ] Export functionality

### Phase 4: Advanced Features

- [ ] Multi-wallet support
- [ ] API access
- [ ] Webhooks
- [ ] Mobile app sync

---

## Success Metrics

- **Security**: Zero successful unauthorized withdrawals
- **Reliability**: 99.99% uptime for signing service
- **Speed**: <2s average signing time
- **Adoption**: 80%+ users on MPC wallet
- **Satisfaction**: 4.8+ star rating
