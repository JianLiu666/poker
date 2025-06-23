import { Card, Suit, Rank, HoleCards } from '../types/poker';

export class HandParser {
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

  private static readonly SUITS = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];

  /**
   * 解析手牌字符串（如 "AKs", "QQ", "72o"）
   * s = suited (同花色), o = offsuit (不同花色), 無後綴表示對子
   */
  static parseHand(handStr: string, usedCards: Card[] = []): HoleCards {
    if (!handStr || handStr.length < 2) {
      throw new Error(`無效的手牌格式: ${handStr}`);
    }

    const normalized = handStr.toUpperCase().trim();
    
    // 提取牌面值
    const rank1Str = normalized.charAt(0);
    const rank2Str = normalized.charAt(1);
    
    if (!(rank1Str in this.RANK_MAP) || !(rank2Str in this.RANK_MAP)) {
      throw new Error(`無效的牌面值: ${handStr}`);
    }

    const rank1 = this.RANK_MAP[rank1Str]!;
    const rank2 = this.RANK_MAP[rank2Str]!;

    // 檢查是否為對子
    if (rank1 === rank2) {
      if (normalized.length > 2) {
        throw new Error(`對子不應該有花色後綴: ${handStr}`);
      }
      // 對子，隨機選擇兩張不同花色且未被使用的牌
      const availableSuits = this.SUITS.filter(suit => 
        !usedCards.some(card => card.rank === rank1 && card.suit === suit)
      );
      
      if (availableSuits.length < 2) {
        throw new Error(`無法為對子 ${handStr} 分配足夠的可用牌`);
      }
      
      // 隨機洗牌可用花色以確保隨機分配
      const shuffledSuits = this.shuffleArray([...availableSuits]);
      
      return {
        card1: { rank: rank1, suit: shuffledSuits[0]! },
        card2: { rank: rank2, suit: shuffledSuits[1]! }
      };
    }

    // 非對子，檢查花色後綴
    const suffix = normalized.length > 2 ? normalized.charAt(2) : '';
    
    if (suffix === 'S') {
      // 同花色 - 隨機選擇一個未被使用的花色
      const availableSuits = this.SUITS.filter(suit => 
        !usedCards.some(card => 
          (card.rank === rank1 || card.rank === rank2) && card.suit === suit
        )
      );
      
      if (availableSuits.length === 0) {
        throw new Error(`無法為同花手牌 ${handStr} 找到可用的花色`);
      }
      
      // 隨機選擇一個可用花色
      const randomIndex = Math.floor(Math.random() * availableSuits.length);
      const suit = availableSuits[randomIndex]!;
      
      return {
        card1: { rank: rank1, suit },
        card2: { rank: rank2, suit }
      };
    } else if (suffix === 'O' || suffix === '') {
      // 不同花色或無後綴（默認不同花色）
      // 為兩張牌隨機分配不同的花色，避免與已使用的牌重複
      
      // 獲取第一張牌的可用花色
      const availableSuitsForCard1 = this.SUITS.filter(suit => 
        !usedCards.some(card => card.rank === rank1 && card.suit === suit)
      );
      
      if (availableSuitsForCard1.length === 0) {
        throw new Error(`無法為手牌 ${handStr} 的第一張牌找到可用花色`);
      }
      
      // 隨機選擇第一張牌的花色
      const suit1Index = Math.floor(Math.random() * availableSuitsForCard1.length);
      const suit1 = availableSuitsForCard1[suit1Index]!;
      
      // 獲取第二張牌的可用花色（排除第一張牌的花色）
      const availableSuitsForCard2 = this.SUITS.filter(suit => 
        suit !== suit1 && !usedCards.some(card => card.rank === rank2 && card.suit === suit)
      );
      
      if (availableSuitsForCard2.length === 0) {
        throw new Error(`無法為手牌 ${handStr} 的第二張牌找到可用花色`);
      }
      
      // 隨機選擇第二張牌的花色
      const suit2Index = Math.floor(Math.random() * availableSuitsForCard2.length);
      const suit2 = availableSuitsForCard2[suit2Index]!;
      
      return {
        card1: { rank: rank1, suit: suit1 },
        card2: { rank: rank2, suit: suit2 }
      };
    } else {
      throw new Error(`無效的花色後綴: ${suffix}. 使用 's' 表示同花色，'o' 表示不同花色`);
    }
  }

  /**
   * 創建一副完整的撲克牌
   */
  static createDeck(): Card[] {
    const deck: Card[] = [];
    
    for (const suit of this.SUITS) {
      for (const rank of Object.values(Rank)) {
        deck.push({ suit, rank });
      }
    }
    
    return deck;
  }

  /**
   * 洗牌算法
   */
  static shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const cardI = shuffled[i]!;
      const cardJ = shuffled[j]!;
      shuffled[i] = cardJ;
      shuffled[j] = cardI;
    }
    
    return shuffled;
  }

  /**
   * 通用陣列洗牌算法
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const itemI = shuffled[i]!;
      const itemJ = shuffled[j]!;
      shuffled[i] = itemJ;
      shuffled[j] = itemI;
    }
    
    return shuffled;
  }

  /**
   * 從牌堆中移除指定的牌
   */
  static removeCardsFromDeck(deck: Card[], cardsToRemove: Card[]): Card[] {
    return deck.filter(card => 
      !cardsToRemove.some(removeCard => 
        card.suit === removeCard.suit && card.rank === removeCard.rank
      )
    );
  }

  /**
   * 格式化手牌顯示
   */
  static formatHand(holeCards: HoleCards): string {
    const { card1, card2 } = holeCards;
    const rank1 = this.getRankSymbol(card1.rank);
    const rank2 = this.getRankSymbol(card2.rank);
    
    if (rank1 === rank2) {
      return `${rank1}${rank2}`; // 對子
    }
    
    const suited = card1.suit === card2.suit ? 's' : 'o';
    // 確保高牌在前
    const higherRank = this.getRankValue(card1.rank) >= this.getRankValue(card2.rank) ? rank1 : rank2;
    const lowerRank = this.getRankValue(card1.rank) >= this.getRankValue(card2.rank) ? rank2 : rank1;
    
    return `${higherRank}${lowerRank}${suited}`;
  }

  private static getRankSymbol(rank: Rank): string {
    const reverseMap: { [key in Rank]: string } = {
      [Rank.TWO]: '2',
      [Rank.THREE]: '3',
      [Rank.FOUR]: '4',
      [Rank.FIVE]: '5',
      [Rank.SIX]: '6',
      [Rank.SEVEN]: '7',
      [Rank.EIGHT]: '8',
      [Rank.NINE]: '9',
      [Rank.TEN]: 'T',
      [Rank.JACK]: 'J',
      [Rank.QUEEN]: 'Q',
      [Rank.KING]: 'K',
      [Rank.ACE]: 'A'
    };
    return reverseMap[rank];
  }

  private static getRankValue(rank: Rank): number {
    const values: { [key in Rank]: number } = {
      [Rank.TWO]: 2,
      [Rank.THREE]: 3,
      [Rank.FOUR]: 4,
      [Rank.FIVE]: 5,
      [Rank.SIX]: 6,
      [Rank.SEVEN]: 7,
      [Rank.EIGHT]: 8,
      [Rank.NINE]: 9,
      [Rank.TEN]: 10,
      [Rank.JACK]: 11,
      [Rank.QUEEN]: 12,
      [Rank.KING]: 13,
      [Rank.ACE]: 14
    };
    return values[rank];
  }
} 