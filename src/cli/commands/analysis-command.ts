import { BaseCommand, CommandOptions } from '../base-command';
import { DisplayFormatter } from '../../utils/display-formatter';

export interface AnalysisOptions extends CommandOptions {
  outs: number;
}

export class AnalysisCommand extends BaseCommand {
  readonly name = 'analysis';
  readonly description = '顯示特定 Outs 數量的詳細分析';
  readonly usage = 'poker analysis <outs>';

  execute(options: AnalysisOptions): void {
    const { outs } = options;

    if (!outs || outs < 1 || outs > 47) {
      this.error('請提供有效的 outs 數量 (1-47)');
      this.showHelp();
      return;
    }

    try {
      DisplayFormatter.displayDetailedAnalysis(outs);
      this.success(`${outs} outs 的詳細分析完成！`);
    } catch (error) {
      this.error(`分析失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }
} 