# 🃏 PokerCraft 日誌分析系統

本系統為您的撲克項目添加了完整的 PokerCraft 日誌解析和分析功能，專門針對 Natural8 Rush & Cash NL10 遊戲數據進行優化。

## 🚀 功能特色

### 📖 日誌解析
- **多格式支持**: 支持 PokerCraft 導出的各種日誌格式
- **智能解析**: 自動識別手牌、玩家、動作、攤牌等信息
- **錯誤處理**: 優雅處理格式錯誤，跳過無效數據
- **驗證功能**: 提供日誌格式驗證，確保數據完整性

### 💾 數據庫存儲
- **SQLite 支持**: 輕量級本地數據庫，無需額外配置
- **完整 Schema**: 包含手牌、玩家、動作、攤牌、獲勝者等完整表結構
- **索引優化**: 針對查詢性能進行優化的索引設計
- **預定義視圖**: 提供方便的統計查詢視圖

### 📊 統計分析
- **總覽統計**: 總手牌數、勝率、淨收益、BB/100 等關鍵指標
- **會話分析**: 按日期分組的會話統計和趨勢分析
- **位置統計**: 不同位置的表現分析
- **實時計算**: 動態計算各種撲克統計指標

### 📈 圖表生成
- **收益曲線**: 美觀的累積收益曲線圖
- **會話圖表**: 每日收益條形圖
- **位置分析**: 位置收益分布圖
- **互動式圖表**: 基於 Chart.js 的現代化圖表界面

## 🛠️ 安裝和設置

### 1. 安裝依賴
```bash
npm install
```

### 2. 準備數據
將您的 PokerCraft 日誌文件放到項目目錄中，或記住文件路徑。

## 📋 使用方法

### CLI 命令

#### 1. 導入日誌文件
```bash
# 基本導入
npm run cli import your-pokercraft-log.txt

# 指定數據庫路徑
npm run cli import hands.txt --database ./nl10-data.db

# 僅驗證格式，不導入數據庫
npm run cli import hands.txt --validate
```

#### 2. 查看統計報告
```bash
# 總覽統計
npm run cli stats

# 會話統計
npm run cli stats --report sessions

# 位置統計
npm run cli stats --report positions

# 所有報告
npm run cli stats --report all

# 使用指定數據庫
npm run cli stats --database ./nl10-data.db
```

#### 3. 生成圖表
```bash
# 生成收益曲線圖
npm run cli chart

# 生成會話統計圖
npm run cli chart --type sessions

# 生成位置統計圖
npm run cli chart --type positions

# 生成所有圖表
npm run cli chart --type all --output ./my-charts.html

# 使用指定數據庫
npm run cli chart --database ./nl10-data.db
```

### 程式化使用

```typescript
import { PokerCraftParser, PokerDatabase } from 'poker-outs-calculator';

// 解析日誌文件
const hands = await PokerCraftParser.parseLogFile('your-log.txt');

// 初始化數據庫
const database = new PokerDatabase('./poker-data.db');
await database.initialize();
await database.initializeSchema();

// 批量插入手牌
await database.insertHands(hands);

// 獲取統計信息
const stats = await database.getGameStats();
const sessions = await database.getSessionStats();
const positions = await database.getPositionStats();

await database.close();
```

## 📊 支持的統計指標

### 總覽統計
- **總手牌數**: 分析的手牌總數
- **獲勝/失敗手牌**: 勝負手牌統計
- **淨收益**: 總收益減去總損失
- **勝率**: 獲勝手牌百分比
- **BB/100**: 每100手的大盲注收益

### 會話統計
- **日期**: 遊戲日期
- **手牌數**: 該日遊戲手牌數
- **收益**: 該日淨收益
- **BB/100**: 該日每100手收益率

### 位置統計
- **位置**: 座位位置（1-6）
- **手牌數**: 該位置遊戲手牌數
- **收益**: 該位置總收益
- **勝率**: 該位置勝率

## 🎨 圖表功能

### 收益曲線圖
- **累積收益**: 時間序列的累積收益曲線
- **每日收益**: 每日收益條形圖（綠色盈利，紅色虧損）
- **BB/100 趨勢**: BB/100 指標的趨勢線
- **統計摘要**: 關鍵統計指標的儀表板

### 會話圖表
- **會話收益**: 每次會話的收益條形圖
- **顏色編碼**: 盈利會話綠色，虧損會話紅色

### 位置圖表
- **位置收益**: 各位置的收益分布
- **性能比較**: 不同位置的表現對比

## 📁 數據庫結構

### 主要表格
- **hands**: 手牌基本信息
- **players**: 每手牌的玩家信息
- **actions**: 玩家動作記錄
- **showdowns**: 攤牌信息
- **winners**: 獲勝者信息

### 預定義視圖
- **hero_hands**: 英雄手牌視圖
- **hand_summary**: 手牌摘要視圖
- **session_stats**: 會話統計視圖
- **position_stats**: 位置統計視圖

## 🔧 配置選項

### 數據庫配置
- **默認路徑**: `./poker_data.db`
- **自定義路徑**: 使用 `--database` 參數指定
- **內存數據庫**: 使用 `:memory:` 進行臨時分析

### 圖表配置
- **默認輸出**: `./poker_charts.html`
- **自定義輸出**: 使用 `--output` 參數指定
- **圖表類型**: winnings, sessions, positions, all

## 🎯 使用場景

### 1. 日常分析
```bash
# 每日導入新的遊戲記錄
npm run cli import today-hands.txt

# 查看最新統計
npm run cli stats --report all

# 生成最新圖表
npm run cli chart --type all
```

### 2. 深度分析
```bash
# 創建專門的分析數據庫
npm run cli import all-hands.txt --database ./deep-analysis.db

# 生成詳細報告
npm run cli stats --database ./deep-analysis.db --report all

# 生成完整圖表
npm run cli chart --database ./deep-analysis.db --type all --output ./analysis-charts.html
```

### 3. 多注額分析
```bash
# NL10 數據
npm run cli import nl10-hands.txt --database ./nl10.db

# NL25 數據
npm run cli import nl25-hands.txt --database ./nl25.db

# 分別分析
npm run cli stats --database ./nl10.db
npm run cli stats --database ./nl25.db
```

## 📈 範例輸出

### 統計報告示例
```
📊 撲克統計報告 (6000 手牌)
═══════════════════════════════════════════════════════════

🎯 總覽統計:
────────────────────────────────────────
總手牌數: 6,000
獲勝手牌: 2,850 (47.50%)
失敗手牌: 3,150 (52.50%)
淨收益: $125.50
BB/100: 2.09
收益狀態: 🟢 盈利
每手平均: $0.0209

📅 會話統計:
────────────────────────────────────────
最近 10 次會話:
日期        手牌數  收益      BB/100
────────────────────────────────────────
2024-01-15    250  🟢$15.50    6.20
2024-01-14    180  🔴$-8.20   -4.56
2024-01-13    220  🟢$22.10   10.05
...
```

### 圖表示例
生成的 HTML 圖表包含：
- 響應式設計，適配各種設備
- 互動式圖表，支持縮放和懸停
- 專業的視覺設計
- 完整的統計摘要

## 🚀 高級功能

### 1. 批量處理
```bash
# 處理多個文件
for file in *.txt; do
  npm run cli import "$file" --database ./combined.db
done

# 生成合併報告
npm run cli stats --database ./combined.db --report all
```

### 2. 自動化分析
```bash
#!/bin/bash
# 自動化分析腳本
npm run cli import daily-hands.txt
npm run cli stats --report all > daily-report.txt
npm run cli chart --type all --output daily-charts.html
```

### 3. 數據驗證
```bash
# 驗證數據完整性
npm run cli import hands.txt --validate

# 檢查解析結果
npm run example:pokercraft
```

## 🔍 故障排除

### 常見問題

1. **解析失敗**
   - 檢查日誌文件格式
   - 使用 `--validate` 參數驗證
   - 查看錯誤日誌

2. **數據庫錯誤**
   - 確保有寫入權限
   - 檢查磁盤空間
   - 驗證 SQLite 安裝

3. **圖表生成失敗**
   - 確保有數據
   - 檢查輸出路徑權限
   - 驗證瀏覽器支持

### 調試模式
```bash
# 啟用詳細日誌
NODE_ENV=debug npm run cli import hands.txt

# 使用內存數據庫測試
npm run cli import hands.txt --database :memory:
```

## 📚 更多資源

- [主要 README](./README.md) - 項目總覽
- [架構文檔](./ARCHITECTURE.md) - 技術架構
- [示例代碼](./examples/) - 使用示例
- [API 文檔](./src/types/poker.ts) - 類型定義

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改進這個系統！

## 📄 授權

MIT License - 詳見 [LICENSE](./LICENSE) 文件。

---

**享受您的撲克分析之旅！** 🎰✨ 