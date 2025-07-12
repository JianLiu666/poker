import { BaseCommand, CommandOptions } from '../base-command';
import { PokerDatabase } from '../../database/database';
import * as fs from 'fs-extra';

export class ChartCommand extends BaseCommand {
  readonly name = 'chart';
  readonly description = '生成遊戲曲線和統計圖表';
  readonly usage = 'poker chart [options]';

  async execute(options: CommandOptions, args: string[]): Promise<void> {
    const dbPath = options.database || './poker_data.db';
    const chartType = options.type || 'winnings';
    const outputPath = options.output || './poker_charts.html';

    try {
      const database = new PokerDatabase(dbPath);
      await database.initialize();

      const handCount = await database.getHandCount();
      if (handCount === 0) {
        console.log('❌ 數據庫中沒有手牌數據。請先使用 import 命令導入數據。');
        return;
      }

      console.log(`📈 生成圖表 (${handCount} 手牌)`);
      console.log('═'.repeat(50));

      switch (chartType) {
        case 'winnings':
          await this.generateWinningsChart(database, outputPath);
          break;
        case 'sessions':
          await this.generateSessionsChart(database, outputPath);
          break;
        case 'positions':
          await this.generatePositionsChart(database, outputPath);
          break;
        case 'all':
          await this.generateAllCharts(database, outputPath);
          break;
        default:
          console.error(`❌ 未知的圖表類型: ${chartType}`);
          this.showHelp();
      }

      await database.close();

    } catch (error) {
      console.error(`❌ 圖表生成失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      process.exit(1);
    }
  }

  /**
   * 生成收益曲線圖
   */
  private async generateWinningsChart(database: PokerDatabase, outputPath: string): Promise<void> {
    console.log('📊 生成收益曲線圖...');
    
    const sessions = await database.getSessionStats();
    
    if (sessions.length === 0) {
      console.log('❌ 沒有會話數據可用於生成圖表');
      return;
    }

    // 計算累積收益
    let cumulativeWinnings = 0;
    const chartData = sessions.reverse().map(session => {
      cumulativeWinnings += session.winnings;
      return {
        date: session.date,
        winnings: session.winnings,
        cumulative: cumulativeWinnings,
        hands: session.hands,
        bb100: session.bb100
      };
    });

    const html = this.generateWinningsHTML(chartData);
    await fs.writeFile(outputPath, html);
    
    console.log(`✅ 收益曲線圖已生成: ${outputPath}`);
  }

  /**
   * 生成會話統計圖
   */
  private async generateSessionsChart(database: PokerDatabase, outputPath: string): Promise<void> {
    console.log('📊 生成會話統計圖...');
    
    const sessions = await database.getSessionStats();
    
    if (sessions.length === 0) {
      console.log('❌ 沒有會話數據可用於生成圖表');
      return;
    }

    const html = this.generateSessionsHTML(sessions);
    await fs.writeFile(outputPath, html);
    
    console.log(`✅ 會話統計圖已生成: ${outputPath}`);
  }

  /**
   * 生成位置統計圖
   */
  private async generatePositionsChart(database: PokerDatabase, outputPath: string): Promise<void> {
    console.log('📊 生成位置統計圖...');
    
    const positions = await database.getPositionStats();
    
    if (positions.length === 0) {
      console.log('❌ 沒有位置數據可用於生成圖表');
      return;
    }

    const html = this.generatePositionsHTML(positions);
    await fs.writeFile(outputPath, html);
    
    console.log(`✅ 位置統計圖已生成: ${outputPath}`);
  }

  /**
   * 生成所有圖表
   */
  private async generateAllCharts(database: PokerDatabase, outputPath: string): Promise<void> {
    console.log('📊 生成所有圖表...');
    
    const sessions = await database.getSessionStats();
    const positions = await database.getPositionStats();
    
    if (sessions.length === 0 && positions.length === 0) {
      console.log('❌ 沒有數據可用於生成圖表');
      return;
    }

    // 計算累積收益
    let cumulativeWinnings = 0;
    const winningsData = sessions.reverse().map(session => {
      cumulativeWinnings += session.winnings;
      return {
        date: session.date,
        winnings: session.winnings,
        cumulative: cumulativeWinnings,
        hands: session.hands,
        bb100: session.bb100
      };
    });

    const html = this.generateAllChartsHTML(winningsData, sessions, positions);
    await fs.writeFile(outputPath, html);
    
    console.log(`✅ 所有圖表已生成: ${outputPath}`);
  }

  /**
   * 生成收益曲線 HTML
   */
  private generateWinningsHTML(data: any[]): string {
    const dates = data.map(d => `"${d.date}"`).join(',');
    const winnings = data.map(d => d.winnings).join(',');
    const cumulative = data.map(d => d.cumulative).join(',');
    const bb100 = data.map(d => d.bb100).join(',');

    return `
<!DOCTYPE html>
<html>
<head>
    <title>撲克收益曲線</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .chart-container { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        h2 { color: #666; margin-top: 30px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-item { text-align: center; padding: 10px; background: #f9f9f9; border-radius: 5px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2196F3; }
        .stat-label { font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🃏 撲克收益分析</h1>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-value">$${data[data.length - 1]?.cumulative.toFixed(2) || '0.00'}</div>
                <div class="stat-label">總收益</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${data.length}</div>
                <div class="stat-label">會話數</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${data.reduce((sum, d) => sum + d.hands, 0).toLocaleString()}</div>
                <div class="stat-label">總手牌數</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${(data.reduce((sum, d) => sum + d.bb100, 0) / data.length).toFixed(2)}</div>
                <div class="stat-label">平均 BB/100</div>
            </div>
        </div>

        <div class="chart-container">
            <h2>累積收益曲線</h2>
            <canvas id="cumulativeChart"></canvas>
        </div>

        <div class="chart-container">
            <h2>每日收益</h2>
            <canvas id="dailyChart"></canvas>
        </div>

        <div class="chart-container">
            <h2>BB/100 趨勢</h2>
            <canvas id="bb100Chart"></canvas>
        </div>
    </div>

    <script>
        // 累積收益圖
        const cumulativeCtx = document.getElementById('cumulativeChart').getContext('2d');
        new Chart(cumulativeCtx, {
            type: 'line',
            data: {
                labels: [${dates}],
                datasets: [{
                    label: '累積收益 ($)',
                    data: [${cumulative}],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });

        // 每日收益圖
        const dailyCtx = document.getElementById('dailyChart').getContext('2d');
        new Chart(dailyCtx, {
            type: 'bar',
            data: {
                labels: [${dates}],
                datasets: [{
                    label: '每日收益 ($)',
                    data: [${winnings}],
                    backgroundColor: function(context) {
                        const value = context.parsed.y;
                        return value >= 0 ? '#4CAF50' : '#F44336';
                    }
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });

        // BB/100 趨勢圖
        const bb100Ctx = document.getElementById('bb100Chart').getContext('2d');
        new Chart(bb100Ctx, {
            type: 'line',
            data: {
                labels: [${dates}],
                datasets: [{
                    label: 'BB/100',
                    data: [${bb100}],
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * 生成會話統計 HTML
   */
  private generateSessionsHTML(sessions: any[]): string {
    const dates = sessions.map(s => `"${s.date}"`).join(',');
    const winnings = sessions.map(s => s.winnings).join(',');
    const hands = sessions.map(s => s.hands).join(',');

    return `
<!DOCTYPE html>
<html>
<head>
    <title>撲克會話統計</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .chart-container { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🃏 撲克會話統計</h1>
        
        <div class="chart-container">
            <canvas id="sessionsChart"></canvas>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('sessionsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [${dates}],
                datasets: [{
                    label: '會話收益 ($)',
                    data: [${winnings}],
                    backgroundColor: function(context) {
                        const value = context.parsed.y;
                        return value >= 0 ? '#4CAF50' : '#F44336';
                    }
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * 生成位置統計 HTML
   */
  private generatePositionsHTML(positions: any[]): string {
    const positionNames = positions.map(p => `"${p.position}"`).join(',');
    const winnings = positions.map(p => p.winnings).join(',');
    const hands = positions.map(p => p.hands).join(',');

    return `
<!DOCTYPE html>
<html>
<head>
    <title>撲克位置統計</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .chart-container { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🃏 撲克位置統計</h1>
        
        <div class="chart-container">
            <canvas id="positionsChart"></canvas>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('positionsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [${positionNames}],
                datasets: [{
                    label: '位置收益 ($)',
                    data: [${winnings}],
                    backgroundColor: '#2196F3'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * 生成所有圖表 HTML
   */
  private generateAllChartsHTML(winningsData: any[], sessions: any[], positions: any[]): string {
    // 這裡可以組合多個圖表到一個 HTML 文件中
    return this.generateWinningsHTML(winningsData);
  }

  showHelp(): void {
    console.log(`
🃏 ${this.description}

用法: ${this.usage}

選項:
  --database <path>     指定數據庫文件路徑 (預設: ./poker_data.db)
  --type <type>         指定圖表類型 (預設: winnings)
  --output <path>       指定輸出文件路徑 (預設: ./poker_charts.html)
  --help               顯示此幫助信息

圖表類型:
  winnings             收益曲線圖 (預設)
  sessions             會話統計圖
  positions            位置統計圖
  all                  所有圖表

範例:
  poker chart                                    # 生成收益曲線圖
  poker chart --type sessions                    # 生成會話統計圖
  poker chart --type positions                   # 生成位置統計圖
  poker chart --type all --output ./charts.html # 生成所有圖表
  poker chart --database ./my_poker.db          # 使用指定數據庫
    `);
  }
} 