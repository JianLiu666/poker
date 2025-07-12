import { BaseCommand, CommandOptions } from '../base-command';
import { PokerCraftParser } from '../../utils/pokercraft-parser';
import { PokerDatabase } from '../../database/database';
import * as fs from 'fs-extra';
import * as path from 'path';

export class ImportCommand extends BaseCommand {
  readonly name = 'import';
  readonly description = '導入 PokerCraft 日誌文件到數據庫';
  readonly usage = 'poker import <file-path> [options]';

  async execute(options: CommandOptions, args: string[]): Promise<void> {
    if (args.length === 0) {
      console.error('❌ 請提供日誌文件路徑');
      this.showHelp();
      return;
    }

    const filePath = args[0]!;
    const dbPath = options.database || './poker_data.db';
    const validateOnly = options.validate || false;

    try {
      // 檢查文件是否存在
      if (!(await fs.pathExists(filePath))) {
        console.error(`❌ 文件不存在: ${filePath}`);
        return;
      }

      console.log(`🔍 開始解析日誌文件: ${filePath}`);
      
      // 解析日誌文件
      const hands = await PokerCraftParser.parseLogFile(filePath);
      console.log(`✅ 解析完成，共發現 ${hands.length} 手牌`);

      if (hands.length === 0) {
        console.warn('⚠️  沒有找到有效的手牌數據');
        return;
      }

      // 驗證解析結果
      const validHands = hands.filter(hand => PokerCraftParser.validateHand(hand));
      const invalidCount = hands.length - validHands.length;
      
      if (invalidCount > 0) {
        console.warn(`⚠️  發現 ${invalidCount} 手無效手牌，已跳過`);
      }

      console.log(`📊 有效手牌數: ${validHands.length}`);

      // 如果只是驗證模式，不進行數據庫操作
      if (validateOnly) {
        console.log('✅ 驗證模式完成，未導入數據庫');
        this.displayParseStatistics(validHands);
        return;
      }

      // 初始化數據庫
      const database = new PokerDatabase(dbPath);
      await database.initialize();
      await database.initializeSchema();

      // 檢查現有數據
      const existingCount = await database.getHandCount();
      console.log(`📈 數據庫現有手牌數: ${existingCount}`);

      // 導入數據
      console.log('📥 開始導入數據到數據庫...');
      await database.insertHands(validHands);

      // 顯示最終統計
      const finalCount = await database.getHandCount();
      console.log(`✅ 導入完成！數據庫總手牌數: ${finalCount}`);
      console.log(`📊 本次導入: ${finalCount - existingCount} 手牌`);

      // 顯示基本統計
      await this.displayDatabaseStats(database);

      await database.close();

    } catch (error) {
      console.error(`❌ 導入失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      process.exit(1);
    }
  }

  /**
   * 顯示解析統計信息
   */
  private displayParseStatistics(hands: any[]): void {
    console.log('\n📊 解析統計信息:');
    console.log('═'.repeat(50));

    // 按遊戲類型統計
    const gameTypes = hands.reduce((acc, hand) => {
      acc[hand.gameType] = (acc[hand.gameType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('遊戲類型分布:');
    Object.entries(gameTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} 手`);
    });

    // 按注額統計
    const stakes = hands.reduce((acc, hand) => {
      acc[hand.stakes] = (acc[hand.stakes] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n注額分布:');
    Object.entries(stakes).forEach(([stake, count]) => {
      console.log(`  ${stake}: ${count} 手`);
    });

    // 時間範圍
    const timestamps = hands.map(hand => hand.timestamp).sort();
    if (timestamps.length > 0) {
      console.log('\n時間範圍:');
      console.log(`  從: ${timestamps[0]!.toLocaleString()}`);
      console.log(`  到: ${timestamps[timestamps.length - 1]!.toLocaleString()}`);
    }

    console.log('═'.repeat(50));
  }

  /**
   * 顯示數據庫統計信息
   */
  private async displayDatabaseStats(database: PokerDatabase): Promise<void> {
    console.log('\n📊 數據庫統計信息:');
    console.log('═'.repeat(50));

    try {
      const stats = await database.getGameStats();
      console.log(`總手牌數: ${stats.totalHands}`);
      console.log(`獲勝手牌: ${stats.totalWon}`);
      console.log(`失敗手牌: ${stats.totalLost}`);
      console.log(`淨收益: $${stats.netWinnings.toFixed(2)}`);
      console.log(`勝率: ${stats.winRate.toFixed(2)}%`);
      console.log(`BB/100: ${stats.bb100.toFixed(2)}`);

      // 顯示最近幾次會話
      const sessions = await database.getSessionStats();
      if (sessions.length > 0) {
        console.log('\n最近會話:');
        sessions.slice(0, 5).forEach(session => {
          console.log(`  ${session.date}: ${session.hands} 手, $${session.winnings.toFixed(2)}, BB/100: ${session.bb100.toFixed(2)}`);
        });
      }

    } catch (error) {
      console.warn(`⚠️  無法獲取統計信息: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }

    console.log('═'.repeat(50));
  }

  showHelp(): void {
    console.log(`
🃏 ${this.description}

用法: ${this.usage}

參數:
  <file-path>           PokerCraft 日誌文件路徑

選項:
  --database <path>     指定數據庫文件路徑 (預設: ./poker_data.db)
  --validate           只驗證文件格式，不導入數據庫
  --help               顯示此幫助信息

範例:
  poker import hands.txt
  poker import hands.txt --database ./my_poker.db
  poker import hands.txt --validate
  poker import /path/to/pokercraft/export.txt --database ./nl10_data.db

支援的日誌格式:
  - PokerCraft 導出的 Natural8 Rush & Cash 日誌
  - 標準 PokerStars 手牌歷史格式
    `);
  }
} 