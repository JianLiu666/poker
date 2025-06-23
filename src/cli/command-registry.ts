import { BaseCommand } from './base-command';
import { ComparisonCommand } from './commands/comparison-command';
import { AnalysisCommand } from './commands/analysis-command';
import { ScenariosCommand } from './commands/scenarios-command';
import { PotOddsCommand } from './commands/pot-odds-command';
import { ReferenceCommand } from './commands/reference-command';

export class CommandRegistry {
  private commands: Map<string, BaseCommand> = new Map();

  constructor() {
    this.registerCommands();
  }

  private registerCommands(): void {
    const commands = [
      new ComparisonCommand(),
      new AnalysisCommand(),
      new ScenariosCommand(),
      new PotOddsCommand(),
      new ReferenceCommand()
    ];

    commands.forEach(command => {
      this.commands.set(command.name, command);
    });
  }

  getCommand(name: string): BaseCommand | undefined {
    return this.commands.get(name);
  }

  getAllCommands(): BaseCommand[] {
    return Array.from(this.commands.values());
  }

  listCommands(): void {
    console.log('\n🃏 可用命令:\n');
    
    this.getAllCommands().forEach(command => {
      console.log(`  ${command.name.padEnd(12)} - ${command.description}`);
    });
    
    console.log('\n使用 "poker <command> --help" 獲得特定命令的詳細說明\n');
  }
} 