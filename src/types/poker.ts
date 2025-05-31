export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades'
}

export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A'
}

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface HandEvaluation {
  handStrength: string;
  description: string;
}

export interface OutsCalculation {
  outs: number;
  turnProbability: number;
  riverProbability: number;
  turnAndRiverProbability: number;
  percentageOnTurn: string;
  percentageOnRiver: string;
  percentageTotal: string;
  odds: string;
}

export interface PokerScenario {
  name: string;
  description: string;
  holeCards: Card[];
  communityCards: Card[];
  targetHand: string;
  outs: number;
}

export interface ComparisonResult {
  scenario: PokerScenario;
  calculation: OutsCalculation;
  rank: number;
} 