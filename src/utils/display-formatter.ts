import { OutsCalculation, ComparisonResult, PokerScenario } from '../types/poker';
import { PokerOutsCalculator } from './poker-calculator';

export class DisplayFormatter {
  /**
   * Display a comprehensive comparison table of outs 1-10
   */
  static displayOutsComparison(maxOuts: number = 10): void {
    console.log('\n🃏 德州撲克 Outs 機率比較表 (1-10)\n');
    console.log('='.repeat(90));
    console.log(
      'Outs'.padEnd(6) +
      'Turn%'.padEnd(8) +
      'River%'.padEnd(9) +
      'Total%'.padEnd(9) +
      'Rule of 4'.padEnd(12) +
      'Odds Against'.padEnd(18) +
      'Example'
    );
    console.log('='.repeat(90));

    const calculations = PokerOutsCalculator.calculateOutsRange(maxOuts);
    const examples = [
      'Pocket pair to set',
      'Two overcards',
      'Gutshot straight',
      'Two pair to full house',
      'One pair to two pair/trips',
      'Overcards + gutshot',
      'Set to full house/quads',
      'Open-ended straight',
      'Flush draw',
      'Flush draw + gutshot'
    ];

    calculations.forEach((calc, index) => {
      const ruleOfFour = PokerOutsCalculator.getRuleOfFourAndTwo(calc.outs).ruleOfFour;
      const example = examples[index] || 'Complex draw';
      
      console.log(
        calc.outs.toString().padEnd(6) +
        calc.percentageOnTurn.padEnd(8) +
        calc.percentageOnRiver.padEnd(9) +
        calc.percentageTotal.padEnd(9) +
        ruleOfFour.padEnd(12) +
        calc.odds.padEnd(18) +
        example
      );
    });
    
    console.log('='.repeat(90));
    console.log('\n💡 Rule of 4: Multiply outs by 4 for approximate turn + river %');
    console.log('💡 Rule of 2: Multiply outs by 2 for approximate single card %\n');
  }

  /**
   * Display detailed analysis for a specific number of outs
   */
  static displayDetailedAnalysis(outs: number): void {
    const calc = PokerOutsCalculator.calculateOutsProbability(outs);
    const rule = PokerOutsCalculator.getRuleOfFourAndTwo(outs);

    console.log(`\n📊 詳細分析: ${outs} Outs\n`);
    console.log('─'.repeat(50));
    console.log(`轉牌機率 (Turn):        ${calc.percentageOnTurn}%`);
    console.log(`河牌機率 (River):       ${calc.percentageOnRiver}%`);
    console.log(`總機率 (Turn + River):  ${calc.percentageTotal}%`);
    console.log(`勝算比例:               ${calc.odds}`);
    console.log('─'.repeat(50));
    console.log('近似計算法比較:');
    console.log(`Rule of 4 估計:         ${rule.ruleOfFour}`);
    console.log(`Rule of 2 估計:         ${rule.ruleOfTwo}`);
    console.log(`實際計算:               ${calc.percentageTotal}%`);
    console.log(`誤差:                   ${(parseFloat(rule.ruleOfFour) - parseFloat(calc.percentageTotal)).toFixed(2)}%`);
    console.log('─'.repeat(50));
  }

  /**
   * Display scenario-based analysis
   */
  static displayScenarioAnalysis(scenarios: PokerScenario[]): void {
    console.log('\n🎯 實戰情境分析\n');
    
    scenarios.forEach((scenario, index) => {
      const calc = PokerOutsCalculator.calculateOutsProbability(scenario.outs);
      
      console.log(`${index + 1}. ${scenario.name}`);
      console.log(`   描述: ${scenario.description}`);
      console.log(`   目標: ${scenario.targetHand}`);
      console.log(`   Outs: ${scenario.outs} 張`);
      console.log(`   成功機率: ${calc.percentageTotal}% (${calc.odds})`);
      console.log('');
    });
  }

  /**
   * Display pot odds analysis
   */
  static displayPotOddsAnalysis(outs: number, potSize: number, betSize: number): void {
    const calc = PokerOutsCalculator.calculateOutsProbability(outs);
    const potOdds = PokerOutsCalculator.calculatePotOdds(potSize, betSize);
    const isProfitable = PokerOutsCalculator.isCallProfitable(outs, potSize, betSize);
    
    console.log('\n💰 底池賠率分析\n');
    console.log('─'.repeat(40));
    console.log(`Outs:           ${outs}`);
    console.log(`勝率:           ${calc.percentageTotal}%`);
    console.log(`底池大小:       $${potSize}`);
    console.log(`下注金額:       $${betSize}`);
    console.log(`底池賠率:       ${potOdds}`);
    console.log(`決策:           ${isProfitable ? '✅ 值得跟注' : '❌ 應該棄牌'}`);
    console.log('─'.repeat(40));
  }

  /**
   * Display quick reference guide
   */
  static displayQuickReference(): void {
    console.log('\n📖 快速參考指南\n');
    console.log('常見 Outs 情況:');
    console.log('• 2 Outs  - 口袋對子變三條 (~4.3%)');
    console.log('• 4 Outs  - 內順子聽牌 (~8.5%)');
    console.log('• 6 Outs  - 兩張高牌 (~12.8%)');
    console.log('• 8 Outs  - 開口順子聽牌 (~16.5%)');
    console.log('• 9 Outs  - 同花聽牌 (~19.1%)');
    console.log('• 12 Outs - 同花 + 內順子 (~26.1%)');
    console.log('• 15 Outs - 同花 + 開口順子 (~32.6%)');
    console.log('\n計算技巧:');
    console.log('• Rule of 4: Outs × 4 ≈ 轉牌+河牌機率');
    console.log('• Rule of 2: Outs × 2 ≈ 單張牌機率');
    console.log('• 底池賠率 > 勝率賠率 → 跟注有利');
  }
} 