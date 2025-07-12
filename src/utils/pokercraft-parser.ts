import { 
  PokerCraftHand, 
  PokerCraftPlayer, 
  PokerCraftAction, 
  PokerCraftShowdown, 
  PokerCraftSummary, 
  PokerCraftWinner,
  ActionType, 
  Street, 
  Card, 
  Suit, 
  Rank 
} from '../types/poker';
import * as fs from 'fs-extra';

export class PokerCraftParser {
  private static readonly RANK_MAP: { [key: string]: Rank } = {
    '2': Rank.TWO,
    '3': Rank.THREE,
    '4': Rank.FOUR,
    '5': Rank.FIVE,
    '6': Rank.SIX,
    '7': Rank.SEVEN,
    '8': Rank.EIGHT,
    '9': Rank.NINE,
    'T': Rank.TEN,
    'J': Rank.JACK,
    'Q': Rank.QUEEN,
    'K': Rank.KING,
    'A': Rank.ACE
  };

  private static readonly SUIT_MAP: { [key: string]: Suit } = {
    'h': Suit.HEARTS,
    'd': Suit.DIAMONDS,
    'c': Suit.CLUBS,
    's': Suit.SPADES
  };

  /**
   * 解析 PokerCraft 日誌文件
   */
  static async parseLogFile(filePath: string): Promise<PokerCraftHand[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.parseLogContent(content);
    } catch (error) {
      throw new Error(`讀取日誌文件失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 解析日誌內容
   */
  static parseLogContent(content: string): PokerCraftHand[] {
    const hands: PokerCraftHand[] = [];
    const handBlocks = this.splitIntoHandBlocks(content);

    for (const block of handBlocks) {
      try {
        const hand = this.parseHandBlock(block);
        if (hand) {
          hands.push(hand);
        }
      } catch (error) {
        console.warn(`解析手牌失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
        // 繼續處理其他手牌
      }
    }

    return hands;
  }

  /**
   * 將日誌內容分割為單獨的手牌塊
   */
  private static splitIntoHandBlocks(content: string): string[] {
    // PokerCraft 日誌通常以 "Poker Hand #" 開始
    // 根據實際格式調整這個正則表達式
    const handSeparatorRegex = /(?=Poker Hand #|PokerStars Hand #|Natural8 Hand #|Rush & Cash Hand #)/g;
    const blocks = content.split(handSeparatorRegex).filter(block => block.trim().length > 0);
    
    // 如果沒有找到分隔符，嘗試按空行分割
    if (blocks.length <= 1) {
      return content.split(/\n\s*\n/).filter(block => block.trim().length > 0);
    }
    
    return blocks;
  }

  /**
   * 解析單個手牌塊
   */
  private static parseHandBlock(block: string): PokerCraftHand | null {
    const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return null;
    }

    // 解析手牌 ID 和基本信息
    const handInfo = this.parseHandHeader(lines[0]!);
    if (!handInfo) {
      return null;
    }

    // 解析座位信息
    const players = this.parsePlayers(lines);
    
    // 解析動作
    const actions = this.parseActions(lines);
    
    // 解析攤牌
    const showdown = this.parseShowdown(lines);
    
    // 解析總結
    const summary = this.parseSummary(lines);

    // 查找英雄位置和手牌
    const heroInfo = this.parseHeroInfo(lines);

    // 解析公共牌
    const communityCards = this.parseCommunityCards(lines);

    return {
      handId: handInfo.handId,
      gameType: handInfo.gameType,
      stakes: handInfo.stakes,
      tableId: handInfo.tableId,
      timestamp: handInfo.timestamp,
      buttonPosition: handInfo.buttonPosition,
      maxPlayers: handInfo.maxPlayers,
      players,
      preflop: actions.filter(a => a.street === Street.PREFLOP),
      flop: actions.filter(a => a.street === Street.FLOP),
      turn: actions.filter(a => a.street === Street.TURN),
      river: actions.filter(a => a.street === Street.RIVER),
      showdown,
      summary,
      heroPosition: heroInfo?.position || undefined,
      heroCards: heroInfo?.cards || undefined,
      communityCards,
      potSize: summary.totalPot,
      rake: summary.rake
    };
  }

  /**
   * 解析手牌頭部信息
   */
  private static parseHandHeader(headerLine: string): {
    handId: string;
    gameType: string;
    stakes: string;
    tableId: string;
    timestamp: Date;
    buttonPosition: number;
    maxPlayers: number;
  } | null {
    // 範例: "Poker Hand #RC3720248288: Hold'em No Limit ($0.05/$0.1) - 2025/07/12 04:19:49"
    // 或: "PokerStars Hand #123456789: Hold'em No Limit ($0.05/$0.10 USD) - 2024/01/01 12:00:00 UTC"
    
    const handIdMatch = headerLine.match(/Hand #([A-Z0-9]+)/);
    const stakesMatch = headerLine.match(/\$(\d+\.?\d*)\/\$(\d+\.?\d*)/);
    const timestampMatch = headerLine.match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/);
    const gameTypeMatch = headerLine.match(/(Hold'em No Limit|Rush & Cash Hold'em No Limit)/);
    
    if (!handIdMatch || !stakesMatch || !timestampMatch) {
      return null;
    }

    const handId = handIdMatch[1]!;
    const smallBlind = parseFloat(stakesMatch[1]!);
    const bigBlind = parseFloat(stakesMatch[2]!);
    const stakes = `$${smallBlind}/$${bigBlind}`;
    const gameType = gameTypeMatch ? gameTypeMatch[1]! : 'Hold\'em No Limit';
    
    // 解析時間戳
    const timestamp = new Date(timestampMatch[1]!.replace(/\//g, '-'));
    
    return {
      handId,
      gameType,
      stakes,
      tableId: `Table-${handId}`, // 如果沒有明確的桌子ID，使用手牌ID
      timestamp,
      buttonPosition: 1, // 預設值，需要從座位信息中解析
      maxPlayers: 6 // Rush & Cash 通常是6人桌
    };
  }

  /**
   * 解析玩家信息
   */
  private static parsePlayers(lines: string[]): PokerCraftPlayer[] {
    const players: PokerCraftPlayer[] = [];
    
    for (const line of lines) {
      // 範例: "Seat 1: PlayerName ($10.00 in chips)"
      const seatMatch = line.match(/Seat (\d+): (.+?) \(\$(\d+\.?\d*) in chips\)/);
      if (seatMatch) {
        const position = parseInt(seatMatch[1]!);
        const name = seatMatch[2]!;
        const stack = parseFloat(seatMatch[3]!);
        const isHero = name.toLowerCase().includes('hero') || name === 'Hero';
        
        players.push({
          name,
          position,
          stack,
          isHero
        });
      }
    }
    
    return players;
  }

  /**
   * 解析動作
   */
  private static parseActions(lines: string[]): PokerCraftAction[] {
    const actions: PokerCraftAction[] = [];
    let currentStreet = Street.PREFLOP;
    
    for (const line of lines) {
      // 檢查街道變化
      if (line.includes('*** FLOP ***')) {
        currentStreet = Street.FLOP;
        continue;
      } else if (line.includes('*** TURN ***')) {
        currentStreet = Street.TURN;
        continue;
      } else if (line.includes('*** RIVER ***')) {
        currentStreet = Street.RIVER;
        continue;
      }
      
      // 解析動作
      const action = this.parseActionLine(line, currentStreet);
      if (action) {
        actions.push(action);
      }
    }
    
    return actions;
  }

  /**
   * 解析單行動作
   */
  private static parseActionLine(line: string, street: Street): PokerCraftAction | null {
    // 範例動作格式:
    // "PlayerName: folds"
    // "PlayerName: calls $0.10"
    // "PlayerName: bets $0.20"
    // "PlayerName: raises $0.20 to $0.40"
    // "PlayerName: checks"
    
    const actionPatterns = [
      { regex: /(.+?): folds/, action: ActionType.FOLD },
      { regex: /(.+?): checks/, action: ActionType.CHECK },
      { regex: /(.+?): calls \$(\d+\.?\d*)/, action: ActionType.CALL },
      { regex: /(.+?): bets \$(\d+\.?\d*)/, action: ActionType.BET },
      { regex: /(.+?): raises .+ to \$(\d+\.?\d*)/, action: ActionType.RAISE },
      { regex: /(.+?): posts small blind \$(\d+\.?\d*)/, action: ActionType.POST_SB },
      { regex: /(.+?): posts big blind \$(\d+\.?\d*)/, action: ActionType.POST_BB }
    ];
    
    for (const pattern of actionPatterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const player = match[1]!.trim();
        const amount = match[2] ? parseFloat(match[2]) : undefined;
        
        return {
          player,
          action: pattern.action,
          amount: amount || undefined,
          position: 0, // 需要從玩家列表中查找
          street
        };
      }
    }
    
    return null;
  }

  /**
   * 解析攤牌信息
   */
  private static parseShowdown(lines: string[]): PokerCraftShowdown[] {
    const showdown: PokerCraftShowdown[] = [];
    
    for (const line of lines) {
      // 範例: "PlayerName: shows [Ah Kh] (a pair of Aces)"
      const showMatch = line.match(/(.+?): shows \[(.+?)\] \((.+?)\)/);
      if (showMatch) {
        const player = showMatch[1]!.trim();
        const cardsStr = showMatch[2]!;
        const handRank = showMatch[3]!;
        
        const cards = this.parseCards(cardsStr);
        
        showdown.push({
          player,
          cards,
          handRank,
          position: 0 // 需要從玩家列表中查找
        });
      }
    }
    
    return showdown;
  }

  /**
   * 解析總結信息
   */
  private static parseSummary(lines: string[]): PokerCraftSummary {
    let totalPot = 0;
    let rake = 0;
    const winners: PokerCraftWinner[] = [];
    let board: Card[] | undefined;
    
    for (const line of lines) {
      // 解析總底池
      const potMatch = line.match(/Total pot \$(\d+\.?\d*)/);
      if (potMatch) {
        totalPot = parseFloat(potMatch[1]!);
      }
      
      // 解析抽水
      const rakeMatch = line.match(/Rake \$(\d+\.?\d*)/);
      if (rakeMatch) {
        rake = parseFloat(rakeMatch[1]!);
      }
      
      // 解析獲勝者
      const winnerMatch = line.match(/(.+?) collected \$(\d+\.?\d*) from pot/);
      if (winnerMatch) {
        const player = winnerMatch[1]!.trim();
        const amount = parseFloat(winnerMatch[2]!);
        winners.push({ player, amount });
      }
      
      // 解析公共牌
      const boardMatch = line.match(/Board \[(.+?)\]/);
      if (boardMatch) {
        board = this.parseCards(boardMatch[1]!);
      }
    }
    
    return {
      totalPot,
      rake,
      winners,
      board: board || undefined
    };
  }

  /**
   * 解析英雄信息
   */
  private static parseHeroInfo(lines: string[]): { position: number; cards: Card[] } | null {
    for (const line of lines) {
      // 範例: "Dealt to Hero [Ah Kh]"
      const heroMatch = line.match(/Dealt to (.+?) \[(.+?)\]/);
      if (heroMatch) {
        const heroName = heroMatch[1]!;
        const cardsStr = heroMatch[2]!;
        const cards = this.parseCards(cardsStr);
        
        // 需要從玩家列表中查找位置
        return {
          position: 0, // 臨時值
          cards
        };
      }
    }
    
    return null;
  }

  /**
   * 解析公共牌
   */
  private static parseCommunityCards(lines: string[]): Card[] {
    const communityCards: Card[] = [];
    
    for (const line of lines) {
      // 解析翻牌
      const flopMatch = line.match(/\*\*\* FLOP \*\*\* \[(.+?)\]/);
      if (flopMatch) {
        communityCards.push(...this.parseCards(flopMatch[1]!));
      }
      
      // 解析轉牌
      const turnMatch = line.match(/\*\*\* TURN \*\*\* \[.+?\] \[(.+?)\]/);
      if (turnMatch) {
        communityCards.push(...this.parseCards(turnMatch[1]!));
      }
      
      // 解析河牌
      const riverMatch = line.match(/\*\*\* RIVER \*\*\* \[.+?\] \[(.+?)\]/);
      if (riverMatch) {
        communityCards.push(...this.parseCards(riverMatch[1]!));
      }
    }
    
    return communityCards;
  }

  /**
   * 解析牌面字符串為 Card 數組
   */
  private static parseCards(cardsStr: string): Card[] {
    const cards: Card[] = [];
    const cardTokens = cardsStr.split(' ').filter(token => token.length >= 2);
    
    for (const token of cardTokens) {
      const rank = this.RANK_MAP[token[0]!];
      const suit = this.SUIT_MAP[token[1]!.toLowerCase()];
      
      if (rank && suit) {
        cards.push({ rank, suit });
      }
    }
    
    return cards;
  }

  /**
   * 驗證解析結果
   */
  static validateHand(hand: PokerCraftHand): boolean {
    // 基本驗證
    if (!hand.handId || !hand.gameType || !hand.stakes) {
      return false;
    }
    
    // 檢查玩家數量
    if (hand.players.length === 0 || hand.players.length > hand.maxPlayers) {
      return false;
    }
    
    // 檢查底池大小
    if (hand.potSize < 0 || hand.rake < 0) {
      return false;
    }
    
    return true;
  }
} 