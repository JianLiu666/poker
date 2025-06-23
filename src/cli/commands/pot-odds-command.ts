import { BaseCommand, CommandOptions } from '../base-command';
import { DisplayFormatter } from '../../utils/display-formatter';

export interface PotOddsOptions extends CommandOptions {
  outs: number;
  potSize: number;
  betSize: number;
}

export class PotOddsCommand extends BaseCommand {
  readonly name = 'pot-odds';
  readonly description = '分析底池賠率決策';
  readonly usage = 'poker pot-odds <outs> <pot-size> <bet-size>';

  execute(options: PotOddsOptions): void {
    const { outs, potSize, betSize } = options;

    if (!outs || !potSize || !betSize) {
      this.error('請提供所有必要參數: outs, pot-size, bet-size');
      this.showHelp();
      return;
    }

    if (outs < 1 || outs > 47) {
      this.error('Outs 必須在 1-47 之間');
      return;
    }

    if (potSize <= 0 || betSize <= 0) {
      this.error('底池大小和下注金額必須大於 0');
      return;
    }

    try {
      this.log('🔥 實戰範例: 底池賠率決策分析');
      DisplayFormatter.displayPotOddsAnalysis(outs, potSize, betSize);
      
      this.success('底池賠率分析完成！');
      this.info('根據上述分析做出最佳決策。');
    } catch (error) {
      this.error(`分析失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }
} 