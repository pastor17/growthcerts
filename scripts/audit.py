#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
内容质量审计脚本（供"一个一个加证书"时一键自检）。

用法：
    python3 scripts/audit.py                  # 默认审计 ruanjian-kaoshi
    python3 scripts/audit.py <cert-slug>      # 审计指定证书

检查项：
  1) 证书主页 content/<slug>/_index.md 存在且 type: cert；
  2) 题库文件 data/questions/<slug>.json 存在且为合法 JSON；
  3) 每个书内章节 type: chapter，且 body 含「考点梳理/答题框架…」「记忆工具箱」「易错提醒」；
  4) 每本书的 weight 从 1 起连续、不重复；
  5) 题目：id 唯一；错误选项均给出 explain 原因；quizChapter/章节名与题库 chapter 双向无孤儿；
  6) 每章至少 1 道配套题。
"""
import json
import os
import re
import sys

SLUG = sys.argv[1] if len(sys.argv) > 1 else "ruanjian-kaoshi"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors = []
warns = []


def fm(path):
    """简易 front matter 解析：返回 (params dict, body)。"""
    head = open(path, encoding="utf-8").read()
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", head, re.S)
    if not m:
        return {}, head
    params = {}
    for line in m.group(1).splitlines():
        kv = re.match(r'^([A-Za-z_]+):\s*"?(.*?)"?\s*$', line)
        if kv:
            params[kv.group(1)] = kv.group(2)
    return params, m.group(2)


def check(cond, msg):
    if not cond:
        errors.append(msg)


# 1) 证书主页
idx = os.path.join(ROOT, "content", SLUG, "_index.md")
if not os.path.exists(idx):
    errors.append(f"缺少证书主页 content/{SLUG}/_index.md")
else:
    p, _ = fm(idx)
    check(p.get("type") in ("cert", "guidehome"),
          f"{SLUG}/_index.md 的 type 应为 cert 或 guidehome（指南型栏目）")

# 2) 题库文件
qpath = os.path.join(ROOT, "data", "questions", f"{SLUG}.json")
if not os.path.exists(qpath):
    errors.append(f"缺少题库 data/questions/{SLUG}.json")
    bank = []
else:
    try:
        bank = json.load(open(qpath, encoding="utf-8"))
    except Exception as e:
        errors.append(f"题库 JSON 解析失败: {e}")
        bank = []

# 3) 收集章节
chapters = {}   # quizChapter -> {title, book, file}
books = {}      # book -> {title, weights:[]}
for dirpath, _, files in os.walk(os.path.join(ROOT, "content", SLUG, "books")):
    for fn in files:
        if not fn.endswith(".md"):
            continue
        path = os.path.join(dirpath, fn)
        p, body = fm(path)
        t = p.get("type")
        if t == "book":
            books.setdefault(os.path.basename(dirpath), {"title": p.get("title", "?"), "weights": []})
        elif t == "chapter":
            qc = p.get("quizChapter", "")
            if not qc:
                errors.append(f"{path} 缺少 quizChapter")
                continue
            chapters[qc] = {"title": p.get("title", "?"), "book": p.get("book", "?"),
                            "file": os.path.relpath(path, ROOT)}
            for marker in ("记忆工具箱", "易错提醒"):
                if marker not in body:
                    errors.append(f"{os.path.relpath(path, ROOT)} 缺少「{marker}」段落")
            head_marker = any(k in body for k in ("考点梳理", "答题框架", "高频错误点清单", "案例套路", "计算套路", "一卡背诵"))
            if not head_marker:
                warns.append(f"{os.path.relpath(path, ROOT)} 缺少标准正文标题（考点梳理/答题框架/案例套路）")
            try:
                w = int(p.get("weight", 0))
            except ValueError:
                w = 0
            books.setdefault(p.get("book", "?"), {"title": "?", "weights": []})["weights"].append(w)

# 4) weight 连续性
for b, info in books.items():
    ws = sorted(info["weights"])
    if ws != list(range(1, len(ws) + 1)):
        errors.append(f"书籍 {b} 的 weight 不连续: {ws}")

# 5) 题目校验
ids = set()
for q in bank:
    if q.get("id") in ids:
        errors.append(f"题目 id 重复: {q.get('id')}")
    ids.add(q.get("id"))
    for k in ("A", "B", "C", "D"):
        if k != q.get("answer") and not (q.get("explain") or {}).get(k):
            errors.append(f"{q.get('id')} 选项 {k} 缺少错误原因")
    if q.get("answer") not in "ABCD":
        errors.append(f"{q.get('id')} answer 非法: {q.get('answer')}")

qchapters = {q.get("chapter") for q in bank}
for qc in qchapters - set(chapters):
    errors.append(f"孤儿题：题库章节「{qc}」在书籍章节中不存在")
for qc in set(chapters) - qchapters:
    errors.append(f"无题章节：「{qc}」没有任何配套题")

# 6) 统计输出
from collections import Counter
cnt = Counter(q.get("chapter") for q in bank)
print(f"=== 审计 {SLUG} ===")
print(f"书籍: {len(books)} 本 | 章节: {len(chapters)} 个 | 题目: {len(bank)} 道")
if errors:
    print("\n[✗ 错误]")
    for e in errors:
        print("  -", e)
    sys.exit(1)
if warns:
    print("\n[! 提示]")
    for w in warns:
        print("  -", w)
print("\n[✓ 全部通过] 证书主页/书籍/章节结构、weight 连续、书↔题双向一致、题目 explain 完整")
