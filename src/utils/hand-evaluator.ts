import { Card, Suit, Rank, HandRank, HandStrength } from '../types/poker';

export class HandEvaluator {
  /**
   * 評估5張牌的最佳手牌強度
   */
  static evaluateHand(cards: Card[]): HandStrength {
    if (cards.length !== 5) {
      throw new Error('必須提供正好5張牌進行評估');
    }

    // 排序牌面值（A=14, K=13, Q=12, J=11, T=10...）
    const sortedCards = [...cards].sort((a, b) => this.getRankValue(b.rank) - this.getRankValue(a.rank));
    
    // 檢查各種牌型
    const royalFlush = this.checkRoyalFlush(sortedCards);
    if (royalFlush) return royalFlush;

    const straightFlush = this.checkStraightFlush(sortedCards);
    if (straightFlush) return straightFlush;

    const fourOfAKind = this.checkFourOfAKind(sortedCards);
    if (fourOfAKind) return fourOfAKind;

    const fullHouse = this.checkFullHouse(sortedCards);
    if (fullHouse) return fullHouse;

    const flush = this.checkFlush(sortedCards);
    if (flush) return flush;

    const straight = this.checkStraight(sortedCards);
    if (straight) return straight;

    const threeOfAKind = this.checkThreeOfAKind(sortedCards);
    if (threeOfAKind) return threeOfAKind;

    const twoPair = this.checkTwoPair(sortedCards);
    if (twoPair) return twoPair;

    const pair = this.checkPair(sortedCards);
    if (pair) return pair;

    return this.checkHighCard(sortedCards);
  }

  /**
   * 比較兩個手牌的強度，返回 1 (hand1勝), -1 (hand2勝), 0 (平手)
   */
  static compareHands(hand1: HandStrength, hand2: HandStrength): number {
    if (hand1.rank > hand2.rank) return 1;
    if (hand1.rank < hand2.rank) return -1;
    
    // 同樣牌型，比較數值
    if (hand1.value > hand2.value) return 1;
    if (hand1.value < hand2.value) return -1;
    
    return 0; // 平手
  }

  private static checkRoyalFlush(cards: Card[]): HandStrength | null {
    if (!this.isFlush(cards)) return null;
    
    const ranks = cards.map(c => this.getRankValue(c.rank));
    const isRoyal = ranks.includes(14) && ranks.includes(13) && ranks.includes(12) && ranks.includes(11) && ranks.includes(10);
    
    if (isRoyal) {
      return {
        rank: HandRank.ROYAL_FLUSH,
        value: 14, // A high
        description: '皇家同花順',
        cards
      };
    }
    
    return null;
  }

  private static checkStraightFlush(cards: Card[]): HandStrength | null {
    if (!this.isFlush(cards)) return null;
    
    const straightValue = this.getStraightValue(cards);
    if (straightValue) {
      return {
        rank: HandRank.STRAIGHT_FLUSH,
        value: straightValue,
        description: '同花順',
        cards
      };
    }
    
    return null;
  }

  private static checkFourOfAKind(cards: Card[]): HandStrength | null {
    const rankCounts = this.getRankCounts(cards);
    
    for (const [rank, count] of rankCounts.entries()) {
      if (count === 4) {
        const value = this.getRankValue(rank) * 1000; // 四條的牌面值
        return {
          rank: HandRank.FOUR_OF_A_KIND,
          value,
          description: '四條',
          cards
        };
      }
    }
    
    return null;
  }

  private static checkFullHouse(cards: Card[]): HandStrength | null {
    const rankCounts = this.getRankCounts(cards);
    let threeOfAKindRank: Rank | null = null;
    let pairRank: Rank | null = null;
    
    for (const [rank, count] of rankCounts.entries()) {
      if (count === 3) threeOfAKindRank = rank;
      if (count === 2) pairRank = rank;
    }
    
    if (threeOfAKindRank && pairRank) {
      const value = this.getRankValue(threeOfAKindRank) * 100 + this.getRankValue(pairRank);
      return {
        rank: HandRank.FULL_HOUSE,
        value,
        description: '葫蘆',
        cards
      };
    }
    
    return null;
  }

  private static checkFlush(cards: Card[]): HandStrength | null {
    if (!this.isFlush(cards)) return null;
    
    const sortedValues = cards.map(c => this.getRankValue(c.rank)).sort((a, b) => b - a);
    const value = sortedValues[0]! * 10000 + sortedValues[1]! * 1000 + sortedValues[2]! * 100 + sortedValues[3]! * 10 + sortedValues[4]!;
    
    return {
      rank: HandRank.FLUSH,
      value,
      description: '同花',
      cards
    };
  }

  private static checkStraight(cards: Card[]): HandStrength | null {
    const straightValue = this.getStraightValue(cards);
    if (straightValue) {
      return {
        rank: HandRank.STRAIGHT,
        value: straightValue,
        description: '順子',
        cards
      };
    }
    
    return null;
  }

  private static checkThreeOfAKind(cards: Card[]): HandStrength | null {
    const rankCounts = this.getRankCounts(cards);
    
    for (const [rank, count] of rankCounts.entries()) {
      if (count === 3) {
        const value = this.getRankValue(rank) * 1000;
        return {
          rank: HandRank.THREE_OF_A_KIND,
          value,
          description: '三條',
          cards
        };
      }
    }
    
    return null;
  }

  private static checkTwoPair(cards: Card[]): HandStrength | null {
    const rankCounts = this.getRankCounts(cards);
    const pairs: Rank[] = [];
    
    for (const [rank, count] of rankCounts.entries()) {
      if (count === 2) pairs.push(rank);
    }
    
    if (pairs.length === 2) {
      const pairValues = pairs.map(rank => this.getRankValue(rank)).sort((a, b) => b - a);
      const value = pairValues[0]! * 100 + pairValues[1]!;
      return {
        rank: HandRank.TWO_PAIR,
        value,
        description: '兩對',
        cards
      };
    }
    
    return null;
  }

  private static checkPair(cards: Card[]): HandStrength | null {
    const rankCounts = this.getRankCounts(cards);
    
    for (const [rank, count] of rankCounts.entries()) {
      if (count === 2) {
        const value = this.getRankValue(rank) * 1000;
        return {
          rank: HandRank.PAIR,
          value,
          description: '一對',
          cards
        };
      }
    }
    
    return null;
  }

  private static checkHighCard(cards: Card[]): HandStrength {
    const sortedValues = cards.map(c => this.getRankValue(c.rank)).sort((a, b) => b - a);
    const value = sortedValues[0]! * 10000 + sortedValues[1]! * 1000 + sortedValues[2]! * 100 + sortedValues[3]! * 10 + sortedValues[4]!;
    
    return {
      rank: HandRank.HIGH_CARD,
      value,
      description: '高牌',
      cards
    };
  }

  private static isFlush(cards: Card[]): boolean {
    const suit = cards[0]!.suit;
    return cards.every(card => card.suit === suit);
  }

  private static getStraightValue(cards: Card[]): number | null {
    const values = cards.map(c => this.getRankValue(c.rank)).sort((a, b) => a - b);
    
    // 檢查正常順子
    let isStraight = true;
    for (let i = 1; i < values.length; i++) {
      if (values[i]! !== values[i - 1]! + 1) {
        isStraight = false;
        break;
      }
    }
    
    if (isStraight) {
      return values[values.length - 1]!; // 最高牌
    }
    
    // 檢查 A-2-3-4-5 順子
    if (values.join(',') === '2,3,4,5,14') {
      return 5; // A在A-2-3-4-5中算作1，所以最高牌是5
    }
    
    return null;
  }

  private static getRankCounts(cards: Card[]): Map<Rank, number> {
    const counts = new Map<Rank, number>();
    
    for (const card of cards) {
      const current = counts.get(card.rank) || 0;
      counts.set(card.rank, current + 1);
    }
    
    return counts;
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