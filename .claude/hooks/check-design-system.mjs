#!/usr/bin/env node
/**
 * check-design-system.mjs — PostToolUse 훅 (advisory)
 * ---------------------------------------------------------------------------
 * src/ 의 .tsx/.css 편집 후 디자인 시스템(Dell 1996) 규칙 위반을 스캔해서
 * Claude에게 피드백한다. 차단(block)하지 않는다 — 위반을 리포트만 한다.
 *
 * 검사 규칙(요지, 권위는 docs/design-system/tokens.css):
 *  - radius는 rounded-none / rounded-full 만 허용
 *  - 소프트 섀도 금지 (shadow-sm/md/lg/xl/2xl/inner, 맨 shadow, drop-shadow-*)
 *  - 그라데이션 금지 (bg-gradient, from-/via-/to-, linear-gradient)
 *  - 팔레트 밖 하드코딩 hex 경고 (tokens.css 정의 색 외)
 *
 * 모드: 'advisory' = 항상 통과(exit 0) + additionalContext로 보고.
 *       'block'    = 위반 시 exit 2 (코드 리스킨 완료 후 승격용).
 * 기존 코드가 아직 리스킨 전이라 기본값은 advisory.
 */

import { readFileSync } from 'node:fs';

const MODE = 'advisory'; // 'advisory' | 'block'

// tokens.css 에 정의된 허용 hex (소문자, # 포함). 드리프트 시 tokens.css 기준으로 갱신.
const ALLOWED_HEX = new Set([
  '#e91d2a', '#ffffff', '#fcc20f', '#6a26a4', '#000000', '#0000ee',
  '#8e8a25', '#b3bd95', '#d77a7a', '#e6915d', '#c0d4a7', '#9ab6c8',
  '#a5b8c0', '#8c9ae0',
]);

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function ok() {
  process.exit(0);
}

// --- 훅 입력 파싱 ----------------------------------------------------------
let payload;
try {
  payload = JSON.parse(readStdin() || '{}');
} catch {
  ok(); // 입력 깨지면 조용히 통과
}

const filePath = payload?.tool_input?.file_path || '';
const norm = filePath.replace(/\\/g, '/');

// src 아래 .tsx/.css 만 검사. 그 외(문서·설정 등)는 즉시 통과.
const isTarget = /\/src\/.*\.(tsx|css)$/.test(norm) || /^src\/.*\.(tsx|css)$/.test(norm);
if (!isTarget) ok();

// 편집된 파일 내용 확보 (디스크 우선, 실패 시 tool_input).
let content = '';
try {
  content = readFileSync(filePath, 'utf8');
} catch {
  content =
    payload?.tool_input?.content ||
    payload?.tool_input?.new_string ||
    '';
}
if (!content) ok();

// --- 위반 스캐너 -----------------------------------------------------------
const lines = content.split(/\r?\n/);
const findings = [];
const push = (line, rule, text) => findings.push({ line, rule, text });

// 전체 rounded 토큰을 잡고, rounded-none/full 만 허용으로 제외(접두부 오탐 방지).
const RADIUS = /\brounded(?:-[\w[\].%#-]+)*/g;
const RADIUS_OK = new Set(['rounded-none', 'rounded-full']);
// 박스 shadow(임의값 포함)는 전부 위반 — 베벨은 drop-shadow-[...]만 허용하므로 미검출.
const SHADOW = /shadow-\[|\b(?:shadow-(?:sm|md|lg|xl|2xl|inner)|drop-shadow-(?:sm|md|lg|xl|2xl)|shadow(?![-\w[]))\b/g;
const GRADIENT = /\b(?:bg-gradient[-\w]*|from-\[|via-\[|to-\[)\b|linear-gradient|radial-gradient/g;
const HEX = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;

lines.forEach((raw, i) => {
  const n = i + 1;
  let m;
  while ((m = RADIUS.exec(raw))) if (!RADIUS_OK.has(m[0])) push(n, 'radius', m[0]);
  while ((m = SHADOW.exec(raw))) push(n, 'soft-shadow', m[0]);
  while ((m = GRADIENT.exec(raw))) push(n, 'gradient', m[0]);
  while ((m = HEX.exec(raw))) {
    if (!ALLOWED_HEX.has(m[0].toLowerCase())) push(n, 'palette-hex', m[0]);
  }
});

if (findings.length === 0) ok();

// --- 보고 -----------------------------------------------------------------
const RULE_HINT = {
  radius: 'radius는 rounded-none/full 만 (디자인 기본 0)',
  'soft-shadow': '소프트 섀도 금지 — 하드 1px 보더/베벨만',
  gradient: '그라데이션 금지 — 플랫 채움만',
  'palette-hex': '팔레트 밖 hex — tokens.css 토큰 사용',
};

const shown = findings.slice(0, 20);
const detail = shown
  .map((f) => `  - L${f.line} [${f.rule}] "${f.text}" → ${RULE_HINT[f.rule]}`)
  .join('\n');
const more = findings.length > shown.length ? `\n  …외 ${findings.length - shown.length}건` : '';

const summary =
  `[design-system] ${norm} 디자인 규칙 위반 ${findings.length}건 (advisory):\n` +
  detail +
  more +
  `\n새 코드는 docs/design-system/tokens.css 토큰으로 고칠 것. ` +
  `기존 코드의 위반은 사용자가 리스킨을 명시 요청할 때만 수정.`;

if (MODE === 'block') {
  process.stderr.write(summary + '\n');
  process.exit(2);
}

// advisory: 차단하지 않고 Claude에 컨텍스트로 전달.
process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: summary,
    },
  }),
);
process.exit(0);
