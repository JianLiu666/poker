import { BaseCommand, CommandOptions } from '../base-command';
import { DisplayFormatter } from '../../utils/display-formatter';

export class ReferenceCommand extends BaseCommand {
  readonly name = 'reference';
  readonly description = '顯示快速參考指南';
  readonly usage = 'poker reference';

  execute(_options?: CommandOptions, positionalArgs: string[] = []): void {
    this.log('📖 德州撲克 Outs 快速參考');
    this.log('============================================================\n');
    
    DisplayFormatter.displayQuickReference();
    
    this.success('快速參考指南顯示完成！');
    this.info('使用其他命令獲得更詳細的分析。');
  }
} 