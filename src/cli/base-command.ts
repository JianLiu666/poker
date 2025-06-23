export interface CommandOptions {
  [key: string]: any;
}

export abstract class BaseCommand {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly usage: string;

  abstract execute(options?: CommandOptions): void | Promise<void>;

  protected log(message: string): void {
    console.log(message);
  }

  protected error(message: string): void {
    console.error(`❌ 錯誤: ${message}`);
  }

  protected success(message: string): void {
    console.log(`✅ ${message}`);
  }

  protected warn(message: string): void {
    console.log(`⚠️  ${message}`);
  }

  protected info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  showHelp(): void {
    console.log(`\n📖 ${this.name} - ${this.description}`);
    console.log(`用法: ${this.usage}\n`);
  }
} 