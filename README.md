# 🃏 Poker Outs Calculator (德州撲克 Outs 計算器)

A TypeScript-based poker outs calculator for Texas Hold'em that provides precise probability calculations and comparisons for outs 1-10.

## ✨ Features

- **Accurate Probability Calculations**: Calculate exact probabilities for hitting outs on turn, river, and combined
- **Comprehensive Comparison**: Compare outs 1-10 with detailed analysis
- **Real Poker Scenarios**: Predefined scenarios like flush draws, straight draws, and more
- **Pot Odds Analysis**: Determine if calls are profitable based on pot odds
- **Rule of 4 and 2**: Compare approximation methods with exact calculations
- **Bilingual Output**: Support for both English and Chinese (Traditional)

## 🚀 Quick Start

### Prerequisites

- Node.js v22.0.0 or higher (v20+ will work but shows warnings)
- npm or yarn

### Installation

```bash
# Clone or download the project
cd poker-outs-calculator

# Install dependencies
npm install

# Build the project
npm run build

# Run the calculator
npm start

# Or run in development mode
npm run dev
```

## 📖 Usage Examples

### Basic Usage

```typescript
import { PokerOutsCalculator } from './src/utils/poker-calculator';

// Calculate probability for 9 outs (flush draw)
const result = PokerOutsCalculator.calculateOutsProbability(9);
console.log(`Turn: ${result.percentageOnTurn}%`);
console.log(`River: ${result.percentageOnRiver}%`);
console.log(`Total: ${result.percentageTotal}%`);
console.log(`Odds: ${result.odds}`);
```

### Compare Multiple Outs

```typescript
import { DisplayFormatter } from './src/utils/display-formatter';

// Display comparison table for outs 1-10
DisplayFormatter.displayOutsComparison(10);

// Detailed analysis for specific outs
DisplayFormatter.displayDetailedAnalysis(9);
```

### Pot Odds Analysis

```typescript
// Analyze if a call is profitable
const isProfitable = PokerOutsCalculator.isCallProfitable(9, 100, 50);
// 9 outs, $100 pot, $50 bet to call

DisplayFormatter.displayPotOddsAnalysis(9, 100, 50);
```

## 🎯 Poker Scenarios Included

1. **Gutshot Straight Draw** (4 outs) - ~8.51%
2. **Two Overcards** (6 outs) - ~12.78%
3. **Open-Ended Straight Draw** (8 outs) - ~16.47%
4. **Flush Draw** (9 outs) - ~19.15%
5. **Flush + Gutshot** (12 outs) - ~26.09%
6. **Flush + Open-Ended Straight** (15 outs) - ~32.61%

## 📊 Output Example

```
🃏 德州撲克 Outs 機率比較表 (1-10)

==========================================================================================
Outs  Turn%   River%  Total%  Rule of 4   Odds Against   Example
==========================================================================================
1     2.13    2.17    4.26    4.0%        22.48:1 against Pocket pair to set
2     4.26    4.35    8.42    8.0%        10.88:1 against Two overcards
3     6.38    6.52    12.49   12.0%       7.01:1 against  Gutshot straight
4     8.51    8.70    16.47   16.0%       5.07:1 against  Two pair to full house
5     10.64   10.87   20.35   20.0%       3.91:1 against  One pair to two pair/trips
6     12.77   13.04   24.14   24.0%       3.14:1 against  Overcards + gutshot
7     14.89   15.22   27.84   28.0%       2.59:1 against  Set to full house/quads
8     17.02   17.39   31.45   32.0%       2.18:1 against  Open-ended straight
9     19.15   19.57   35.00   36.0%       1.86:1 against  Flush draw
10    21.28   21.74   38.48   40.0%       1.60:1 against  Flush draw + gutshot
==========================================================================================
```

## 🔧 API Reference

### PokerOutsCalculator

- `calculateOutsProbability(outs: number): OutsCalculation`
- `calculateOutsRange(maxOuts: number): OutsCalculation[]`
- `getRuleOfFourAndTwo(outs: number): { ruleOfFour: string; ruleOfTwo: string }`
- `calculatePotOdds(potSize: number, betSize: number): string`
- `isCallProfitable(outs: number, potSize: number, betSize: number): boolean`

### DisplayFormatter

- `displayOutsComparison(maxOuts: number): void`
- `displayDetailedAnalysis(outs: number): void`
- `displayScenarioAnalysis(scenarios: PokerScenario[]): void`
- `displayPotOddsAnalysis(outs: number, potSize: number, betSize: number): void`
- `displayQuickReference(): void`

## 🧮 Mathematical Background

The calculator uses precise combinatorial mathematics:

- **Turn Probability**: `outs / 47` (47 unknown cards after flop)
- **River Probability**: `outs / 46` (46 unknown cards after turn)
- **Combined Probability**: `P(turn) + P(miss turn) × P(river)`

### Rule of 4 and 2 Comparison

The calculator compares the popular "Rule of 4 and 2" approximation:
- **Rule of 4**: Multiply outs by 4 for turn + river probability
- **Rule of 2**: Multiply outs by 2 for single card probability

## 📁 Project Structure

```
src/
├── types/
│   └── poker.ts           # TypeScript interfaces and enums
├── utils/
│   ├── poker-calculator.ts # Core calculation logic
│   └── display-formatter.ts # Output formatting
├── scenarios/
│   └── poker-scenarios.ts  # Predefined poker scenarios
└── index.ts              # Main entry point
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Clean build directory
npm run clean
```

## 📝 License

MIT License - feel free to use this calculator for learning, practice, or development.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests for:
- Additional poker scenarios
- UI improvements
- Performance optimizations
- Bug fixes

---

**Note**: This calculator is for educational and analytical purposes. Always play responsibly.

**注意**: 此計算器僅供教育和分析目的。請理性娛樂。 