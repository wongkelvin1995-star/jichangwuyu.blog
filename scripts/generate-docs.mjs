import fs from 'node:fs';
import path from 'node:path';

const keywords = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'seo-keywords.json'), 'utf-8'));

const lines = [
  '# SEO-KEYWORD-MAPPING · 机场物语 200+15 关键词映射表',
  '',
  '本文件由 `data/seo-keywords.json` 自动同步生成，完整保留 001–200 原始编号与 15 个品牌专属扩展词（EX-01–EX-15）。',
  '',
  '> 说明：优先级为内容建设规划，并非已验证的 Bing 搜索量或排名承诺。',
  '',
  '| 编号 | 原始关键词 | 目标 URL | 搜索意图 | 内容集群 | 优先级 | 发布状态 | 资料核验状态 |',
  '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ...keywords.map(
    (k) => `| ${k.id} | ${k.keyword} | ${k.targetUrl} | ${k.intent} | ${k.cluster} | ${k.priority} | ${k.publishStatus} | ${k.verificationStatus} |`
  ),
];

fs.writeFileSync(path.join(process.cwd(), 'SEO-KEYWORD-MAPPING.md'), lines.join('\n'), 'utf-8');
console.log('Generated SEO-KEYWORD-MAPPING.md with', keywords.length, 'rows');
