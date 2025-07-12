import { BaseCommand, CommandOptions } from '../base-command';
import { PokerDatabase } from '../../database/database';

export class StatsCommand extends BaseCommand {
  readonly name = 'stats';
  readonly description = '顯示遊戲統計和分析報告';
  readonly usage = 'poker stats [options]';

  async execute(options: CommandOptions, args: string[]): Promise<void> {
    const dbPath = options.database || './poker_data.db';
    const reportType = options.report || 'overview';

    try {
      const database = new PokerDatabase(dbPath);
      await database.initialize();

      const handCount = await database.getHandCount();
      if (handCount === 0) {
        console.log('❌ 數據庫中沒有手牌數據。請先使用 import 命令導入數據。');
        return;
      }

      console.log(`📊 撲克統計報告 (${handCount} 手牌)`);
      console.log('═'.repeat(60));

      switch (reportType) {
        case 'overview':
          await this.showOverviewReport(database);
          break;
        case 'sessions':
          await this.showSessionsReport(database);
          break;
        case 'positions':
          await this.showPositionsReport(database);
          break;
        case 'all':
          await this.showOverviewReport(database);
          await this.showSessionsReport(database);
          await this.showPositionsReport(database);
          break;
        default:
          console.error(`❌ 未知的報告類型: ${reportType}`);
          this.showHelp();
      }

      await database.close();

    } catch (error) {
      console.error(`❌ 統計分析失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      process.exit(1);
    }
  }

  /**
   * 顯示總覽報告
   */
  private async showOverviewReport(database: PokerDatabase): Promise<void> {
    console.log('\n🎯 總覽統計:');
    console.log('─'.repeat(40));

    const stats = await database.getGameStats();
    
    console.log(`總手牌數: ${stats.totalHands.toLocaleString()}`);
    console.log(`獲勝手牌: ${stats.totalWon.toLocaleString()} (${stats.winRate.toFixed(2)}%)`);
    console.log(`失敗手牌: ${stats.totalLost.toLocaleString()}`);
    console.log(`淨收益: $${stats.netWinnings.toFixed(2)}`);
    console.log(`BB/100: ${stats.bb100.toFixed(2)}`);

    // 顯示顏色編碼的收益狀態
    const profitStatus = stats.netWinnings > 0 ? '🟢 盈利' : 
                        stats.netWinnings < 0 ? '🔴 虧損' : '🟡 平衡';
    console.log(`收益狀態: ${profitStatus}`);

    // 計算每手平均收益
    const avgPerHand = stats.totalHands > 0 ? stats.netWinnings / stats.totalHands : 0;
    console.log(`每手平均: $${avgPerHand.toFixed(4)}`);
  }

  /**
   * 顯示會話報告
   */
  private async showSessionsReport(database: PokerDatabase): Promise<void> {
    console.log('\n📅 會話統計:');
    console.log('─'.repeat(40));

    const sessions = await database.getSessionStats();
    
    if (sessions.length === 0) {
      console.log('沒有會話數據');
      return;
    }

    console.log('最近 10 次會話:');
    console.log('日期        手牌數  收益      BB/100');
    console.log('─'.repeat(40));

    sessions.slice(0, 10).forEach(session => {
      const profitColor = session.winnings > 0 ? '🟢' : 
                         session.winnings < 0 ? '🔴' : '🟡';
      console.log(
        `${session.date.padEnd(10)} ${session.hands.toString().padStart(6)} ` +
        `${profitColor}$${session.winnings.toFixed(2).padStart(8)} ` +
        `${session.bb100.toFixed(2).padStart(6)}`
      );
    });

    // 會話統計總結
    const totalSessions = sessions.length;
    const profitableSessions = sessions.filter(s => s.winnings > 0).length;
    const winningRate = (profitableSessions / totalSessions) * 100;
    
    console.log('─'.repeat(40));
    console.log(`總會話數: ${totalSessions}`);
    console.log(`盈利會話: ${profitableSessions} (${winningRate.toFixed(2)}%)`);
    
    const avgSessionWinnings = sessions.reduce((sum, s) => sum + s.winnings, 0) / totalSessions;
    console.log(`平均會話收益: $${avgSessionWinnings.toFixed(2)}`);
  }

  /**
   * 顯示位置報告
   */
  private async showPositionsReport(database: PokerDatabase): Promise<void> {
    console.log('\n🪑 位置統計:');
    console.log('─'.repeat(40));

    const positions = await database.getPositionStats();
    
    if (positions.length === 0) {
      console.log('沒有位置數據');
      return;
    }

    console.log('位置    手牌數  收益      勝率');
    console.log('─'.repeat(40));

    positions.forEach(pos => {
      const profitColor = pos.winnings > 0 ? '🟢' : 
                         pos.winnings < 0 ? '🔴' : '🟡';
      console.log(
        `${pos.position.padEnd(8)} ${pos.hands.toString().padStart(6)} ` +
        `${profitColor}$${pos.winnings.toFixed(2).padStart(8)} ` +
        `${pos.winRate.toFixed(2).padStart(6)}%`
      );
    });

    // 找出最佳和最差位置
    const bestPosition = positions.reduce((best, pos) => 
      pos.winnings > best.winnings ? pos : best
    );
    const worstPosition = positions.reduce((worst, pos) => 
      pos.winnings < worst.winnings ? pos : worst
    );

    console.log('─'.repeat(40));
    console.log(`最佳位置: ${bestPosition.position} ($${bestPosition.winnings.toFixed(2)})`);
    console.log(`最差位置: ${worstPosition.position} ($${worstPosition.winnings.toFixed(2)})`);
  }

  showHelp(): void {
    console.log(`
🃏 ${this.description}

用法: ${this.usage}

選項:
  --database <path>     指定數據庫文件路徑 (預設: ./poker_data.db)
  --report <type>       指定報告類型 (預設: overview)
  --help               顯示此幫助信息

報告類型:
  overview             總覽統計 (預設)
  sessions             會話統計
  positions            位置統計
  all                  所有報告

範例:
  poker stats                           # 顯示總覽統計
  poker stats --report sessions         # 顯示會話統計
  poker stats --report positions        # 顯示位置統計
  poker stats --report all              # 顯示所有報告
  poker stats --database ./my_poker.db  # 使用指定數據庫
    `);
  }
} 