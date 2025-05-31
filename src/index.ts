#!/usr/bin/env node

import { PokerOutsCalculator } from './utils/poker-calculator';
import { DisplayFormatter } from './utils/display-formatter';
import { PokerScenarios } from './scenarios/poker-scenarios';

/**
 * Main demonstration function for poker outs calculator
 */
function main(): void {
  console.log('🃏 德州撲克 Outs 計算器 - Texas Hold\'em Outs Calculator');
  console.log('============================================================\n');
  
  // Display comprehensive outs comparison (1-10)
  DisplayFormatter.displayOutsComparison(10);
  
  // Show detailed analysis for specific outs
  DisplayFormatter.displayDetailedAnalysis(9); // Flush draw example
  
  // Display real poker scenarios
  const scenarios = PokerScenarios.getStandardScenarios();
  const filteredScenarios = scenarios.filter(s => s.outs >= 1 && s.outs <= 10);
  DisplayFormatter.displayScenarioAnalysis(filteredScenarios);
  
  // Pot odds analysis example
  console.log('\n🔥 實戰範例: 同花聽牌決策分析');
  DisplayFormatter.displayPotOddsAnalysis(9, 100, 50); // 9 outs, $100 pot, $50 bet
  
  // Quick reference guide
  DisplayFormatter.displayQuickReference();
  
  // Additional calculations for different scenarios
  console.log('\n📈 特殊情況分析\n');
  
  // Compare different outs ranges
  const lowOuts = PokerOutsCalculator.calculateOutsRange(5);
  const highOuts = PokerOutsCalculator.calculateOutsRange(10).slice(5);
  
  console.log('低 Outs 情況 (1-5):');
  lowOuts.forEach(calc => {
    console.log(`${calc.outs} outs: ${calc.percentageTotal}% 機率`);
  });
  
  console.log('\n高 Outs 情況 (6-10):');
  highOuts.forEach(calc => {
    console.log(`${calc.outs} outs: ${calc.percentageTotal}% 機率`);
  });
  
  // Rule of 4 and 2 accuracy analysis
  console.log('\n⚡ Rule of 4 vs 實際計算精確度:');
  console.log('─'.repeat(50));
  for (let outs = 1; outs <= 10; outs++) {
    const calc = PokerOutsCalculator.calculateOutsProbability(outs);
    const rule = PokerOutsCalculator.getRuleOfFourAndTwo(outs);
    const error = Math.abs(parseFloat(rule.ruleOfFour) - parseFloat(calc.percentageTotal));
    console.log(`${outs} outs: Rule of 4 = ${rule.ruleOfFour}, 實際 = ${calc.percentageTotal}%, 誤差 = ${error.toFixed(2)}%`);
  }
  
  console.log('\n🎯 完成! 所有 1-10 Outs 的比較已顯示完畢。');
  console.log('💡 提示: 修改此程式以計算特定情況或新增自定義場景。\n');
}

/**
 * Interactive calculation function for custom scenarios
 */
function calculateCustomOuts(outs: number): void {
  try {
    const result = PokerOutsCalculator.calculateOutsProbability(outs);
    console.log(`\n🎲 自定義計算: ${outs} Outs`);
    console.log(`機率: ${result.percentageTotal}%`);
    console.log(`勝算: ${result.odds}\n`);
  } catch (error) {
    console.error(`❌ 錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

// Export functions for external use
export { PokerOutsCalculator, DisplayFormatter, PokerScenarios, calculateCustomOuts };

// Run main function if this file is executed directly
if (require.main === module) {
  main();
} 