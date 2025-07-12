-- PokerCraft 數據庫 Schema
-- 用於存儲 Natural8 Rush & Cash NL10 遊戲數據

-- 手牌表 - 存儲每手牌的基本信息
CREATE TABLE IF NOT EXISTS hands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hand_id TEXT UNIQUE NOT NULL,
    game_type TEXT NOT NULL,
    stakes TEXT NOT NULL,
    table_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    button_position INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    pot_size REAL NOT NULL,
    rake REAL NOT NULL,
    hero_position INTEGER,
    hero_cards TEXT,
    community_cards TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 玩家表 - 存儲每手牌中的玩家信息
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hand_id TEXT NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    stack REAL NOT NULL,
    is_hero BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hand_id) REFERENCES hands(hand_id)
);

-- 動作表 - 存儲每個玩家的動作
CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hand_id TEXT NOT NULL,
    player TEXT NOT NULL,
    action TEXT NOT NULL,
    amount REAL,
    position INTEGER NOT NULL,
    street TEXT NOT NULL,
    action_order INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hand_id) REFERENCES hands(hand_id)
);

-- 攤牌表 - 存儲攤牌時的手牌信息
CREATE TABLE IF NOT EXISTS showdowns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hand_id TEXT NOT NULL,
    player TEXT NOT NULL,
    cards TEXT NOT NULL,
    hand_rank TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hand_id) REFERENCES hands(hand_id)
);

-- 獲勝者表 - 存儲每手牌的獲勝者信息
CREATE TABLE IF NOT EXISTS winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hand_id TEXT NOT NULL,
    player TEXT NOT NULL,
    amount REAL NOT NULL,
    hand_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hand_id) REFERENCES hands(hand_id)
);

-- 索引優化查詢性能
CREATE INDEX IF NOT EXISTS idx_hands_timestamp ON hands(timestamp);
CREATE INDEX IF NOT EXISTS idx_hands_hero_position ON hands(hero_position);
CREATE INDEX IF NOT EXISTS idx_hands_stakes ON hands(stakes);
CREATE INDEX IF NOT EXISTS idx_players_hand_id ON players(hand_id);
CREATE INDEX IF NOT EXISTS idx_players_is_hero ON players(is_hero);
CREATE INDEX IF NOT EXISTS idx_actions_hand_id ON actions(hand_id);
CREATE INDEX IF NOT EXISTS idx_actions_street ON actions(street);
CREATE INDEX IF NOT EXISTS idx_showdowns_hand_id ON showdowns(hand_id);
CREATE INDEX IF NOT EXISTS idx_winners_hand_id ON winners(hand_id);

-- 視圖 - 方便查詢的預定義視圖
CREATE VIEW IF NOT EXISTS hero_hands AS
SELECT 
    h.*,
    p.name as hero_name,
    p.stack as hero_stack
FROM hands h
JOIN players p ON h.hand_id = p.hand_id
WHERE p.is_hero = TRUE;

CREATE VIEW IF NOT EXISTS hand_summary AS
SELECT 
    h.hand_id,
    h.timestamp,
    h.stakes,
    h.pot_size,
    h.rake,
    h.hero_position,
    h.hero_cards,
    h.community_cards,
    COUNT(DISTINCT p.name) as player_count,
    SUM(CASE WHEN w.player = (SELECT name FROM players WHERE hand_id = h.hand_id AND is_hero = TRUE) THEN w.amount ELSE 0 END) as hero_winnings
FROM hands h
LEFT JOIN players p ON h.hand_id = p.hand_id
LEFT JOIN winners w ON h.hand_id = w.hand_id
GROUP BY h.hand_id;

-- 統計視圖
CREATE VIEW IF NOT EXISTS session_stats AS
SELECT 
    DATE(timestamp) as session_date,
    COUNT(*) as hands_played,
    SUM(CASE WHEN hero_winnings > 0 THEN hero_winnings ELSE 0 END) as total_won,
    SUM(CASE WHEN hero_winnings < 0 THEN ABS(hero_winnings) ELSE 0 END) as total_lost,
    SUM(hero_winnings) as net_winnings,
    AVG(hero_winnings) as avg_winnings_per_hand,
    (SUM(hero_winnings) / COUNT(*)) * 100 as bb_per_100_hands
FROM hand_summary
GROUP BY DATE(timestamp)
ORDER BY session_date DESC;

CREATE VIEW IF NOT EXISTS position_stats AS
SELECT 
    hero_position,
    COUNT(*) as hands_played,
    SUM(hero_winnings) as total_winnings,
    AVG(hero_winnings) as avg_winnings,
    SUM(CASE WHEN hero_winnings > 0 THEN 1 ELSE 0 END) as hands_won,
    (SUM(CASE WHEN hero_winnings > 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as win_rate
FROM hand_summary
WHERE hero_position IS NOT NULL
GROUP BY hero_position
ORDER BY hero_position; 