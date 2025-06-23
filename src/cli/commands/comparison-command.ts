import { BaseCommand, CommandOptions } from '../base-command';
import { DisplayFormatter } from '../../utils/display-formatter';
import { PokerOutsCalculator } from '../../utils/poker-calculator';

export interface ComparisonOptions extends CommandOptions {
  maxOuts?: number;
  showRule?: boolean;
}

export class ComparisonCommand extends BaseCommand {
  readonly name = 'comparison';
  readonly description = '顯示不同 Outs 數量的機率比較表';
  readonly usage = 'poker comparison [--max-outs <number>] [--show-rule]';

  execute(options: ComparisonOptions = {}, positionalArgs: string[] = []): void {
    const { maxOuts = 10, showRule = true } = options;

    this.log('🃏 德州撲克 Outs 計算器 - Texas Hold\'em Outs Calculator');
    this.log('============================================================\n');
    
    // Display comprehensive outs comparison
    DisplayFormatter.displayOutsComparison(maxOuts);
    
    if (showRule) {
      this.log('\n⚡ Rule of 4 vs 實際計算精確度:');
      this.log('─'.repeat(50));
      
      for (let outs = 1; outs <= maxOuts; outs++) {
        const calc = PokerOutsCalculator.calculateOutsProbability(outs);
        const rule = PokerOutsCalculator.getRuleOfFourAndTwo(outs);
        const error = Math.abs(parseFloat(rule.ruleOfFour) - parseFloat(calc.percentageTotal));
        this.log(`${outs} outs: Rule of 4 = ${rule.ruleOfFour}, 實際 = ${calc.percentageTotal}%, 誤差 = ${error.toFixed(2)}%`);
      }
    }

    this.success(`完成! 所有 1-${maxOuts} Outs 的比較已顯示完畢。`);
    this.info('提示: 使用 poker analysis <outs> 來獲得特定 outs 的詳細分析。');
  }
} 