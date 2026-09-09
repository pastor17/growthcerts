---
title: "速记卡 2 · 计算公式"
type: chapter
cert: "ruanjian-kaoshi"
book: "suji-shouce"
weight: 2
quizChapter: "速记·计算公式"
description: "网络图（关键路径/总浮动/压缩）、挣值（SV/CV/SPI/CPI/EAC）、沟通渠道、EMV 一卡速算。"
---

## 一卡背诵

**网络图**
- 关键路径＝**最长路径**＝总浮动最小 → 决定最短工期；
- 总浮动 `TF = LS − ES`（或 LF − EF）；
- 压缩**只压关键路径**活动；压一次**重算全图**（次长路径可能变新关键路径）。

**挣值（EVM）**
- `SV = EV − PV`（进度）、`CV = EV − AC`（成本）——**E 永远被减**；
- `SPI = EV/PV`、`CPI = EV/AC`——**E 永远作分子**，>1 为优；
- 典型偏差 `EAC = BAC ÷ CPI`（按当前效率干完全程）；非典型 `EAC = AC + BAC − EV`。

**其他**
- 沟通渠道：`N(N−1)/2`；EMV 期望值：`概率 × 影响`。

## 🧠 记忆工具箱

做计算题**先默写公式再代数字**（过程分）；考前把六个挣值字母 PV/EV/AC 的关系画一遍。

## ⚠️ 易错提醒

- EV 用"实际完成 % × BAC"，PV 用"计划完成 % × BAC"——别混；
- 问 EAC 先判断题干是"典型"还是"非典型"。
