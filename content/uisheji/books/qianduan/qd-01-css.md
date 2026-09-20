---
title: "第 1 章 · CSS：选择器、盒模型、布局"
type: chapter
cert: "uisheji"
book: "qianduan"
weight: 1
quizChapter: "UI 设计·CSS 基础"
description: "CSS 选择器（类/ID/属性）+ 盒模型（content/padding/border/margin）+ 布局（Flex/Grid/浮动）——"理论"必会。"
---

## 考点梳理

### 1.1 CSS 选择器（**"3 种"**）

| 选择器 | 语法 | 典型场景 |
|--------|------|---------|
| **类选择器** | **`.class`** | **"通用样式"** |
| **ID 选择器** | **`#id`** | **"唯一元素"** |
| **属性选择器** | **`[attr=value]`** | **"特定属性"** |

> **记忆锚**：**".class + #id + [attr]"**（**"3 种"**，**每种 1 行**）。

**优先级**（**"必背"**）：

```text
ID（#） > 类（.） > 标签（div/p） > 通配符（*）
```

> **记忆锚**：**"ID > 类 > 标签 > 通配"**（**"4 级"**，**"必背"**）。

### 1.2 盒模型（**"4 种"**）

**盒模型 4 层**（**"必背"**）：

```text
content（内容）
  → padding（内边距）
    → border（边框）
      → margin（外边距）
```

**计算**（**"必会"**）：

```text
总宽度 = width + padding-left + padding-right + border-left + border-right + margin-left + margin-right
```

> **记忆锚**：**"content + padding + border + margin"**（**"4 层"**，**"从内到外"**）。

**`box-sizing`**（**"2 种"**）：

| 值 | 内容 | 典型场景 |
|----|------|---------|
| **`content-box`**（默认） | **width 只含 content** | **"传统"** |
| **`border-box`** | **width 含 content + padding + border** | **"推荐"** |

> **记忆锚**：**"border-box 推荐"**（**"width 含 padding + border"**，**"布局更直观"**）。

### 1.3 布局（**"3 种"**）

**Flex 布局**（**"1 行/1 列"**）：

| 属性 | 内容 | 典型场景 |
|------|------|---------|
| **`display: flex`** | **开启 Flex** | **"1 行/1 列"** |
| **`justify-content`** | **主轴对齐**（**"start/center/end/space-between"**） | **"水平"** |
| **`align-items`** | **交叉轴对齐**（**"start/center/end/stretch"**） | **"垂直"** |

**Grid 布局**（**"多行多列"**）：

| 属性 | 内容 | 典型场景 |
|------|------|---------|
| **`display: grid`** | **开启 Grid** | **"多行多列"** |
| **`grid-template-columns`** | **列定义**（**"1fr 2fr 1fr"**） | **"3 列"** |
| **`grid-template-rows`** | **行定义**（**"auto 1fr auto"**） | **"3 行"** |

**浮动布局**（**"传统"**）：

| 属性 | 内容 | 典型场景 |
|------|------|---------|
| **`float: left/right`** | **左浮/右浮** | **"传统布局"** |
| **`clear: both`** | **清除浮动** | **"防塌陷"** |

> **记忆锚**：**"Flex（1 行）+ Grid（多行多列）+ 浮动（传统）"**（**"3 种"**，**每种 1 行**）。

## 🧠 记忆工具箱

### 口诀速记

- 选择器：**".class + #id + [attr]"**（**"3 种"**）；
- 优先级：**"ID > 类 > 标签 > 通配"**（**"4 级"**）；
- 盒模型：**"content + padding + border + margin"**（**"4 层"**）；
- 布局：**"Flex 1 行，Grid 多行多列，浮动传统"**（**"3 种"**）。

### 场景锚点

- CSS 想象"**"装修"**"：你**不是"住户"**（**不需要"住"**），**你是"装修工"**（**"装修"**）——**"选择器"**是**"定位房间"**（**".class = 所有卧室，#id = 主卧"**），**"盒模型"**是**"房间结构"**（**"content = 家具，padding = 地毯，border = 墙，margin = 走廊"**），**"布局"**是**"房间排列"**（**"Flex = 一排，Grid = 矩阵"**）。

## ⚠️ 易错提醒

- **选择器"优先级"**：**"ID > 类 > 标签 > 通配"**（**"4 级"**）——**"ID 最强，通配最弱"**；
- **盒模型"4 层"**：**"content + padding + border + margin"**（**"从内到外"**）——**"margin 是外边距，不属于盒子"**；
- **`box-sizing`**：**"border-box 推荐"**（**"width 含 padding + border"**）——**"content-box 是默认，布局易错"**；
- **布局"3 种"**：**"Flex（1 行）+ Grid（多行多列）+ 浮动（传统）"**（**"Flex 更灵活，Grid 更强大"**）。
