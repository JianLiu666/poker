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

// PokerCraft 日誌解析相關類型
export interface PokerCraftHand {
  handId: string;
  gameType: string;
  stakes: string;
  tableId: string;
  timestamp: Date;
  buttonPosition: number;
  maxPlayers: number;
  players: PokerCraftPlayer[];
  preflop: PokerCraftAction[];
  flop?: PokerCraftAction[];
  turn?: PokerCraftAction[];
  river?: PokerCraftAction[];
  showdown?: PokerCraftShowdown[];
  summary: PokerCraftSummary;
  heroPosition?: number;
  heroCards?: Card[];
  communityCards?: Card[];
  potSize: number;
  rake: number;
}

export interface PokerCraftPlayer {
  name: string;
  position: number;
  stack: number;
  isHero: boolean;
}

export interface PokerCraftAction {
  player: string;
  action: ActionType;
  amount?: number;
  position: number;
  street: Street;
}

export interface PokerCraftShowdown {
  player: string;
  cards: Card[];
  handRank: string;
  position: number;
}

export interface PokerCraftSummary {
  totalPot: number;
  rake: number;
  winners: PokerCraftWinner[];
  board?: Card[];
}

export interface PokerCraftWinner {
  player: string;
  amount: number;
  handDescription?: string;
}

export enum ActionType {
  FOLD = 'fold',
  CHECK = 'check',
  CALL = 'call',
  BET = 'bet',
  RAISE = 'raise',
  ALL_IN = 'all-in',
  POST_SB = 'post-sb',
  POST_BB = 'post-bb',
  POST_ANTE = 'post-ante'
}

export enum Street {
  PREFLOP = 'preflop',
  FLOP = 'flop',
  TURN = 'turn',
  RIVER = 'river'
}

// 數據庫相關類型
export interface DatabaseHand {
  id?: number;
  hand_id: string;
  game_type: string;
  stakes: string;
  table_id: string;
  timestamp: string;
  button_position: number;
  max_players: number;
  pot_size: number;
  rake: number;
  hero_position?: number;
  hero_cards?: string;
  community_cards?: string;
  created_at?: string;
}

export interface DatabasePlayer {
  id?: number;
  hand_id: string;
  name: string;
  position: number;
  stack: number;
  is_hero: boolean;
  created_at?: string;
}

export interface DatabaseAction {
  id?: number;
  hand_id: string;
  player: string;
  action: string;
  amount?: number;
  position: number;
  street: string;
  action_order: number;
  created_at?: string;
}

export interface DatabaseShowdown {
  id?: number;
  hand_id: string;
  player: string;
  cards: string;
  hand_rank: string;
  position: number;
  created_at?: string;
}

// 分析相關類型
export interface GameStats {
  totalHands: number;
  totalWon: number;
  totalLost: number;
  netWinnings: number;
  vpip: number; // Voluntarily Put In Pot
  pfr: number;  // Pre-Flop Raise
  aggression: number;
  winRate: number;
  bb100: number; // Big blinds per 100 hands
}

export interface SessionStats {
  date: string;
  hands: number;
  winnings: number;
  duration?: number;
  bb100: number;
}

export interface PositionStats {
  position: string;
  hands: number;
  winnings: number;
  vpip: number;
  pfr: number;
  winRate: number;
}

export interface HandRange {
  hand: string;
  count: number;
  winnings: number;
  winRate: number;
} 