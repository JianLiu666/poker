import { BaseCommand, CommandOptions } from '../base-command';
import { PokerSimulator } from '../../utils/poker-simulator';

export interface SimulationOptions extends CommandOptions {
  iterations?: number;
}

export class SimulationCommand extends BaseCommand {
  readonly name = 'simulate';
  readonly description = '模擬德州撲克兩手牌的勝率對比';
  readonly usage = 'poker simulate <hand1> <hand2> <iterations> [--iterations <number>]';

  execute(options: SimulationOptions = {}, positionalArgs: string[] = []): void {
    try {
      // 解析參數
      if (positionalArgs.length < 2) {
        this.error('請提供兩個手牌進行對比');
        this.log('');
        this.log('使用方法:');
        this.log('  poker simulate AKs QQ 1000000');
        this.log('  poker simulate AA 72o 100000');
        this.log('');
        this.log('手牌格式:');
        this.log('  - 對子: AA, KK, QQ, 22');
        this.log('  - 同花色: AKs, QJs, T9s');
        this.log('  - 不同花色: AKo, QJo, T9o 或 AK, QJ, T9');
        return;
      }

      const hand1 = positionalArgs[0]!;
      const hand2 = positionalArgs[1]!;
      
      // 決定模擬次數
      let iterations = options.iterations || 100000; // 默認10萬次
      
      if (positionalArgs.length >= 3) {
        const iterationsArg = parseInt(positionalArgs[2]!);
        if (!isNaN(iterationsArg) && iterationsArg > 0) {
          iterations = iterationsArg;
        }
      }

      // 驗證參數
      if (iterations > 10000000) {
        this.warn('模擬次數過多，限制為1000萬次以避免長時間等待');
        iterations = 10000000;
      }

      if (iterations < 1000) {
        this.warn('模擬次數過少可能導致結果不準確，建議至少10000次');
      }

      this.log('🎯 開始德州撲克勝率模擬...');
      this.log(`對比手牌: ${hand1} vs ${hand2}`);
      this.log(`模擬次數: ${iterations.toLocaleString()} 場`);
      this.log('');

      // 開始計時
      const startTime = Date.now();

      // 執行模擬
      const result = PokerSimulator.quickSimulate(hand1, hand2, iterations);

      // 計算耗時
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 顯示結果
      const formattedResult = PokerSimulator.formatResult(hand1, hand2, result);
      console.log(formattedResult);

      // 性能資訊
      this.log('');
      this.info(`模擬完成，耗時: ${duration}ms`);
      this.info(`平均每秒模擬: ${Math.round(iterations / (duration / 1000)).toLocaleString()} 場`);

      // 勝率建議
      this.log('');
      this.log('💡 勝率解讀:');
      if (Math.abs(result.player1WinRate - result.player2WinRate) < 5) {
        this.log('• 兩手牌實力相當，勝負主要看運氣和技巧');
      } else if (Math.abs(result.player1WinRate - result.player2WinRate) < 15) {
        this.log('• 有輕微優勢，但仍需謹慎遊戲');
      } else if (Math.abs(result.player1WinRate - result.player2WinRate) < 30) {
        this.log('• 有明顯優勢，是相對強勢的對戰');
      } else {
        this.log('• 有壓倒性優勢，大多數情況下都會獲勝');
      }

    } catch (error) {
      this.error(`模擬失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      this.log('');
      this.log('常見錯誤:');
      this.log('• 手牌格式錯誤 - 請使用正確格式如 AKs, QQ, 72o');
      this.log('• 手牌重複 - 兩個玩家不能有相同的牌');
      this.log('• 模擬次數無效 - 必須是正整數');
    }
  }

  showHelp(): void {
    console.log(`
📖 ${this.description}

使用方法:
  ${this.usage}

參數說明:
  hand1          第一個玩家的手牌 (如: AKs, QQ, 72o)
  hand2          第二個玩家的手牌
  iterations     模擬次數 (可選，默認100,000次)

手牌格式:
  對子:         AA, KK, QQ, JJ, TT, 99, 88, 77, 66, 55, 44, 33, 22
  同花色:       AKs, AQs, AJs, KQs, KJs, QJs, T9s, 98s, 87s, 76s...
  不同花色:     AKo, AQo, AJo, KQo, KJo, QJo, T9o, 98o, 87o, 76o...
  
  注意: 
  - 's' 表示suited (同花色)
  - 'o' 表示offsuit (不同花色)
  - 無後綴默認為不同花色
  - T代表10

範例:
  poker simulate AKs QQ 1000000        # 模擬AK同花 vs QQ對子 100萬次
  poker simulate AA 72o 100000         # 模擬AA對子 vs 72不同花 10萬次
  poker simulate KK AKs 500000         # 模擬KK對子 vs AK同花 50萬次
  poker simulate 22 AKo 50000          # 模擬22對子 vs AK不同花 5萬次

性能提示:
  - 10萬次: 快速測試 (~1秒)
  - 100萬次: 準確結果 (~10秒) 
  - 1000萬次: 高精度 (~100秒)
`);
  }
} 