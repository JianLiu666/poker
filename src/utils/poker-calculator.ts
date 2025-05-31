import { OutsCalculation } from '../types/poker';

export class PokerOutsCalculator {
  private static readonly TOTAL_CARDS = 52;
  private static readonly CARDS_KNOWN_FLOP = 5; // 2 hole + 3 community
  private static readonly CARDS_KNOWN_TURN = 6; // 2 hole + 4 community
  private static readonly UNKNOWN_CARDS_AFTER_FLOP = 47; // 52 - 5
  private static readonly UNKNOWN_CARDS_AFTER_TURN = 46; // 52 - 6

  /**
   * Calculate probabilities for hitting outs after the flop
   */
  static calculateOutsProbability(outs: number): OutsCalculation {
    if (outs < 0 || outs > 47) {
      throw new Error('Outs must be between 0 and 47');
    }

    // Probability of hitting on the turn
    const turnProbability = outs / this.UNKNOWN_CARDS_AFTER_FLOP;
    
    // Probability of NOT hitting on turn
    const missOnTurn = (this.UNKNOWN_CARDS_AFTER_FLOP - outs) / this.UNKNOWN_CARDS_AFTER_FLOP;
    
    // Probability of hitting on the river (given miss on turn)
    const riverProbability = outs / this.UNKNOWN_CARDS_AFTER_TURN;
    
    // Probability of hitting on turn OR river
    const turnAndRiverProbability = turnProbability + (missOnTurn * riverProbability);

    // Convert to percentages
    const percentageOnTurn = (turnProbability * 100).toFixed(2);
    const percentageOnRiver = (riverProbability * 100).toFixed(2);
    const percentageTotal = (turnAndRiverProbability * 100).toFixed(2);

    // Calculate odds (against hitting)
    const oddsAgainst = (1 - turnAndRiverProbability) / turnAndRiverProbability;
    const odds = `${oddsAgainst.toFixed(2)}:1 against`;

    return {
      outs,
      turnProbability,
      riverProbability,
      turnAndRiverProbability,
      percentageOnTurn,
      percentageOnRiver,
      percentageTotal,
      odds
    };
  }

  /**
   * Calculate all outs from 1 to maxOuts for comparison
   */
  static calculateOutsRange(maxOuts: number = 10): OutsCalculation[] {
    const results: OutsCalculation[] = [];
    
    for (let i = 1; i <= maxOuts; i++) {
      results.push(this.calculateOutsProbability(i));
    }
    
    return results;
  }

  /**
   * Get the "Rule of 4 and 2" approximation for comparison
   * Rule of 4: Multiply outs by 4 for turn + river probability
   * Rule of 2: Multiply outs by 2 for single card probability
   */
  static getRuleOfFourAndTwo(outs: number): { ruleOfFour: string; ruleOfTwo: string } {
    const ruleOfFour = (outs * 4).toFixed(1);
    const ruleOfTwo = (outs * 2).toFixed(1);
    
    return {
      ruleOfFour: `${ruleOfFour}%`,
      ruleOfTwo: `${ruleOfTwo}%`
    };
  }

  /**
   * Calculate pot odds needed to call
   */
  static calculatePotOdds(potSize: number, betSize: number): string {
    const totalPot = potSize + betSize;
    const odds = totalPot / betSize;
    return `${odds.toFixed(2)}:1`;
  }

  /**
   * Determine if a call is profitable based on outs and pot odds
   */
  static isCallProfitable(outs: number, potSize: number, betSize: number): boolean {
    const calculation = this.calculateOutsProbability(outs);
    const winProbability = calculation.turnAndRiverProbability;
    const potOdds = (potSize + betSize) / betSize;
    const requiredWinRate = 1 / potOdds;
    
    return winProbability >= requiredWinRate;
  }
} 