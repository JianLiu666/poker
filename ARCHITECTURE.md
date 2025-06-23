# 🏗️ 專案架構 - Project Architecture

## 📋 概述 Overview

此專案已從一個快速測試的 POC/MVP 重構為一個可維護和可擴展的撲克 outs 計算器。新架構採用模組化設計，支援 CLI 命令系統和程式化 API。

## 🎯 設計目標 Design Goals

1. **可維護性 (Maintainability)**: 清晰的模組分離和職責劃分
2. **可擴展性 (Extensibility)**: 易於添加新命令和功能
3. **可用性 (Usability)**: 同時支援 CLI 和程式化使用
4. **一致性 (Consistency)**: 統一的錯誤處理和輸出格式

## 📁 目錄結構 Directory Structure

```
src/
├── cli/                    # CLI 命令系統
│   ├── commands/          # 個別命令實作
│   │   ├── comparison-command.ts    # 比較表命令
│   │   ├── analysis-command.ts      # 詳細分析命令
│   │   ├── scenarios-command.ts     # 場景分析命令
│   │   ├── pot-odds-command.ts      # 底池賠率命令
│   │   └── reference-command.ts     # 快速參考命令
│   ├── base-command.ts             # 抽象基礎命令類
│   ├── command-registry.ts         # 命令註冊管理器
│   ├── argument-parser.ts          # 參數解析器
│   └── cli.ts                      # 主要 CLI 協調器
├── types/                 # TypeScript 型別定義
│   └── poker.ts
├── utils/                 # 核心計算工具
│   ├── poker-calculator.ts
│   └── display-formatter.ts
├── scenarios/             # 預定義撲克場景
│   └── poker-scenarios.ts
├── index.ts              # 主要函式庫入口點
└── demo.ts               # 完整功能展示

examples/
├── simple-usage.ts       # 基本函式庫使用
└── cli-usage.ts          # CLI 和程式化範例
```

## 🔧 核心組件 Core Components

### 1. CLI 系統 (CLI System)

#### BaseCommand (基礎命令類)
- 所有命令的抽象基礎類別
- 提供統一的接口和通用功能
- 包含錯誤處理、日誌和幫助顯示

#### CommandRegistry (命令註冊器)
- 管理所有可用命令
- 提供命令註冊和查找功能
- 支援動態命令列表顯示

#### ArgumentParser (參數解析器)
- 解析命令行參數
- 支援不同命令的特定參數格式
- 處理幫助標誌和錯誤驗證

#### PokerCLI (主要 CLI 類)
- 協調所有 CLI 組件
- 處理命令執行流程
- 提供預設幫助和錯誤處理

### 2. 命令實作 (Command Implementations)

每個命令都是 `BaseCommand` 的具體實作：

- **ComparisonCommand**: 顯示 outs 比較表
- **AnalysisCommand**: 提供特定 outs 的詳細分析
- **ScenariosCommand**: 展示實戰撲克場景
- **PotOddsCommand**: 分析底池賠率決策
- **ReferenceCommand**: 顯示快速參考指南

### 3. 核心函式庫 (Core Library)

- **PokerOutsCalculator**: 核心計算邏輯
- **DisplayFormatter**: 輸出格式化
- **PokerScenarios**: 場景管理
- **Type Definitions**: TypeScript 型別定義

## 🚀 使用方式 Usage Patterns

### 1. CLI 模式 (CLI Mode)
```bash
npm run cli                        # 顯示所有命令
npm run cli comparison            # 運行特定命令
npm run cli analysis 9            # 帶參數的命令
```

### 2. 程式化使用 (Programmatic Usage)
```typescript
import { PokerCLI, PokerOutsCalculator } from 'poker-outs-calculator';

// CLI 程式化使用
const cli = new PokerCLI();
await cli.run(['analysis', '9']);

// 直接函式庫使用
const result = PokerOutsCalculator.calculateOutsProbability(9);
```

### 3. 開發模式 (Development Mode)
- `npm run dev`: 運行基本 demo
- `npm run demo`: 完整功能展示
- `npm run example`: 基本使用範例
- `npm run example:cli`: CLI 使用範例

## 🔄 擴展性 Extensibility

### 添加新命令 Adding New Commands

1. 在 `src/cli/commands/` 創建新命令檔案
2. 繼承 `BaseCommand` 類別
3. 實作必要的方法和屬性
4. 在 `CommandRegistry` 中註冊新命令
5. 在 `ArgumentParser` 中添加參數解析邏輯（如需要）

範例：
```typescript
export class NewCommand extends BaseCommand {
  readonly name = 'new-command';
  readonly description = '新命令描述';
  readonly usage = 'poker new-command <args>';

  execute(options: CommandOptions): void {
    // 實作命令邏輯
  }
}
```

### 添加新功能 Adding New Features

1. 在相應的 util 類別中添加新方法
2. 更新型別定義（如需要）
3. 創建或更新相關命令
4. 添加測試和範例

## 📦 建置和部署 Build and Deployment

### 開發環境 Development
```bash
npm install           # 安裝依賴
npm run dev          # 開發模式
npm run cli          # CLI 模式
```

### 生產環境 Production
```bash
npm run build        # 編譯 TypeScript
npm start            # 運行編譯版本
```

### 腳本說明 Script Descriptions
- `build`: 編譯 TypeScript 到 `dist/`
- `start`: 運行編譯後的主檔案
- `dev`: 開發模式運行主檔案
- `cli`: 運行 CLI 介面
- `demo`: 完整功能展示
- `example`: 基本使用範例
- `example:cli`: CLI 使用範例
- `clean`: 清理建置目錄

## 🎨 設計模式 Design Patterns

### 1. 命令模式 (Command Pattern)
- 每個 CLI 命令都是獨立的類別
- 統一的執行介面
- 易於測試和擴展

### 2. 註冊器模式 (Registry Pattern)
- 中央化的命令管理
- 動態命令註冊和查找

### 3. 模板方法模式 (Template Method Pattern)
- `BaseCommand` 定義通用流程
- 具體命令實作特定邏輯

### 4. 策略模式 (Strategy Pattern)
- 不同的參數解析策略
- 可擴展的命令執行策略

## 🔮 未來改進 Future Improvements

1. **配置系統**: 支援配置檔案和環境變數
2. **插件系統**: 支援第三方命令插件
3. **互動模式**: 支援互動式 CLI 介面
4. **API 模式**: 提供 RESTful API 介面
5. **Web 介面**: 提供網頁版計算器
6. **測試覆蓋**: 添加完整的單元測試和整合測試

## 📄 相關文件 Related Documentation

- [README.md](./README.md): 專案概述和使用說明
- [examples/](./examples/): 使用範例
- [src/types/poker.ts](./src/types/poker.ts): 型別定義
- [package.json](./package.json): 專案配置和腳本

---

此架構設計確保專案從 POC 轉變為一個可持續發展的專業工具，同時保持高度的可維護性和可擴展性。 