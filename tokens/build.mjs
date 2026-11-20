#!/usr/bin/env node
/* 從 tokens/tokens.json 產生各平台的 token：
     assets/aicde-ui.css                         兩段標記區塊（@tokens:base、@tokens:themes）
     flutter/lib/src/theme/generated_tokens.dart 色票、各主題圓角、淺色底色、控制項高度
   用法：node tokens/build.mjs          更新檔案
         node tokens/build.mjs --check  只檢查，有過期的產出就以非零結束（給 CI 用） */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(ROOT, 'tokens/tokens.json'), 'utf8'));
const CHECK = process.argv.includes('--check');

const kebab = s => s.replace(/[A-Z0-9]+/g, m => '-' + m.toLowerCase()).replace(/-(\d)/g, '-$1');
const cssVar = k => `--a-${k === 'surface2' ? 'surface-2' : kebab(k)}`;
const decl = obj => Object.entries(obj).map(([k, v]) => `${cssVar(k)}:${v}`).join(';');
const sel = id => `[data-theme-style="${id}"]`;

/* ---------- CSS ---------- */
function cssBase(){
  const { light, dark } = T.color;
  return [
    `:root{${decl(light)};--a-radius:${T.radius.base}px;--a-ease-out:${T.ease.out};--a-font:${T.font.sans}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${decl(dark)}}}`,
    `[data-theme="light"]{${decl(Object.fromEntries(Object.keys(dark).map(k => [k, light[k]])))}}`,
    `:root[data-theme="dark"],[data-theme="dark"]{${decl(dark)}}`
  ].join('\n');
}
function cssThemes(){
  const out = ['/* 圓角 token：主題只要設定這幾個值，所有元件（包括沒有個別覆寫的）都會一致 */'];
  for(const [id, th] of Object.entries(T.themes)){
    if(id === 'default' || !th.radius) continue;
    const r = th.radius;
    out.push(`${sel(id)}{${['xs', 'sm', 'md', 'lg', 'pill'].filter(k => k in r).map(k => `--a-r-${k}:${r[k]}px`).join(';')}${'base' in r ? `;--a-radius:${r.base}px` : ''}}`);
  }
  out.push('/* 主題自己的淺色底色（深色模式沿用深色 token，維持可讀性） */');
  for(const [id, th] of Object.entries(T.themes)){
    if(!th.surfaceLight) continue;
    const d = decl(th.surfaceLight);
    out.push(`@media (prefers-color-scheme:light){${sel(id)}:not([data-theme="dark"]){${d}}}`);
    out.push(`${sel(id)}[data-theme="light"]{${d}}`);
  }
  return out.join('\n');
}
function replaceBlock(src, name, body, file){
  const re = new RegExp(`(/\\* @tokens:${name}:start[^*]*\\*/\\n)[\\s\\S]*?(/\\* @tokens:${name}:end \\*/)`);
  if(!re.test(src)) throw new Error(`${file} 找不到 @tokens:${name} 標記`);
  return src.replace(re, `$1${body}\n$2`);
}

/* ---------- Dart ---------- */
const dartColor = hex => `Color(0xFF${hex.replace('#', '').toUpperCase()})`;
const dartName = id => T.themes[id].flutter || id;
function dart(){
  const { light, dark } = T.color;
  const full = { ...light, ...dark };
  const colors = (c) => Object.entries(c).map(([k, v]) => `  ${k}: ${dartColor(v)},`).join('\n');
  const themes = Object.entries(T.themes).map(([id, th]) => {
    const r = { ...T.radius, ...(th.radius || {}) };
    const s = th.surfaceLight || {};
    const surf = ['surface', 'surface2', 'line', 'lineStrong'].map(k => `${k}: ${s[k] ? dartColor(s[k]) : 'null'}`).join(', ');
    return `  AicdeThemeStyle.${dartName(id)}: (rXs: ${r.xs}, rSm: ${r.sm}, rMd: ${r.md}, rLg: ${r.lg}, rPill: ${r.pill}, controlHeight: ${th.controlHeight || T.controlHeight}, surfaceLight: (${surf})),`;
  }).join('\n');
  return `// 由 tokens/build.mjs 從 tokens/tokens.json 產生，請勿手動修改。
// ignore_for_file: lines_longer_than_80_chars
import 'package:flutter/widgets.dart';

import 'colors.dart';
import 'tokens.dart';

/// 淺色模式色票
const kAicdeLight = AicdeColors(
${colors(light)}
);

/// 深色模式色票
const kAicdeDark = AicdeColors(
${colors(full)}
);

/// 主題淺色模式下覆寫的底色；null 表示沿用色票
typedef AicdeSurfaceOverride = ({Color? surface, Color? surface2, Color? line, Color? lineStrong});

/// 各主題共用的 token（和網頁版 CSS 同一份來源）
typedef AicdeSharedTokens = ({double rXs, double rSm, double rMd, double rLg, double rPill, double controlHeight, AicdeSurfaceOverride surfaceLight});

const Map<AicdeThemeStyle, AicdeSharedTokens> kAicdeThemeTokens = {
${themes}
};
`;
}

/* ---------- 寫入或檢查 ---------- */
const targets = [];
const cssPath = join(ROOT, 'assets/aicde-ui.css');
let css = readFileSync(cssPath, 'utf8');
css = replaceBlock(css, 'base', cssBase(), 'aicde-ui.css');
css = replaceBlock(css, 'themes', cssThemes(), 'aicde-ui.css');
targets.push([cssPath, css]);
targets.push([join(ROOT, 'flutter/lib/src/theme/generated_tokens.dart'), dart()]);

let stale = 0;
for(const [path, text] of targets){
  let cur = ''; try{ cur = readFileSync(path, 'utf8'); }catch(e){}
  if(cur === text){ console.log(`✓ ${path.replace(ROOT + '/', '')}`); continue; }
  if(CHECK){ console.error(`✗ ${path.replace(ROOT + '/', '')} 已過期，請執行 node tokens/build.mjs`); stale++; }
  else { writeFileSync(path, text); console.log(`↻ ${path.replace(ROOT + '/', '')}`); }
}
process.exit(stale ? 1 : 0);
