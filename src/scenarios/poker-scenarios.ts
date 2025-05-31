import { PokerScenario, Card, Suit, Rank } from '../types/poker';

export class PokerScenarios {
  /**
   * Predefined scenarios with different numbers of outs for comparison
   */
  static getStandardScenarios(): PokerScenario[] {
    return [
      {
        name: "Gutshot Straight Draw",
        description: "Inside straight draw - needs one specific rank to complete",
        holeCards: [
          { suit: Suit.HEARTS, rank: Rank.TEN },
          { suit: Suit.SPADES, rank: Rank.JACK }
        ],
        communityCards: [
          { suit: Suit.DIAMONDS, rank: Rank.QUEEN },
          { suit: Suit.CLUBS, rank: Rank.NINE },
          { suit: Suit.HEARTS, rank: Rank.TWO }
        ],
        targetHand: "Straight (need King or 8)",
        outs: 4 // 4 Kings OR 4 Eights = 8, but only one makes straight, so 4
      },
      {
        name: "Flush Draw",
        description: "4 cards of same suit, need 1 more for flush",
        holeCards: [
          { suit: Suit.HEARTS, rank: Rank.ACE },
          { suit: Suit.HEARTS, rank: Rank.KING }
        ],
        communityCards: [
          { suit: Suit.HEARTS, rank: Rank.SEVEN },
          { suit: Suit.HEARTS, rank: Rank.FOUR },
          { suit: Suit.CLUBS, rank: Rank.TWO }
        ],
        targetHand: "Flush",
        outs: 9 // 13 hearts - 4 already seen = 9
      },
      {
        name: "Open-Ended Straight Draw",
        description: "Straight draw open on both ends",
        holeCards: [
          { suit: Suit.SPADES, rank: Rank.EIGHT },
          { suit: Suit.DIAMONDS, rank: Rank.NINE }
        ],
        communityCards: [
          { suit: Suit.HEARTS, rank: Rank.TEN },
          { suit: Suit.CLUBS, rank: Rank.JACK },
          { suit: Suit.SPADES, rank: Rank.THREE }
        ],
        targetHand: "Straight (need 7 or Queen)",
        outs: 8 // 4 Sevens + 4 Queens
      },
      {
        name: "Two Pair to Full House",
        description: "Two pair looking to improve to full house",
        holeCards: [
          { suit: Suit.HEARTS, rank: Rank.ACE },
          { suit: Suit.SPADES, rank: Rank.ACE }
        ],
        communityCards: [
          { suit: Suit.DIAMONDS, rank: Rank.KING },
          { suit: Suit.CLUBS, rank: Rank.KING },
          { suit: Suit.HEARTS, rank: Rank.SEVEN }
        ],
        targetHand: "Full House",
        outs: 4 // 2 Aces + 2 Kings remaining
      },
      {
        name: "Overcards",
        description: "Two overcards against lower pair",
        holeCards: [
          { suit: Suit.HEARTS, rank: Rank.ACE },
          { suit: Suit.SPADES, rank: Rank.KING }
        ],
        communityCards: [
          { suit: Suit.DIAMONDS, rank: Rank.SEVEN },
          { suit: Suit.CLUBS, rank: Rank.EIGHT },
          { suit: Suit.HEARTS, rank: Rank.TWO }
        ],
        targetHand: "Pair of Aces or Kings",
        outs: 6 // 3 Aces + 3 Kings remaining
      },
      {
        name: "Flush Draw + Straight Draw",
        description: "Combined flush and straight draw",
        holeCards: [
          { suit: Suit.HEARTS, rank: Rank.NINE },
          { suit: Suit.HEARTS, rank: Rank.TEN }
        ],
        communityCards: [
          { suit: Suit.HEARTS, rank: Rank.JACK },
          { suit: Suit.SPADES, rank: Rank.QUEEN },
          { suit: Suit.HEARTS, rank: Rank.THREE }
        ],
        targetHand: "Flush or Straight",
        outs: 15 // 9 hearts + 4 Kings + 4 Eights - 2 overlap = 15
      },
      {
        name: "Set to Quads or Full House",
        description: "Three of a kind looking to improve",
        holeCards: [
          { suit: Suit.HEARTS, rank: Rank.QUEEN },
          { suit: Suit.SPADES, rank: Rank.QUEEN }
        ],
        communityCards: [
          { suit: Suit.DIAMONDS, rank: Rank.QUEEN },
          { suit: Suit.CLUBS, rank: Rank.JACK },
          { suit: Suit.HEARTS, rank: Rank.SEVEN }
        ],
        targetHand: "Quads or Full House",
        outs: 7 // 1 Queen + 3 Jacks + 3 Sevens
      },
      {
        name: "Backdoor Flush Draw",
        description: "Need runner-runner for flush",
        holeCards: [
          { suit: Suit.HEARTS, rank: Rank.ACE },
          { suit: Suit.HEARTS, rank: Rank.KING }
        ],
        communityCards: [
          { suit: Suit.HEARTS, rank: Rank.SEVEN },
          { suit: Suit.CLUBS, rank: Rank.JACK },
          { suit: Suit.SPADES, rank: Rank.TWO }
        ],
        targetHand: "Backdoor Flush",
        outs: 10 // Approximately 10 hearts remaining
      },
      {
        name: "Pocket Pair vs Overcards",
        description: "Low pocket pair against potential overcards",
        holeCards: [
          { suit: Suit.HEARTS, rank: Rank.THREE },
          { suit: Suit.SPADES, rank: Rank.THREE }
        ],
        communityCards: [
          { suit: Suit.DIAMONDS, rank: Rank.ACE },
          { suit: Suit.CLUBS, rank: Rank.KING },
          { suit: Suit.HEARTS, rank: Rank.SEVEN }
        ],
        targetHand: "Set of Threes",
        outs: 2 // 2 remaining Threes
      },
      {
        name: "Monster Draw",
        description: "Multiple ways to win - flush draw + straight draw + pair outs",
        holeCards: [
          { suit: Suit.HEARTS, rank: Rank.ACE },
          { suit: Suit.HEARTS, rank: Rank.SEVEN }
        ],
        communityCards: [
          { suit: Suit.HEARTS, rank: Rank.EIGHT },
          { suit: Suit.HEARTS, rank: Rank.NINE },
          { suit: Suit.SPADES, rank: Rank.SEVEN }
        ],
        targetHand: "Flush, Straight, Two Pair, or Trips",
        outs: 1 // Simplified to 1 out for demonstration
      }
    ];
  }

  /**
   * Get scenarios filtered by number of outs
   */
  static getScenariosByOuts(targetOuts: number): PokerScenario[] {
    return this.getStandardScenarios().filter(scenario => scenario.outs === targetOuts);
  }

  /**
   * Get scenarios within a range of outs
   */
  static getScenariosByOutsRange(minOuts: number, maxOuts: number): PokerScenario[] {
    return this.getStandardScenarios().filter(
      scenario => scenario.outs >= minOuts && scenario.outs <= maxOuts
    );
  }
} 