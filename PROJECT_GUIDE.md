# Echo / 心想 项目指南

> 面向 AI 协作者的快速上手文档。读完本文即可理解项目全貌并开始工作。

## 项目简介

Echo（心想）是一个**面向 AI 绘画（Stable Diffusion / ComfyUI）的角色卡片管理工具**，采用单 HTML 文件架构，基于"物理新拟态（Neumorphism）"视觉风格。用户可以用它管理角色提示词卡片、分组浏览、一键生图、导入导出数据。

- 作者：一个六
- 仓库：https://github.com/xinhaocai5-hue/Echo
- 技术形态：纯前端单页应用，无后端，无构建步骤，浏览器直接打开 `Echo.html` 即可运行

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | React 18 (UMD) | 通过 Babel Standalone 在浏览器内编译 JSX |
| 样式 | Tailwind CSS (CDN) | 配合 CSS 变量实现新拟态主题 |
| 动画 | Framer Motion 10 | 进出场动画、Modal 过渡 |
| 数据解析 | PapaParse 5.4 | 解析 Danbooru 标签 CSV |
| 打包导出 | JSZip + FileSaver | 导出 ZIP 备份（含图片） |
| 本地存储 | IndexedDB (EchoDB) | 持久化角色、分组、设置等状态 |
| 文件访问 | File System Access API | 链接本地模型文件夹（需 Chromium 内核浏览器） |

## 目录结构

```
Echo/
├── Echo.html                          # 主程序（唯一核心文件，约 12000 行）
├── output/                            # 生成的角色卡片图片（约 2000 张 webp）
├── tags/
│   ├── danbooru.csv                   # Danbooru 标签库（6MB，中英翻译用）
│   └── url.txt                        # 标签库在线更新地址
├── 一个六自己添加的角色单组/            # 作者预置的角色数据（JSON 导出文件）
├── 副本/                              # Echo.html 的版本备份（见备份规则）
├── .trae/rules/project_rules.md       # 项目规则（修改前必读）
└── PROJECT_GUIDE.md                   # 本文档
```

## 核心功能模块

### 1. 角色卡片管理
- 卡片字段：`id`、`clean_name`（中文名）、`value`（提示词）、`groups`（分组）、`isFavorite`（收藏）、`imageSrc`（图片）、`createdAt`、`copyCount`（复制次数）、`deletedAt`（软删除标记）
- 支持：新增、编辑、删除（软删除进回收站）、复制提示词、收藏、随机抽取
- 视图：网格 / 列表切换，卡片大小可调

### 2. 多级分组系统
- 树形分组结构，支持无限层级子分组
- 特殊分组（系统内置）：
  - `null` — 全部角色
  - `__favorites__` — 收藏夹
  - `__artists__` — 画师串
  - `lora` — LoRA 模型
  - `__recycle__` — 回收站
- 分组可关联本地文件夹（File System Access API），用于读取 Checkpoints / LoRA 模型文件

### 3. ComfyUI 生图集成
- 通过 ComfyUI HTTP API（`/prompt`）提交工作流
- 通过 WebSocket（`/ws`）监听生成进度
- 支持参数：正/负面提示词、尺寸、步数、CFG、采样器、调度器、种子、批量数
- 支持多 LoRA 加载（名称、强度、触发词）
- 支持解析 A1111 WebUI 格式参数文本（`parseWebUIParams`）
- 生成结果可自动回填到角色卡片图片

### 4. 标签系统
- 基于 Danbooru 标签库（`tags/danbooru.csv`）
- 标签拖拽排序、框选批量操作
- 中文输入自动翻译为英文标签
- 支持从 URL 在线加载标签库（带 CORS 代理容错）
- 可设置忽略标签（生图时自动过滤）

### 5. AI 智能导入
- 调用 LLM API 从自然语言文本提取角色数据
- 支持两种 API 类型：
  - `openai` — OpenAI 兼容接口（`/v1/chat/completions`）
  - `gemini` — Google Gemini 接口
- AI 返回 JSON 数组，自动解析并导入为角色卡片

### 6. 导入 / 导出
- **JSON 导出**：纯文本角色数据（`characters.json`）
- **ZIP 导出**：含图片的完整备份（`Echo_Backup.zip`，图片存于 `images/` 目录）
- **JSON 导入**：支持单角色、数组、按分组嵌套等多种 JSON 结构
- **ZIP 导入**：自动解压并匹配图片
- **画师串导出**：单独导出画师串分组数据

### 7. 设置面板（5 个标签页）
| 标签 | 功能 |
|------|------|
| 界面功能 | 功能开关（视图切换、排序、随机、主题、导出、添加、快捷生图、筛选等） |
| 图片压缩 | 开关 + 压缩目标大小（KB） |
| API 配置 | 管理 LLM API 配置（新增/编辑/删除），用于 AI 导入 |
| 卡片生图 | ComfyUI 服务器地址、模型选择、LoRA 管理、生图参数 |
| 标签设置 | 标签库数据源（本地/URL）、加载标签数据 |

## 数据持久化

使用 IndexedDB（数据库名 `EchoDB`，对象仓库 `state`），存储键：

| 键名 | 内容 |
|------|------|
| `settings_flags` | 界面功能开关 |
| `api_configs` | LLM API 配置列表 |
| `image_gen_settings` | 生图参数设置 |
| `model_folders` | 模型文件夹路径 |
| `loras_data` | LoRA 模型数据 |
| `checkpoints_data` | Checkpoint 模型数据 |
| 角色与分组数据 | 直接存储在 state 仓库中 |

## 代码结构（Echo.html 内）

```
<head>
  ├── CDN 引入（React / Tailwind / Framer Motion / PapaParse / JSZip / FileSaver）
  ├── Tailwind 配置（暗色模式、自定义颜色、动画关键帧）
  ├── CSS 变量（新拟态主题：亮/暗模式阴影、圆角、缓动）
  └── 通用样式类（neumorph-raised / neumorph-pressed / card-3d 等）

<body>
  └── <script type="text/babel">
      ├── 常量定义（DB_NAME / SPECIAL_GROUPS / DEFAULT_MODEL_GROUPS / defaultImageGenSettings）
      ├── IndexedDB 工具函数（initDB / dbSave / dbLoad / dbClear）
      ├── Hooks（useIntersectionObserver / useInfiniteScroll）
      ├── 图标组件（约 40 个 SVG 图标）
      ├── 通用组件
      │   ├── SearchableSelect — 可搜索下拉选择
      │   ├── ModelSelectWithPreview — 模型选择（带预览）
      │   ├── Switch — 开关组件
      │   └── FolderIconWithLevel — 分组层级图标
      ├── SettingsPanel — 设置面板（5 个标签页）
      ├── Sidebar — 侧边栏（分组树导航）
      ├── TagEditor — 标签编辑器（拖拽、框选、翻译）
      ├── App — 主组件（约 7500 行，包含全部业务逻辑）
      │   ├── 状态管理（characters / groups / modals / settings 等）
      │   ├── 数据处理（processData / handleAiImport / handleZipExport 等）
      │   ├── ComfyUI 生图（buildWorkflow / fetchAvailableModels 等）
      │   └── 渲染（顶栏 / 侧边栏 / 卡片网格 / Modal 弹窗）
      └── ReactDOM.render(<App />)
```

## 开发规则（必读）

### 修改前备份
每次修改 `Echo.html` 前，**必须**先备份到 `副本/` 目录：
1. 查看 `副本/` 已有备份，确定下一个版本号
2. 命名格式：`版本号_修改内容.html`（如 `v1.6_新增标签搜索.html`）
3. 版本号规则：首次 `v1.0`，小修改递增小数位（`v1.1`），大改递增主版本号（`v2.0`）
4. 确认备份成功后再修改原文件

### 界面设计约束
- 禁止使用蓝紫色调
- 禁止使用 emoji 表情

## 常见开发任务指引

| 任务 | 关键位置 / 函数 |
|------|----------------|
| 新增/修改角色卡片字段 | `processData` 中的 `newChars.push`（约 5464 行） |
| 修改分组逻辑 | `DEFAULT_MODEL_GROUPS`、`SPECIAL_GROUPS`、Sidebar 组件 |
| 调整生图工作流 | `buildWorkflow`（约 7390 行）、`defaultImageGenSettings` |
| 新增设置项 | `SettingsPanel` 组件、对应 useState、`dbSave` 持久化 |
| 修改主题样式 | `<style>` 中的 CSS 变量（`:root` 和 `.dark`） |
| 新增图标 | Icons 区域（约 1540 行），按现有模式添加 SVG |
| 修改 AI 导入提示词 | `handleAiImport` 中的 `systemPrompt`（约 5762 行） |
| 调整标签翻译 | `TagEditor` 组件、`tags/danbooru.csv` |

## 运行方式

直接用浏览器（推荐 Chrome / Edge）打开 `Echo.html` 即可。无需安装依赖、无需启动服务器。

> 注意：File System Access API 和部分功能需要 HTTPS 或 localhost 环境，直接以 `file://` 协议打开时某些文件访问功能可能受限。
