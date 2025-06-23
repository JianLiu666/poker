import { Card, HoleCards, GameResult, SimulationResult } from '../types/poker';
import { HandParser } from './hand-parser';
import { HandEvaluator } from './hand-evaluator';

export class PokerSimulator {
  /**
   * 模擬兩個玩家的德州撲克遊戲
   */
  static simulate(player1Hand: HoleCards, player2Hand: HoleCards, iterations: number): SimulationResult {
    if (iterations <= 0) {
      throw new Error('模擬次數必須大於0');
    }

    let player1Wins = 0;
    let player2Wins = 0;
    let ties = 0;

    for (let i = 0; i < iterations; i++) {
      const result = this.simulateSingleGame(player1Hand, player2Hand);
      
      if (result.winner === 0) {
        player1Wins++;
      } else if (result.winner === 1) {
        player2Wins++;
      } else {
        ties++;
      }
    }

    const player1WinRate = (player1Wins / iterations) * 100;
    const player2WinRate = (player2Wins / iterations) * 100;
    const tieRate = (ties / iterations) * 100;

    return {
      player1Wins,
      player2Wins,
      ties,
      totalGames: iterations,
      player1WinRate,
      player2WinRate,
      tieRate
    };
  }

  /**
   * 模擬單場遊戲
   */
  private static simulateSingleGame(player1Hand: HoleCards, player2Hand: HoleCards): GameResult {
    // 創建牌堆並移除已發的手牌
    let deck = HandParser.createDeck();
    const usedCards = [player1Hand.card1, player1Hand.card2, player2Hand.card1, player2Hand.card2];
    deck = HandParser.removeCardsFromDeck(deck, usedCards);
    
    // 洗牌
    deck = HandParser.shuffleDeck(deck);
    
    // 發5張公共牌
    const communityCards = deck.slice(0, 5);
    
    // 組合每個玩家的最佳5張牌
    const player1Cards = [player1Hand.card1, player1Hand.card2, ...communityCards];
    const player2Cards = [player2Hand.card1, player2Hand.card2, ...communityCards];
    
    // 找出最佳5張牌組合
    const player1BestHand = this.findBestFiveCardHand(player1Cards);
    const player2BestHand = this.findBestFiveCardHand(player2Cards);
    
    // 評估手牌強度
    const player1Strength = HandEvaluator.evaluateHand(player1BestHand);
    const player2Strength = HandEvaluator.evaluateHand(player2BestHand);
    
    // 比較手牌決定勝負
    const comparison = HandEvaluator.compareHands(player1Strength, player2Strength);
    
    let winner: number;
    if (comparison > 0) {
      winner = 0; // 玩家1勝
    } else if (comparison < 0) {
      winner = 1; // 玩家2勝
    } else {
      winner = -1; // 平手
    }

    return {
      winner,
      player1Hand: player1Strength,
      player2Hand: player2Strength,
      communityCards
    };
  }

  /**
   * 從7張牌中找出最佳的5張牌組合
   */
  private static findBestFiveCardHand(cards: Card[]): Card[] {
    if (cards.length !== 7) {
      throw new Error('德州撲克必須從7張牌（2張手牌+5張公共牌）中選擇最佳5張');
    }

    let bestHand: Card[] = [];
    let bestStrength = null;

    // 生成所有可能的5張牌組合 (C(7,5) = 21種組合)
    const combinations = this.generateCombinations(cards, 5);

    for (const combination of combinations) {
      const strength = HandEvaluator.evaluateHand(combination);
      
      if (!bestStrength || HandEvaluator.compareHands(strength, bestStrength) > 0) {
        bestStrength = strength;
        bestHand = combination;
      }
    }

    return bestHand;
  }

  /**
   * 生成組合（從n個元素中選k個）
   */
  private static generateCombinations<T>(arr: T[], k: number): T[][] {
    if (k === 0) return [[]];
    if (arr.length === 0) return [];

    const first = arr[0]!;
    const rest = arr.slice(1);

    // 包含第一個元素的組合
    const withFirst = this.generateCombinations(rest, k - 1).map(combo => [first, ...combo]);
    
    // 不包含第一個元素的組合
    const withoutFirst = this.generateCombinations(rest, k);

    return [...withFirst, ...withoutFirst];
  }

  /**
   * 快速模擬（用於大量模擬時的優化版本）
   */
  static quickSimulate(hand1Str: string, hand2Str: string, iterations: number): SimulationResult {
    const player1Hand = HandParser.parseHand(hand1Str);
    const player2Hand = HandParser.parseHand(hand2Str);
    
    // 檢查手牌是否重複
    this.validateHands(player1Hand, player2Hand);
    
    return this.simulate(player1Hand, player2Hand, iterations);
  }

  /**
   * 驗證兩個手牌沒有重複的牌
   */
  private static validateHands(hand1: HoleCards, hand2: HoleCards): void {
    const cards = [hand1.card1, hand1.card2, hand2.card1, hand2.card2];
    
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const card1 = cards[i]!;
        const card2 = cards[j]!;
        if (card1.suit === card2.suit && card1.rank === card2.rank) {
          throw new Error('手牌中有重複的牌');
        }
      }
    }
  }

  /**
   * 格式化模擬結果為易讀的字符串
   */
  static formatResult(hand1Str: string, hand2Str: string, result: SimulationResult): string {
    const lines = [
      '🃏 德州撲克勝率模擬結果',
      '==========================================',
      `手牌對比: ${hand1Str} vs ${hand2Str}`,
      `模擬次數: ${result.totalGames.toLocaleString()} 場`,
      '',
      '結果統計:',
      `${hand1Str} 勝利: ${result.player1Wins.toLocaleString()} 場 (${result.player1WinRate.toFixed(2)}%)`,
      `${hand2Str} 勝利: ${result.player2Wins.toLocaleString()} 場 (${result.player2WinRate.toFixed(2)}%)`,
      `平手: ${result.ties.toLocaleString()} 場 (${result.tieRate.toFixed(2)}%)`,
      '',
      '勝率分析:',
      `${hand1Str} 勝率: ${result.player1WinRate.toFixed(2)}%`,
      `${hand2Str} 勝率: ${result.player2WinRate.toFixed(2)}%`,
      '',
      result.player1WinRate > result.player2WinRate 
        ? `🏆 ${hand1Str} 在長期來看有優勢`
        : result.player2WinRate > result.player1WinRate
        ? `🏆 ${hand2Str} 在長期來看有優勢`
        : '📊 兩手牌實力相當',
      '=========================================='
    ];

    return lines.join('\n');
  }
} 