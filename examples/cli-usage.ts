#!/usr/bin/env node

import { 
  PokerCLI, 
  PokerOutsCalculator, 
  DisplayFormatter, 
  calculateCustomOuts 
} from '../src/index';

console.log('🎲 CLI 使用範例 - CLI Usage Examples\n');

// Example 1: Using CLI programmatically
console.log('📊 範例 1: 程式化使用 CLI');
console.log('═══════════════════════════');

const cli = new PokerCLI();

async function runCLIExamples() {
  console.log('\n1. 比較 1-5 outs:');
  await cli.run(['comparison', '--max-outs', '5', '--no-rule']);
  
  console.log('\n2. 分析 9 outs:');
  await cli.run(['analysis', '9']);
  
  console.log('\n3. 底池賠率分析:');
  await cli.run(['pot-odds', '9', '100', '25']);
}

// Example 2: Direct library usage
console.log('\n⚡ 範例 2: 直接使用函式庫');
console.log('═══════════════════════════');

const flushDrawOuts = 9;
const calc = PokerOutsCalculator.calculateOutsProbability(flushDrawOuts);

console.log(`同花聽牌 (${flushDrawOuts} outs):`);
console.log(`• 總機率: ${calc.percentageTotal}%`);
console.log(`• 勝算: ${calc.odds}`);

// Example 3: Using the helper function
console.log('\n🔧 範例 3: 使用輔助函數');
console.log('═══════════════════════════');

calculateCustomOuts(8); // Open-ended straight draw

// Example 4: Batch calculations
console.log('\n📈 範例 4: 批量計算');
console.log('═══════════════════════════');

const commonOuts = [4, 8, 9, 12];
console.log('常見 Outs 機率:');
commonOuts.forEach(outs => {
  const result = PokerOutsCalculator.calculateOutsProbability(outs);
  console.log(`${outs} outs: ${result.percentageTotal}%`);
});

// Example 5: Profitability analysis
console.log('\n💰 範例 5: 獲利性分析');
console.log('═══════════════════════════');

const scenarios = [
  { outs: 9, pot: 100, bet: 20, desc: '強聽牌 + 好賠率' },
  { outs: 4, pot: 50, bet: 30, desc: '弱聽牌 + 差賠率' },
  { outs: 12, pot: 80, bet: 40, desc: '超強聽牌 + 中等賠率' }
];

scenarios.forEach(({ outs, pot, bet, desc }) => {
  const profitable = PokerOutsCalculator.isCallProfitable(outs, pot, bet);
  console.log(`${desc}: ${profitable ? '✅ 有利' : '❌ 不利'}`);
});

// Run the CLI examples
runCLIExamples().then(() => {
  console.log('\n🎯 CLI 範例完成!');
  console.log('💡 提示: 在終端中直接使用 "npm run cli <command>" 來執行命令。');
}); 