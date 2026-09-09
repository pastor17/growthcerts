# growthcerts

> 证书备考站仓库。采用「**master 占位 + kaozheng 内容**」的分支结构：

| 分支 | 内容 | 用途 |
| ---- | ---- | ---- |
| `master` | 占位页（中医养生，本分支） | 仓库默认/占位展示 |
| `kaozheng` | 考证宝典（Hugo 站点：软考·系统集成 3 书 / 29 章 / 67 题 + 官方动态） | 推送到该分支触发 GitHub Actions 构建并发布 Pages |

## 发布考证站（kaozheng）

仓库 **Settings → Pages → Source** 选择 **GitHub Actions** 后，推送 `kaozheng` 分支即自动部署到 `https://pastor17.github.io/growthcerts/`：

```bash
git checkout kaozheng
git add -A && git commit -m "update"
git push origin kaozheng
```

> 站点源码即 `kaozheng` 分支根目录（Hugo 工程），`public/` 为构建产物不入库。
