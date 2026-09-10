#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""水印解码工具：从被搬运的文本中提取本站的页级水印，并映射回原始页面 URL。

编码规则（见 layouts/partials/watermark.html）：
  - 定界符：U+2060（WORD JOINER），一对定界符之间为一段水印；
  - 数据字符：U+200B=0、U+200C=1、U+200D=2、U+FEFF=3，每 2 个字符表示 1 个十六进制位（高 2 位 + 低 2 位）；
  - 水印内容：sha256(页面相对路径 RelPermalink) 的前 16 位十六进制（与域名/baseURL 无关）。

用法：
    # 1) 先用构建产物建立索引（id -> url）
    #    ⚠️ 必须使用与线上一致的 baseURL 构建，否则 id 对不上：
    hugo --destination /tmp/kz-prod --baseURL https://pastor17.github.io/growthcerts/
    python3 scripts/decode_watermark.py --build /tmp/kz-prod

    # 2) 再对疑似搬运的内容（文本文件）解码并匹配
    python3 scripts/decode_watermark.py --decode stolen.txt

    # 也可以直接解码一段字符串
    python3 scripts/decode_watermark.py --text "……"
"""
import argparse
import hashlib
import html
import json
import os
import re
import sys

DELIM = "\u2060"
BITS = {"\u200b": 0, "\u200c": 1, "\u200d": 2, "\ufeff": 3}
HEXCHARS = "0123456789abcdef"
DEFAULT_INDEX = "watermark-index.json"


def extract_ids(text):
    """从文本中提取所有水印 id（16 位十六进制）。"""
    ids = []
    for seg in text.split(DELIM)[1::2]:  # 定界符之间的片段
        seg = "".join(ch for ch in seg if ch in BITS)
        if len(seg) < 2:
            continue
        val = 0
        for ch in seg:
            val = (val << 2) | BITS[ch]
        # 每 8 个字符（4 个十六进制位）为一组还原成 hex
        hexlen = len(seg) // 2
        hexstr = ""
        for i in range(hexlen):
            pair = seg[i * 2:i * 2 + 2]
            if len(pair) < 2:
                break
            n = (BITS[pair[0]] << 2) | BITS[pair[1]]
            hexstr += HEXCHARS[n]
        if len(hexstr) == 16:
            ids.append(hexstr)
    # 去重并保持顺序
    seen, out = set(), []
    for i in ids:
        if i not in seen:
            seen.add(i)
            out.append(i)
    return out


def build_index(public_dir):
    """遍历构建产物 HTML，建立 水印id -> URL 的索引。"""
    index = {}
    for root, _, files in os.walk(public_dir):
        for fn in files:
            if not fn.endswith(".html"):
                continue
            path = os.path.join(root, fn)
            try:
                raw = open(path, encoding="utf-8", errors="ignore").read()
            except OSError:
                continue
            text = html.unescape(raw)
            for wid in extract_ids(text):
                rel = os.path.relpath(path, public_dir)
                url = "/" + rel.replace("index.html", "")
                index.setdefault(wid, url)
    return index


def main():
    ap = argparse.ArgumentParser(description="提取/匹配本站页级水印")
    ap.add_argument("--build", metavar="PUBLIC_DIR", help="遍历构建产物并生成索引文件")
    ap.add_argument("--decode", metavar="FILE", help="从文本文件解码水印")
    ap.add_argument("--text", metavar="STR", help="直接解码一段字符串")
    ap.add_argument("--index", default=DEFAULT_INDEX, help="索引文件路径（默认 %s）" % DEFAULT_INDEX)
    args = ap.parse_args()

    if args.build:
        index = build_index(args.build)
        with open(args.index, "w", encoding="utf-8") as f:
            json.dump(index, f, ensure_ascii=False, indent=1)
        print("已建立索引：%d 条 → %s" % (len(index), args.index))
        return

    if args.decode:
        raw = open(args.decode, encoding="utf-8", errors="ignore").read()
    elif args.text:
        raw = args.text
    else:
        ap.print_help()
        return

    ids = extract_ids(html.unescape(raw))
    if not ids:
        print("未发现水印（可能内容已被改写、水印被清除，或该内容并非来自本站）。")
        print("提示：可用 --build 先生成索引，再对整站抓取产物整体解码。")
        return

    index = {}
    if os.path.exists(args.index):
        index = json.load(open(args.index, encoding="utf-8"))

    print("发现 %d 个水印 id：" % len(ids))
    for wid in ids:
        url = index.get(wid)
        print("  %s  →  %s" % (wid, url if url else "（索引中未匹配，可用 --build 重建索引）"))


if __name__ == "__main__":
    sys.exit(main())
