#!/usr/bin/env node

import { PokerOutsCalculator, DisplayFormatter, PokerScenarios } from '../src/index';

console.log('🎲 簡單使用範例 - Simple Usage Examples\n');

// Example 1: Calculate specific outs
console.log('📊 範例 1: 計算特定 Outs');
console.log('═════════════════════════════');

const flushDrawOuts = 9;
const flushResult = PokerOutsCalculator.calculateOutsProbability(flushDrawOuts);

console.log(`同花聽牌 (${flushDrawOuts} outs):`);
console.log(`• 轉牌機率: ${flushResult.percentageOnTurn}%`);
console.log(`• 河牌機率: ${flushResult.percentageOnRiver}%`);
console.log(`• 總機率: ${flushResult.percentageTotal}%`);
console.log(`• 勝算: ${flushResult.odds}\n`);

// Example 2: Compare Rule of 4 with exact calculation
console.log('⚡ 範例 2: Rule of 4 比較');
console.log('═════════════════════════════');

const outsToTest = [4, 8, 9, 12];
outsToTest.forEach(outs => {
  const exact = PokerOutsCalculator.calculateOutsProbability(outs);
  const rule = PokerOutsCalculator.getRuleOfFourAndTwo(outs);
  const error = Math.abs(parseFloat(rule.ruleOfFour) - parseFloat(exact.percentageTotal));
  
  console.log(`${outs} outs: Rule of 4 = ${rule.ruleOfFour}, 實際 = ${exact.percentageTotal}%, 誤差 = ${error.toFixed(2)}%`);
});

// Example 3: Pot odds decision
console.log('\n💰 範例 3: 底池賠率決策');
console.log('═════════════════════════════');

const scenarios = [
  { outs: 9, pot: 100, bet: 25, description: '同花聽牌, 小額跟注' },
  { outs: 4, pot: 200, bet: 100, description: '內順子聽牌, 大額跟注' },
  { outs: 8, pot: 150, bet: 50, description: '開口順子聽牌, 中等跟注' }
];

scenarios.forEach(scenario => {
  const isProfitable = PokerOutsCalculator.isCallProfitable(scenario.outs, scenario.pot, scenario.bet);
  const potOdds = PokerOutsCalculator.calculatePotOdds(scenario.pot, scenario.bet);
  const winRate = PokerOutsCalculator.calculateOutsProbability(scenario.outs).percentageTotal;
  
  console.log(`${scenario.description}:`);
  console.log(`  勝率: ${winRate}%`);
  console.log(`  底池賠率: ${potOdds}`);
  console.log(`  決策: ${isProfitable ? '✅ 跟注' : '❌ 棄牌'}\n`);
});

// Example 4: Custom calculation function
console.log('🔧 範例 4: 自定義計算');
console.log('═════════════════════════════');

function analyzeDrawingHand(outs: number, handType: string): void {
  const calc = PokerOutsCalculator.calculateOutsProbability(outs);
  
  console.log(`${handType} (${outs} outs):`);
  console.log(`  成功機率: ${calc.percentageTotal}%`);
  console.log(`  失敗機率: ${(100 - parseFloat(calc.percentageTotal)).toFixed(2)}%`);
  console.log(`  賠率: ${calc.odds}`);
  
  if (parseFloat(calc.percentageTotal) > 30) {
    console.log('  評價: 🔥 強勢聽牌');
  } else if (parseFloat(calc.percentageTotal) > 15) {
    console.log('  評價: ⚡ 中等聽牌');
  } else {
    console.log('  評價: 🤔 弱勢聽牌');
  }
  console.log('');
}

analyzeDrawingHand(15, '同花+開口順子聽牌');
analyzeDrawingHand(9, '同花聽牌');
analyzeDrawingHand(4, '內順子聽牌');
analyzeDrawingHand(2, '口袋對子變三條');

// Example 5: Range analysis
console.log('📈 範例 5: 範圍分析');
console.log('═════════════════════════════');

const lowRange = PokerOutsCalculator.calculateOutsRange(5);
const highRange = PokerOutsCalculator.calculateOutsRange(10).slice(5);

console.log('弱牌聽牌 (1-5 outs):');
lowRange.forEach(calc => {
  console.log(`  ${calc.outs} outs: ${calc.percentageTotal}%`);
});

console.log('\n強牌聽牌 (6-10 outs):');
highRange.forEach(calc => {
  console.log(`  ${calc.outs} outs: ${calc.percentageTotal}%`);
});

console.log('\n🎯 範例完成! 你可以修改這些數值來測試不同情況。');
console.log('💡 提示: 在實戰中，還要考慮對手的牌力、位置、籌碼深度等因素。'); 