#!/usr/bin/env ts-node

import { PokerCraftParser, PokerDatabase } from '../src/index';
import * as path from 'path';

/**
 * PokerCraft 解析和分析使用示例
 */
async function demonstratePokerCraftAnalysis() {
  console.log('🃏 PokerCraft 解析和分析示例');
  console.log('═'.repeat(50));

  try {
    // 1. 解析示例日誌文件
    const logPath = path.join(__dirname, 'sample-pokercraft-log.txt');
    console.log(`\n📖 解析日誌文件: ${logPath}`);
    
    const hands = await PokerCraftParser.parseLogFile(logPath);
    console.log(`✅ 成功解析 ${hands.length} 手牌`);

    // 2. 顯示解析結果
    console.log('\n📊 解析結果摘要:');
    hands.forEach((hand, index) => {
      console.log(`\n手牌 ${index + 1}:`);
      console.log(`  ID: ${hand.handId}`);
      console.log(`  時間: ${hand.timestamp.toLocaleString()}`);
      console.log(`  注額: ${hand.stakes}`);
      console.log(`  玩家數: ${hand.players.length}`);
      console.log(`  底池: $${hand.potSize.toFixed(2)}`);
      console.log(`  抽水: $${hand.rake.toFixed(2)}`);
      
      if (hand.heroCards) {
        console.log(`  Hero 手牌: ${hand.heroCards.map(c => c.rank + c.suit).join(' ')}`);
      }
      
      if (hand.communityCards && hand.communityCards.length > 0) {
        console.log(`  公共牌: ${hand.communityCards.map(c => c.rank + c.suit).join(' ')}`);
      }

      // 顯示獲勝者
      if (hand.summary.winners.length > 0) {
        console.log(`  獲勝者: ${hand.summary.winners.map(w => `${w.player} ($${w.amount.toFixed(2)})`).join(', ')}`);
      }
    });

    // 3. 初始化數據庫（僅用於演示，不實際保存）
    console.log('\n💾 數據庫操作示例:');
    const database = new PokerDatabase(':memory:'); // 使用內存數據庫
    await database.initialize();
    await database.initializeSchema();
    
    // 4. 批量插入手牌
    console.log('📥 插入手牌到數據庫...');
    await database.insertHands(hands);
    
    // 5. 獲取統計信息
    console.log('\n📈 統計信息:');
    const stats = await database.getGameStats();
    console.log(`總手牌數: ${stats.totalHands}`);
    console.log(`獲勝手牌: ${stats.totalWon}`);
    console.log(`失敗手牌: ${stats.totalLost}`);
    console.log(`淨收益: $${stats.netWinnings.toFixed(2)}`);
    console.log(`勝率: ${stats.winRate.toFixed(2)}%`);
    console.log(`BB/100: ${stats.bb100.toFixed(2)}`);

    // 6. 獲取會話統計
    const sessions = await database.getSessionStats();
    if (sessions.length > 0) {
      console.log('\n📅 會話統計:');
      sessions.forEach(session => {
        console.log(`  ${session.date}: ${session.hands} 手, $${session.winnings.toFixed(2)}, BB/100: ${session.bb100.toFixed(2)}`);
      });
    }

    // 7. 獲取位置統計
    const positions = await database.getPositionStats();
    if (positions.length > 0) {
      console.log('\n🪑 位置統計:');
      positions.forEach(pos => {
        console.log(`  ${pos.position}: ${pos.hands} 手, $${pos.winnings.toFixed(2)}, 勝率: ${pos.winRate.toFixed(2)}%`);
      });
    }

    await database.close();
    console.log('\n✅ 示例完成！');

  } catch (error) {
    console.error(`❌ 錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * CLI 使用示例
 */
function demonstrateCLIUsage() {
  console.log('\n🖥️  CLI 使用示例:');
  console.log('═'.repeat(50));
  
  console.log('\n1. 導入 PokerCraft 日誌:');
  console.log('   npm run cli import examples/sample-pokercraft-log.txt');
  
  console.log('\n2. 驗證日誌格式:');
  console.log('   npm run cli import examples/sample-pokercraft-log.txt --validate');
  
  console.log('\n3. 顯示統計報告:');
  console.log('   npm run cli stats');
  console.log('   npm run cli stats --report sessions');
  console.log('   npm run cli stats --report positions');
  console.log('   npm run cli stats --report all');
  
  console.log('\n4. 生成圖表:');
  console.log('   npm run cli chart');
  console.log('   npm run cli chart --type sessions');
  console.log('   npm run cli chart --type positions');
  console.log('   npm run cli chart --type all --output ./my-charts.html');
  
  console.log('\n5. 使用自定義數據庫:');
  console.log('   npm run cli import hands.txt --database ./nl10-data.db');
  console.log('   npm run cli stats --database ./nl10-data.db');
  console.log('   npm run cli chart --database ./nl10-data.db');
}

// 運行示例
if (require.main === module) {
  demonstratePokerCraftAnalysis().then(() => {
    demonstrateCLIUsage();
  });
} 