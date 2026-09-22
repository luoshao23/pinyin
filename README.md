# 🐼 拼音乐园 Paradise

面向儿童的互动式拼音学习 Web 应用。通过字母卡片、拼读实验、声调练习和小测验，帮助小朋友快乐掌握汉语拼音。

## 功能概览

| 模块 | 说明 |
|------|------|
| **字母森林** | 浏览声母、单韵母、复韵母和鼻韵母，点击卡片听发音并查看助记口诀 |
| **声调魔法** | 点击单韵母后，在顶部区域练习四声调号 |
| **拼读实验室** | 自由组合声母、介音、韵母，实时拼读并展示对应汉字 |
| **拼音小测验** | 看汉字拼拼音，支持年级筛选、自定义文本和错题复习 |
| **用户系统** | 本地账号登录，记录得分与错题本（数据保存在浏览器 localStorage） |

## 环境要求

- **Node.js** >= 18（推荐 20+）
- **npm** >= 9

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/luoshao23/pinyin.git
cd pinyin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后在终端查看本地地址（默认 `http://localhost:5173`），用浏览器打开即可。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器，支持热更新 |
| `npm run build` | 构建生产版本，输出到 `dist/` |
| `npm run preview` | 本地预览构建结果 |
| `npm run lint` | 运行 ESLint 代码检查 |

## 使用指南

### 1. 字母森林

页面中部的「字母森林」区域展示了全部拼音字母：

- **单韵母**：a、o、e、i、u、ü
- **声母**：b、p、m、f … zh、ch、sh、r …
- **复韵母 & 鼻韵母**：ai、ei、ao … ang、eng、ong 等

点击任意卡片即可播放发音。选中单韵母时，顶部「熊猫老师」区域会展开**声调魔法**轨道，可依次点击四声练习。

### 2. 拼读实验室

在「拼读实验室」中，按以下步骤操作：

1. 选择一个**声母**（也可不选）
2. 如有需要，选择**介音**（i、u、ü）
3. 选择一个**韵母**
4. 点击「开始拼读」，系统会播放拼读结果并展示对应汉字

若组合不合法，会提示错误。

### 3. 拼音小测验

页面底部的「拼音小测验」是核心练习模块：

1. 看屏幕上的**汉字**
2. 依次点选**声母 → 介音（可选）→ 韵母**
3. 点击「检查答案」
4. 答对得 10 分，并自动进入下一题；答错会记录到错题本

#### 年级筛选

右上角下拉菜单可选：

- **全部年级**：使用内置字库全部汉字
- **一年级 / 三年级 / 六年级**：按对应年级字表出题
- **自定义**：粘贴任意中文文本（如古诗、课文），系统自动提取汉字并生成题目

#### 用户与错题本

1. 点击右上角「登录 / 注册」，输入名字并选择头像
2. 登录后可切换两种模式：
   - **随机**：从当前字库随机出题
   - **错题**：专门复习之前答错的字
3. 得分和错题保存在浏览器本地，清除网站数据会丢失

> 游客模式也可练习，但不会记录得分和错题。

### 4. 语音播放

- 拼音发音优先使用 `public/audio/` 下的 MP3 音频（约 1600+ 个文件）
- 音频缺失或汉字朗读时，自动降级为浏览器内置 TTS（Speech Synthesis）
- 建议使用 Chrome / Edge 以获得最佳语音体验

## 项目结构

```
pinyin/
├── public/
│   └── audio/          # 拼音 MP3 音频文件
├── src/
│   ├── components/     # React 组件
│   │   ├── AlphabetChart.jsx   # 字母森林
│   │   ├── BlendingLab.jsx     # 拼读实验室
│   │   ├── PinyinGame.jsx      # 拼音小测验
│   │   ├── PinyinCard.jsx      # 字母卡片
│   │   ├── ToneMagic.jsx       # 声调魔法
│   │   └── UserBar.jsx         # 用户登录栏
│   ├── constants/
│   │   ├── pinyinData.js       # 拼音字母与汉字映射
│   │   └── gradeData.js        # 各年级字表
│   ├── utils/
│   │   ├── pinyinGenerator.js  # 基于 pinyin-pro 的汉字转拼音
│   │   ├── pinyinValidator.js  # 拼音组合合法性校验
│   │   ├── speech.js           # 语音播放（MP3 + TTS 降级）
│   │   └── userManager.js      # 本地用户数据管理
│   ├── App.jsx
│   └── main.jsx
├── legacy/             # 早期纯 HTML 版本（仅供参考）
├── test_gen.js         # 拼音生成器测试脚本
└── vite.config.js
```

## 技术栈

- [React 19](https://react.dev/) + [Vite 7](https://vite.dev/)
- [Framer Motion](https://www.framer.com/motion/) — 动画效果
- [pinyin-pro](https://github.com/zh-lx/pinyin-pro) — 汉字转拼音
- [canvas-confetti](https://github.com/catdad/canvas-confetti) — 答对庆祝特效
- [Lucide React](https://lucide.dev/) — 图标

## 开发说明

### 测试拼音生成器

```bash
node test_gen.js
```

会输出示例文本「床前明月光」的拼音解析结果。

### 自定义年级字表

编辑 `src/constants/gradeData.js`，按年级 key 添加汉字数组即可。

### 添加 / 修改拼音数据

- 字母、口诀、汉字映射：`src/constants/pinyinData.js`
- 拼音组合规则：`src/utils/pinyinValidator.js`

### 部署

```bash
npm run build
```

将 `dist/` 目录部署到任意静态托管服务（Nginx、Vercel、GitHub Pages 等）。确保 `public/audio/` 中的音频文件一并上传。

## Legacy 版本

`legacy/` 目录保留了项目早期的纯 HTML/CSS/JS 实现，可直接用浏览器打开 `legacy/index.html` 查看，无需构建。

## License

Private project.
