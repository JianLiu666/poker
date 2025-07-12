import * as sqlite3 from 'sqlite3';
import * as fs from 'fs-extra';
import * as path from 'path';
import { 
  DatabaseHand, 
  DatabasePlayer, 
  DatabaseAction, 
  DatabaseShowdown,
  PokerCraftHand,
  PokerCraftWinner,
  GameStats,
  SessionStats,
  PositionStats
} from '../types/poker';

export class PokerDatabase {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor(dbPath: string = './poker_data.db') {
    this.dbPath = dbPath;
  }

  /**
   * 初始化數據庫連接
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(new Error(`數據庫連接失敗: ${err.message}`));
        } else {
          console.log(`✅ 數據庫連接成功: ${this.dbPath}`);
          resolve();
        }
      });
    });
  }

  /**
   * 執行數據庫 schema 初始化
   */
  async initializeSchema(): Promise<void> {
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    try {
      const schema = await fs.readFile(schemaPath, 'utf-8');
      await this.executeScript(schema);
      console.log('✅ 數據庫 schema 初始化完成');
    } catch (error) {
      throw new Error(`Schema 初始化失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 執行 SQL 腳本
   */
  private async executeScript(script: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('數據庫未初始化'));
        return;
      }

      this.db.exec(script, (err) => {
        if (err) {
          reject(new Error(`SQL 腳本執行失敗: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 插入手牌數據
   */
  async insertHand(hand: PokerCraftHand): Promise<void> {
    if (!this.db) {
      throw new Error('數據庫未初始化');
    }

    const transaction = async () => {
      // 插入手牌基本信息
      await this.insertHandRecord(hand);
      
      // 插入玩家信息
      for (const player of hand.players) {
        await this.insertPlayer({
          hand_id: hand.handId,
          name: player.name,
          position: player.position,
          stack: player.stack,
          is_hero: player.isHero
        });
      }

      // 插入動作信息
      let actionOrder = 0;
      for (const action of [...hand.preflop, ...(hand.flop || []), ...(hand.turn || []), ...(hand.river || [])]) {
        await this.insertAction({
          hand_id: hand.handId,
          player: action.player,
          action: action.action,
          amount: action.amount,
          position: action.position,
          street: action.street,
          action_order: actionOrder++
        });
      }

      // 插入攤牌信息
      if (hand.showdown) {
        for (const showdown of hand.showdown) {
          await this.insertShowdown({
            hand_id: hand.handId,
            player: showdown.player,
            cards: JSON.stringify(showdown.cards),
            hand_rank: showdown.handRank,
            position: showdown.position
          });
        }
      }

      // 插入獲勝者信息
      for (const winner of hand.summary.winners) {
        await this.insertWinner(hand.handId, winner);
      }
    };

    await this.runTransaction(transaction);
  }

  /**
   * 插入手牌記錄
   */
  private async insertHandRecord(hand: PokerCraftHand): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO hands (
        hand_id, game_type, stakes, table_id, timestamp, button_position, 
        max_players, pot_size, rake, hero_position, hero_cards, community_cards
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      hand.handId,
      hand.gameType,
      hand.stakes,
      hand.tableId,
      hand.timestamp.toISOString(),
      hand.buttonPosition,
      hand.maxPlayers,
      hand.potSize,
      hand.rake,
      hand.heroPosition || null,
      hand.heroCards ? JSON.stringify(hand.heroCards) : null,
      hand.communityCards ? JSON.stringify(hand.communityCards) : null
    ];

    await this.run(sql, params);
  }

  /**
   * 插入玩家記錄
   */
  private async insertPlayer(player: DatabasePlayer): Promise<void> {
    const sql = `
      INSERT INTO players (hand_id, name, position, stack, is_hero)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      player.hand_id,
      player.name,
      player.position,
      player.stack,
      player.is_hero
    ];

    await this.run(sql, params);
  }

  /**
   * 插入動作記錄
   */
  private async insertAction(action: DatabaseAction): Promise<void> {
    const sql = `
      INSERT INTO actions (hand_id, player, action, amount, position, street, action_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      action.hand_id,
      action.player,
      action.action,
      action.amount || null,
      action.position,
      action.street,
      action.action_order
    ];

    await this.run(sql, params);
  }

  /**
   * 插入攤牌記錄
   */
  private async insertShowdown(showdown: DatabaseShowdown): Promise<void> {
    const sql = `
      INSERT INTO showdowns (hand_id, player, cards, hand_rank, position)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      showdown.hand_id,
      showdown.player,
      showdown.cards,
      showdown.hand_rank,
      showdown.position
    ];

    await this.run(sql, params);
  }

  /**
   * 插入獲勝者記錄
   */
  private async insertWinner(handId: string, winner: PokerCraftWinner): Promise<void> {
    const sql = `
      INSERT INTO winners (hand_id, player, amount, hand_description)
      VALUES (?, ?, ?, ?)
    `;

    const params = [
      handId,
      winner.player,
      winner.amount,
      winner.handDescription || null
    ];

    await this.run(sql, params);
  }

  /**
   * 獲取遊戲統計
   */
  async getGameStats(): Promise<GameStats> {
    const sql = `
      SELECT 
        COUNT(*) as total_hands,
        SUM(CASE WHEN hero_winnings > 0 THEN 1 ELSE 0 END) as total_won,
        SUM(CASE WHEN hero_winnings < 0 THEN 1 ELSE 0 END) as total_lost,
        SUM(hero_winnings) as net_winnings,
        AVG(hero_winnings) as avg_winnings,
        (SUM(hero_winnings) / COUNT(*)) * 100 as bb_per_100_hands
      FROM hand_summary
    `;

    const row = await this.get(sql);
    
    return {
      totalHands: row.total_hands || 0,
      totalWon: row.total_won || 0,
      totalLost: row.total_lost || 0,
      netWinnings: row.net_winnings || 0,
      vpip: 0, // 需要額外計算
      pfr: 0,  // 需要額外計算
      aggression: 0, // 需要額外計算
      winRate: row.total_hands > 0 ? (row.total_won / row.total_hands) * 100 : 0,
      bb100: row.bb_per_100_hands || 0
    };
  }

  /**
   * 獲取會話統計
   */
  async getSessionStats(): Promise<SessionStats[]> {
    const sql = `
      SELECT 
        session_date as date,
        hands_played as hands,
        net_winnings as winnings,
        bb_per_100_hands as bb100
      FROM session_stats
      ORDER BY session_date DESC
      LIMIT 30
    `;

    const rows = await this.all(sql);
    return rows.map(row => ({
      date: row.date,
      hands: row.hands,
      winnings: row.winnings,
      bb100: row.bb100
    }));
  }

  /**
   * 獲取位置統計
   */
  async getPositionStats(): Promise<PositionStats[]> {
    const sql = `
      SELECT 
        hero_position as position,
        hands_played as hands,
        total_winnings as winnings,
        win_rate as winRate
      FROM position_stats
    `;

    const rows = await this.all(sql);
    return rows.map(row => ({
      position: `Position ${row.position}`,
      hands: row.hands,
      winnings: row.winnings,
      vpip: 0, // 需要額外計算
      pfr: 0,  // 需要額外計算
      winRate: row.winRate
    }));
  }

  /**
   * 獲取手牌數量
   */
  async getHandCount(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM hands';
    const row = await this.get(sql);
    return row.count || 0;
  }

  /**
   * 批量插入手牌
   */
  async insertHands(hands: PokerCraftHand[]): Promise<void> {
    console.log(`開始插入 ${hands.length} 手牌...`);
    
    for (let i = 0; i < hands.length; i++) {
      try {
        await this.insertHand(hands[i]!);
        if ((i + 1) % 100 === 0) {
          console.log(`已插入 ${i + 1}/${hands.length} 手牌`);
        }
      } catch (error) {
        console.warn(`插入手牌 ${hands[i]!.handId} 失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      }
    }
    
    console.log(`✅ 批量插入完成，共處理 ${hands.length} 手牌`);
  }

  /**
   * 執行事務
   */
  private async runTransaction(callback: () => Promise<void>): Promise<void> {
    if (!this.db) {
      throw new Error('數據庫未初始化');
    }

    await this.run('BEGIN TRANSACTION');
    
    try {
      await callback();
      await this.run('COMMIT');
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * 執行 SQL 查詢（返回單行）
   */
  private async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('數據庫未初始化'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(new Error(`查詢失敗: ${err.message}`));
        } else {
          resolve(row || {});
        }
      });
    });
  }

  /**
   * 執行 SQL 查詢（返回多行）
   */
  private async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('數據庫未初始化'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(new Error(`查詢失敗: ${err.message}`));
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * 執行 SQL 語句
   */
  private async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('數據庫未初始化'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(new Error(`執行失敗: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 關閉數據庫連接
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) {
          reject(new Error(`數據庫關閉失敗: ${err.message}`));
        } else {
          console.log('✅ 數據庫連接已關閉');
          resolve();
        }
      });
    });
  }
} 