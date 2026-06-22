# Echo / 心想

面向 AI 绘画（Stable Diffusion / ComfyUI）的角色卡片管理工具，采用物理新拟态（Neumorphism）视觉风格。

## 在线使用

部署后可通过 GitHub Pages 直接访问，浏览器打开即可使用，无需安装。

## 功能

- 角色卡片管理（新增 / 编辑 / 删除 / 收藏 / 复制提示词）
- 多级分组系统（树形结构，支持无限层级）
- ComfyUI 生图集成（HTTP API + WebSocket 进度监听）
- Danbooru 标签系统（中英翻译、拖拽排序、批量操作）
- AI 智能导入（LLM API 从自然语言提取角色数据）
- 导入导出（JSON / ZIP 备份含图片）
- 暗色模式

## 技术栈

React 18 + Tailwind CSS + Framer Motion + IndexedDB

## 开发

源文件为 `Echo.src.html`（JSX），修改后运行构建脚本编译为 `Echo.html`：

```bash
# 安装依赖（首次）
npm install --save-dev @babel/core @babel/preset-react @babel/preset-env

# 编译
node build.js
# 或双击 build.bat
```

## 部署

推送到 `main` 分支后，GitHub Actions 会自动编译并部署到 GitHub Pages。

## 作者

一个六
