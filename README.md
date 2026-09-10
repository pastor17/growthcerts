# 考证宝典 · 职业考证备考站

> 按「证书」成体系组织的职业资格考试备考站：**证书百科 → 报考指南 → 大纲教材 → 书籍库 → 题库 → 政策动态**，书籍与题库按章节打通，学一章、练一章。

工程由 [kids-stories（童心灯塔）](https://gohugo.io) 的 Hugo 站点**复制改造**而来（同一套目录范式：`hugo.toml` + `content/` 分层 + 自绘 `layouts/` + `data/` 数据），仅保留骨架与交互范式，全部内容/布局/样式按考证场景重写。

> ⚠️ 当前仓库为**骨架 + 首个打样证书**：`软考 · 系统集成项目管理工程师`。站内报考时间、科目、合格线、书目等为**示例占位**，正式内容务必以各考试官方机构当次发布的通知为准；书籍正文与题目为**原创整理/示例数据**，请勿直接搬运受版权保护的教材原文与官方真题。

---

## 站点特色

- **证书即顶层 section**：每加一个证书 = 复制一个目录，互不干扰；
- **一本书配一套题**：考点精讲章节（`content/<cert>/books/`）与题库（`data/questions/<cert>.json`）通过 `quizChapter` 字段双向打通：
  - 书籍章节页自动显示「本章 N 道配套题 → 开始练习」；
  - 练习/错题页面提供「📖 回看考点」跳回对应章节；
- **题库纯前端 App**（无后端）：章节练习即时判分、模拟考试限时随机组卷、错题本（localStorage，存在本机浏览器）；
- 与 kids-stories 的差异：模板统一使用 **`site.Data`**（`hugo.Data` 需 v0.156+，本站兼容 v0.150 即可）。

## 项目现状（持续扩充中）

站点已上线 **8 个证书体系 · 14 本备考书 · 83 个章节 · 422 道练习题**（全部章节通过 `scripts/audit.py` 检查：结构完整、weight 连续、书↔题双向一致、每题错误项均带原因）：

| 证书体系 | 书籍 | 章节 | 题目 | 学习资源页 |
|---------|------|------|------|-----------|
| 软考·系统集成项目管理工程师 | 3 本（综合知识精讲 / 案例分析 / 考前速记手册） | 29 | 135 | ✅ |
| 教师资格证（小学） | 2 本（综合素质 / 教育教学知识与能力） | 11 | 56 | ✅ |
| 软考高级·信息系统项目管理师 | 1 本（三科通关与论文写作） | 6 | 24 | ✅ |
| PMP 项目管理专业人士 | 1 本（精讲与敏捷混合实战） | 6 | 21 | ✅ |
| 初级会计职称 | 2 本（初级会计实务 / 经济法基础） | 11 | 39 | ✅ |
| 二级建造师 | 3 本（法规 / 施工管理 / 专业工程管理与实务·建筑） | 10 | 40 | ✅ |
| 系统架构设计师（软考高级） | 1 本（架构考点精讲 6 章） | 6 | 20 | ✅ |
| 一级建造师 | 1 本（建设工程经济精讲 4 章） | 4 | 12 | ✅ |

**内容标准**：每章 = 考点梳理 + 记忆工具箱（口诀/图表/对比表）+ 深度精讲（例题带解析、命题角度、背诵卡）+ 易错提醒；每题解析含**错误选项原因**。

**学习资源页**：每个证书均收录**经核验**的 GitHub 备考仓库（核对星标、最近更新、许可证与 README/目录真实性，附下载方式与许可提示），并诚实标注生态薄弱处（教资、会计、建造师开源资源较少）。

**官方动态**：软考（官网 5 条原文）、教师资格（教育部考试院报名流程）、会计（财政部会计财务评价中心）、建造师（住建部/各省提示）均**直连官方来源核验**，未核验不发布。

**后续路线**：① 二建实务增补市政/机电等专业方向；② 各证书题库继续加量至真实考情；③ 可按同样标准新增其他热门证书（软考·系统架构设计师、一级建造师、社会工作者等）。

## 目录结构

```
kaozheng-site/
├── hugo.toml                    # 站点配置（baseURL / params / disableKinds…）
├── archetypes/                  # cert.md / chapter.md / default.md 内容模板
├── content/
│   ├── _index.md                # 首页（模板自动聚合所有证书）
│   ├── about.md                 # 关于页
│   └── ruanjian-kaoshi/         # ★ 一个证书一个顶层目录（软考·系统集成，打样）
│       ├── _index.md            # 证书主页（type: cert）
│       ├── intro.md             # 证书百科（type: guide）
│       ├── exam-guide.md        # 报考指南
│       ├── syllabus.md          # 大纲与教材
│       ├── books/               # 书籍库（type: bookshelf）
│       │   ├── zonghe-zhishi/   # 书① 综合知识·考点精讲（16 章）
│       │   │   ├── _index.md    # 书的信息页（type: book）
│       │   │   └── ch01…ch16.md # 章节（type: chapter，含 quizChapter）
│       │   └── anli-fenxi/      # 书② 案例分析·应试套路（7 章，原创自编情景）
│       │       ├── _index.md
│       │       └── anli-ch01…ch07.md
│       ├── practice/_index.md   # 题库 App 容器（type: practice）
│       └── news/                # 政策动态（type: news / news item 同 type）
├── data/
│   └── questions/ruanjian-kaoshi.json   # ★ 题库数据（文件名=证书目录名；综合知识/案例分析两科共用，subject 区分）
├── layouts/                     # 模板：index / cert / guide / bookshelf /
│   │                            #       book / chapter / practice / news
│   └── partials/                # head header footer scripts cert-nav
│                                #       breadcrumb cert-card book-card
├── assets/
│   ├── css/main.css             # 全站样式（含题库组件）
│   └── js/main.js               # 导航 + 题库 App
├── static/favicon.svg
└── .github/workflows/hugo.yml   # GitHub Pages 自动部署（kaozheng 分支）
```

## 本地运行

前置：Hugo **Extended**（本项目在 v0.150.0 验证；`site.Data` 全版本可用）。

```bash
hugo server -D          # http://localhost:1313/
hugo --minify           # 产物输出到 public/
```

## 新增一个证书（逐步打样）

目标证书很多，建议**一个一个来**，每个证书走同一套流程（参考 `ruanjian-kaoshi/`）：

1. **建目录** `content/<cert-slug>/`，复制 `_index.md` 并按 `archetypes/cert.md` 字段填写（title/field/level/examcycle/emoji/color/official…）；
2. **写三页指南**：`intro.md`（百科）、`exam-guide.md`（报考）、`syllabus.md`（大纲与教材），front matter 用 `type: guide` + `cert: <cert-slug>`；
3. **建书**：`books/_index.md`（书架）+ `books/<book-slug>/_index.md`（书信息，`type: book`），章节文件 `type: chapter`、`weight: n`、`cert`、`book`、`quizChapter: <题库中一致的章节名>`；
4. **建题库**：`practice/_index.md`（一次即可）+ `data/questions/<cert-slug>.json`（数组；字段全小写：`id/chapter/type/difficulty/source/stem/options/answer/analysis`，章节名与 `quizChapter` 严格一致）。题多时建议用脚本从 Excel/数据库生成；
5. **建动态**：`news/_index.md` + `news/*.md`；
6. 本地 `hugo server` 预览，检查：首页卡片统计、书↔题互链、练习/考试/错题流程。

> 首页卡片统计、书籍/章节/题目数、书↔题联动全部**按 content 与 data 自动计算**，新增证书无需改任何模板。

## 内容质量标准（行业领航员模式）

整理任何一个证书时，应以该领域「行业领航员/资深讲师」的标准产出内容，并遵守以下红线：

1. **紧扣考纲与教材**：章节划分、覆盖范围对齐官方考试大纲与最新指定教材；正文是教材知识的**原创重组与讲解**（框架、对比、口诀、易错），不整段照抄原文；
2. **记忆优先、深度与体系**：不只列考点名，要讲清概念内涵、适用场景与常见混淆；**每章必须提供记忆抓手**——「一图速记」（Mermaid 流程图/关系图/矩阵图）＋「口诀/谐音串」＋「生活场景锚点」＋「易混对比表」，让内容看得懂、记得住；结尾统一配「⚠️ 易错提醒」；
3. **题目贴合实际与考纲**：题目风格贴近真实考题（题干情境化、干扰项有迷惑性），难度分级（1–5），覆盖常考计算与辨析；
4. **答案必须准确，错误必须给出原因**：每道题 `analysis` 给出依据；`explain` 字段逐项说明**每个错误选项为什么错**（选非题则说明排除逻辑）；数据文件 `data/questions/<cert>.json` 中每题都需带 `explain`；
5. **动态必须联网核验官方来源**：报考时间、考试时间、合格线、大纲变更等一律以官方原文为准，news 条目必须填写 `sourceName`/`sourceUrl` 并在页面展示；检索/核验不可用时**不发布**未证实信息（宁缺毋假）；
6. **版权红线**：不搬运官方教材大段原文、不直接收录官方历年真题原文；改编/自编题要显著区分于真题。

## 内容约定与版权

- 本站书籍为**原创整理的考点精讲**：请勿整段照抄官方教程；官方教材/大纲以正版最新版为准；
- 题库题目建议自编或基于已过版权期的资料改写，**不要直接搬运官方真题**；
- 报考时间/合格线等政策类信息一律标注"以官方通知为准"；
- 数据文件与内容中的 key 统一**小写**（兼容 `site.Data` 的大小写归并）；
- **记忆图表**：正文用 ```mermaid 代码块写图（流程图/关系图等），站点已自托管 `static/js/mermaid.min.js` 自动渲染，无外网依赖；渲染失败的图会退回显示源码，方便检查语法。

## 部署

仓库采用「**master 占位 + kaozheng 内容**」的双分支结构（与 kids-stories 同模式）：

| 分支 | 内容 | 用途 |
| ---- | ---- | ---- |
| `master` | 占位页（与中国·地大物博占位同模式，可放中医养生等） | 仓库默认展示 |
| `kaozheng` | 本站 Hugo 源码（本工程） | 推送到该分支触发 `.github/workflows/hugo.yml` 构建并发布 GitHub Pages |

流程：

```bash
git checkout kaozheng
git add -A && git commit -m "update"
git push origin kaozheng
```

> `hugo.toml` 的 `baseURL` 已设为 `https://pastor17.github.io/growthcerts/`（项目页）；在仓库 **Settings → Pages → Source** 选 GitHub Actions 即可。

## 版权

© 2026 考证宝典（骨架）。工程范式参考 kids-stories（童心灯塔），模板与样式在此基础上按本主题重写。
