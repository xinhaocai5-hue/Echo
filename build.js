/**
 * Echo 构建脚本
 * 将 Echo.src.html (JSX 源文件) 编译为 Echo.html (优化后的运行文件)
 *
 * 用法: node build.js
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

// 使用相对路径，兼容 Windows / Linux / macOS
const SRC_FILE = path.join(__dirname, 'Echo.src.html');
const OUT_FILE = path.join(__dirname, 'Echo.html');

console.log('=== Echo Build Script ===');
console.log('');

// 1. 读取源文件
const html = fs.readFileSync(SRC_FILE, 'utf-8');
console.log(`源文件: ${SRC_FILE}`);
console.log(`源文件大小: ${(html.length / 1024).toFixed(1)} KB`);

// 2. 提取 <script type="text/babel"> 内容
const scriptOpenTag = '<script type="text/babel">';
const scriptCloseTag = '</script>';

const babelStart = html.indexOf(scriptOpenTag);
if (babelStart === -1) {
    console.error('ERROR: 找不到 <script type="text/babel"> 标签');
    process.exit(1);
}

const codeStart = babelStart + scriptOpenTag.length;
const lastScriptClose = html.lastIndexOf(scriptCloseTag);
const codeEnd = lastScriptClose;
const jsxCode = html.substring(codeStart, codeEnd);

console.log(`JSX 代码: ${jsxCode.length} 字符, ${jsxCode.split('\n').length} 行`);

// 3. 编译 JSX
console.log('正在编译 JSX...');
const startTime = Date.now();

const result = babel.transformSync(jsxCode, {
    presets: [
        ['@babel/preset-env', {
            targets: { chrome: '100', edge: '100' },
            modules: false
        }],
        ['@babel/preset-react', {
            runtime: 'classic'
        }]
    ],
    compact: false,
    comments: false
});

const compileTime = Date.now() - startTime;
console.log(`编译完成，耗时: ${compileTime}ms`);

// 4. 构建输出 HTML
let newHtml = html;

// 替换 script 内容
const beforeCode = html.substring(0, babelStart);
const afterCode = html.substring(codeEnd + scriptCloseTag.length);
newHtml = beforeCode + '<script>\n' + result.code + '\n    </script>' + afterCode;

// 移除 Babel Standalone CDN
newHtml = newHtml.replace(
    /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/babel-standalone\/[^"]+"><\/script>\n?/,
    ''
);

// 修正注释
newHtml = newHtml.replace('<!-- React & Babel -->', '<!-- React -->');

// 5. 写入输出文件
fs.writeFileSync(OUT_FILE, newHtml, 'utf-8');

console.log('');
console.log('=== 构建结果 ===');
console.log(`输出文件: ${OUT_FILE}`);
console.log(`输出大小: ${(newHtml.length / 1024).toFixed(1)} KB`);
console.log(`体积减少: ${((html.length - newHtml.length) / 1024).toFixed(1)} KB (${(((html.length - newHtml.length) / html.length) * 100).toFixed(1)}%)`);
console.log(`Babel CDN: 已移除`);
console.log(`text/babel: 已消除`);
console.log('');
console.log('构建完成!');
