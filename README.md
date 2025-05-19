# 坐论 · 跨身份情感交流平台

「坐论」是一款基于微信小程序的定制化社区交流平台，旨在通过身份分区与实时情感分析技术打破沟通隔阂，实现更精准的跨代沟、跨性别、跨职业群体互动。

## 🧩 核心功能
- ✅ 身份认证与分区交流（亲子、师生、职场等）
- 🧠 实时情感分析（基于 ALBERT + TextCNN）
- 💬 话题发布与评论互动（支持情绪干预）
- 👍 点赞 / 👎 点踩排序机制
- 🔍 搜索功能与热点话题推荐
- 👤 用户中心 & 游客浏览模式

## 🛠 技术栈
- 微信小程序（WXML + WXSS + JavaScript）
- 微信云开发平台（CloudBase）
- Python Flask 后端（情感分析服务）
- ALBERT + TextCNN 模型（支持 emoji 表达）

## 📂 目录结构
```bash
├── miniprogram/            # 微信小程序前端代码
├── sentiment_analysis/     # Python情感分析模块
│   ├── sentiment_core.py
│   ├── sentiment_dict.txt
│   └── ...
├── README.md
└── LICENSE
