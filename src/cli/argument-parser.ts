import { CommandOptions } from './base-command';

export interface ParsedCommand {
  commandName: string;
  options: CommandOptions;
  positionalArgs: string[];
  showHelp: boolean;
}

export class ArgumentParser {
  static parse(args: string[]): ParsedCommand {
    const result: ParsedCommand = {
      commandName: '',
      options: {},
      positionalArgs: [],
      showHelp: false
    };

    if (args.length === 0) {
      return result;
    }

    // First argument is the command name
    result.commandName = args[0] ?? '';

    // Check for help flag
    if (args.includes('--help') || args.includes('-h')) {
      result.showHelp = true;
      return result;
    }

    // Parse remaining arguments based on command
    const remainingArgs = args.slice(1);
    
    switch (result.commandName) {
      case 'comparison':
        result.options = this.parseComparisonArgs(remainingArgs);
        break;
      case 'analysis':
        result.options = this.parseAnalysisArgs(remainingArgs);
        break;
      case 'scenarios':
        result.options = this.parseScenariosArgs(remainingArgs);
        break;
      case 'pot-odds':
        result.options = this.parsePotOddsArgs(remainingArgs);
        break;
      case 'simulate':
        const { options, positionalArgs } = this.parseSimulateArgs(remainingArgs);
        result.options = options;
        result.positionalArgs = positionalArgs;
        break;
      case 'import':
        const { options: importOptions, positionalArgs: importArgs } = this.parseImportArgs(remainingArgs);
        result.options = importOptions;
        result.positionalArgs = importArgs;
        break;
      case 'stats':
        result.options = this.parseStatsArgs(remainingArgs);
        break;
      case 'chart':
        result.options = this.parseChartArgs(remainingArgs);
        break;
      default:
        result.options = {};
    }

    return result;
  }

  private static parseComparisonArgs(args: string[]): CommandOptions {
    const options: CommandOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      const currentArg = args[i];
      const nextArg = args[i + 1];
      
      if (currentArg === '--max-outs' && nextArg) {
        options.maxOuts = parseInt(nextArg);
        i++; // Skip next argument
      } else if (currentArg === '--show-rule') {
        options.showRule = true;
      } else if (currentArg === '--no-rule') {
        options.showRule = false;
      }
    }
    
    return options;
  }

  private static parseAnalysisArgs(args: string[]): CommandOptions {
    const options: CommandOptions = {};
    
    if (args.length > 0 && args[0]) {
      options.outs = parseInt(args[0]);
    }
    
    return options;
  }

  private static parseScenariosArgs(args: string[]): CommandOptions {
    const options: CommandOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      const currentArg = args[i];
      const nextArg = args[i + 1];
      
      if (currentArg === '--min-outs' && nextArg) {
        options.minOuts = parseInt(nextArg);
        i++;
      } else if (currentArg === '--max-outs' && nextArg) {
        options.maxOuts = parseInt(nextArg);
        i++;
      }
    }
    
    return options;
  }

  private static parsePotOddsArgs(args: string[]): CommandOptions {
    const options: CommandOptions = {};
    
    if (args.length >= 3 && args[0] && args[1] && args[2]) {
      options.outs = parseInt(args[0]);
      options.potSize = parseFloat(args[1]);
      options.betSize = parseFloat(args[2]);
    }
    
    return options;
  }

  private static parseSimulateArgs(args: string[]): { options: CommandOptions; positionalArgs: string[] } {
    const options: CommandOptions = {};
    const positionalArgs: string[] = [];
    
    for (let i = 0; i < args.length; i++) {
      const currentArg = args[i];
      const nextArg = args[i + 1];
      
      if (currentArg === '--iterations' && nextArg) {
        options.iterations = parseInt(nextArg);
        i++; // Skip next argument
      } else if (currentArg && !currentArg.startsWith('--')) {
        positionalArgs.push(currentArg);
      }
    }
    
    return { options, positionalArgs };
  }

  private static parseImportArgs(args: string[]): { options: CommandOptions; positionalArgs: string[] } {
    const options: CommandOptions = {};
    const positionalArgs: string[] = [];
    
    for (let i = 0; i < args.length; i++) {
      const currentArg = args[i];
      const nextArg = args[i + 1];
      
      if (currentArg === '--database' && nextArg) {
        options.database = nextArg;
        i++; // Skip next argument
      } else if (currentArg === '--validate') {
        options.validate = true;
      } else if (currentArg && !currentArg.startsWith('--')) {
        positionalArgs.push(currentArg);
      }
    }
    
    return { options, positionalArgs };
  }

  private static parseStatsArgs(args: string[]): CommandOptions {
    const options: CommandOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      const currentArg = args[i];
      const nextArg = args[i + 1];
      
      if (currentArg === '--database' && nextArg) {
        options.database = nextArg;
        i++; // Skip next argument
      } else if (currentArg === '--report' && nextArg) {
        options.report = nextArg;
        i++; // Skip next argument
      }
    }
    
    return options;
  }

  private static parseChartArgs(args: string[]): CommandOptions {
    const options: CommandOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      const currentArg = args[i];
      const nextArg = args[i + 1];
      
      if (currentArg === '--database' && nextArg) {
        options.database = nextArg;
        i++; // Skip next argument
      } else if (currentArg === '--type' && nextArg) {
        options.type = nextArg;
        i++; // Skip next argument
      } else if (currentArg === '--output' && nextArg) {
        options.output = nextArg;
        i++; // Skip next argument
      }
    }
    
    return options;
  }
} 