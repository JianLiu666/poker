#!/usr/bin/env node

import { CommandRegistry } from './command-registry';
import { ArgumentParser } from './argument-parser';

export class PokerCLI {
  private registry: CommandRegistry;

  constructor() {
    this.registry = new CommandRegistry();
  }

  async run(args: string[]): Promise<void> {
    try {
      if (args.length === 0) {
        this.showDefaultHelp();
        return;
      }

      const parsed = ArgumentParser.parse(args);

      if (!parsed.commandName) {
        this.showDefaultHelp();
        return;
      }

      const command = this.registry.getCommand(parsed.commandName);

      if (!command) {
        console.error(`❌ 未知命令: ${parsed.commandName}`);
        this.registry.listCommands();
        return;
      }

      if (parsed.showHelp) {
        command.showHelp();
        return;
      }

      await command.execute(parsed.options, parsed.positionalArgs);
    } catch (error) {
      console.error(`❌ 執行錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
      process.exit(1);
    }
  }

  private showDefaultHelp(): void {
    console.log('\n🃏 德州撲克 Outs 計算器 - Texas Hold\'em Outs Calculator');
    console.log('============================================================');
    console.log('\n一個功能強大的撲克 outs 機率計算工具\n');
    
    this.registry.listCommands();
    
    console.log('範例:');
    console.log('  poker comparison --max-outs 15    # 顯示 1-15 outs 的比較');
    console.log('  poker analysis 9                  # 分析 9 outs 的詳細資訊');
    console.log('  poker pot-odds 9 100 50           # 分析底池賠率 (9 outs, $100 pot, $50 bet)');
    console.log('  poker scenarios --min-outs 8      # 顯示 8+ outs 的場景');
    console.log('  poker simulate AKs QQ 1000000     # 模擬AK同花 vs QQ對子的勝率');
    console.log('  poker reference                   # 顯示快速參考指南\n');
  }
}

// Main execution when run directly
if (require.main === module) {
  const cli = new PokerCLI();
  const args = process.argv.slice(2); // Remove 'node' and script name
  cli.run(args);
} 