import { BaseCommand, CommandOptions } from '../base-command';
import { DisplayFormatter } from '../../utils/display-formatter';
import { PokerScenarios } from '../../scenarios/poker-scenarios';

export interface ScenariosOptions extends CommandOptions {
  minOuts?: number;
  maxOuts?: number;
}

export class ScenariosCommand extends BaseCommand {
  readonly name = 'scenarios';
  readonly description = '顯示實戰撲克場景分析';
  readonly usage = 'poker scenarios [--min-outs <number>] [--max-outs <number>]';

  execute(options: ScenariosOptions = {}): void {
    const { minOuts = 1, maxOuts = 10 } = options;

    this.log('🎯 實戰撲克場景分析');
    this.log('============================================================\n');

    const scenarios = PokerScenarios.getStandardScenarios();
    const filteredScenarios = scenarios.filter(s => 
      s.outs >= minOuts && s.outs <= maxOuts
    );

    if (filteredScenarios.length === 0) {
      this.warn(`沒有找到 ${minOuts}-${maxOuts} outs 範圍內的場景`);
      return;
    }

    DisplayFormatter.displayScenarioAnalysis(filteredScenarios);
    
    this.success(`顯示了 ${filteredScenarios.length} 個場景的分析`);
    this.info(`場景範圍: ${minOuts}-${maxOuts} outs`);
  }
} 