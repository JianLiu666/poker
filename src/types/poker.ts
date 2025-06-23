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

// 新增的模擬相關類型
export enum HandRank {
  HIGH_CARD = 1,
  PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10
}

export interface HandStrength {
  rank: HandRank;
  value: number;
  description: string;
  cards: Card[];
}

export interface HoleCards {
  card1: Card;
  card2: Card;
}

export interface GameResult {
  winner: number; // 0 = 第一個玩家, 1 = 第二個玩家, -1 = 平手
  player1Hand: HandStrength;
  player2Hand: HandStrength;
  communityCards: Card[];
}

export interface SimulationResult {
  player1Wins: number;
  player2Wins: number;
  ties: number;
  totalGames: number;
  player1WinRate: number;
  player2WinRate: number;
  tieRate: number;
} 