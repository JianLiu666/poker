#!/usr/bin/env node

// Core exports for library usage
export { PokerOutsCalculator } from './utils/poker-calculator';
export { DisplayFormatter } from './utils/display-formatter';
export { PokerScenarios } from './scenarios/poker-scenarios';

// Type exports
export * from './types/poker';

// CLI exports
export { PokerCLI } from './cli/cli';
export { BaseCommand } from './cli/base-command';

// PokerCraft analysis exports
export { PokerCraftParser } from './utils/pokercraft-parser';
export { PokerDatabase } from './database/database';

// Simulation exports
export { PokerSimulator } from './utils/poker-simulator';
export { HandParser } from './utils/hand-parser';
export { HandEvaluator } from './utils/hand-evaluator';

// Import CLI for direct execution
import { PokerCLI } from './cli/cli';

/**
 * Simple calculation function for programmatic use
 */
export function calculateCustomOuts(outs: number): void {
  try {
    const { PokerOutsCalculator } = require('./utils/poker-calculator');
    const result = PokerOutsCalculator.calculateOutsProbability(outs);
    console.log(`\n🎲 自定義計算: ${outs} Outs`);
    console.log(`機率: ${result.percentageTotal}%`);
    console.log(`勝算: ${result.odds}\n`);
  } catch (error) {
    console.error(`❌ 錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * Default demo function for when no CLI args are provided
 */
function runDemo(): void {
  console.log('🃏 德州撲克 Outs 計算器 Demo');
  console.log('============================\n');
  console.log('💡 使用 CLI 命令獲得完整功能:');
  console.log('   npm run cli comparison    # 比較表');
  console.log('   npm run cli analysis 9    # 分析 9 outs');
  console.log('   npm run cli reference     # 快速參考\n');
  
  // Run a simple demo
  const cli = new PokerCLI();
  cli.run(['comparison', '--max-outs', '5']);
}

// Run CLI or demo when executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    runDemo();
  } else {
    const cli = new PokerCLI();
    cli.run(args);
  }
} 