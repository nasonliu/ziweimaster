# ZiweiMaster

ZiweiMaster is a structured Ziwei Dou Shu charting service, web verification console, and Codex MCP plugin.

It can generate natal charts, decade charts, annual charts, Sanfang Sizheng relations, palace-stem transformations, fly-star targets, true-solar-time adjusted inputs, and LLM-ready JSON payloads.

## 中文说明

ZiweiMaster 是一个面向紫微斗数命盘生成、盘面检查、问答分析和 Codex MCP 调用的开源项目。

它既可以作为网页工具使用，也可以作为 Codex 插件使用。网页端适合人工输入出生资料、查看十二宫盘面、点击宫位、叠加大限/流年并进行问答；MCP 端适合让 Codex 或其他支持 MCP 的 Agent 直接读取结构化命盘资料，再基于盘面证据进行分析。

目前支持：

- 姓名、性别、出生时间、阳历/阴历输入
- 中国省份和地级市出生地选择
- 真太阳时换算
- 本命盘、大限盘、流年盘
- 十二宫盘面、宫干支、阴阳、五行
- 星曜亮度：庙、旺、得、利、平、陷等
- 三方四正、对宫、三合关系
- 宫干四化、飞星落点、北派飞星能量流向证据
- 页面点击某一宫位后返回该宫位可见信息和关系信息
- DeepSeek 流式问答分析
- 本地命例和对话记录保存
- Codex MCP 工具调用

## 给其他 Codex 用户安装

这个仓库本身就是一个 Codex 插件目录，根目录包含：

- `.codex-plugin/plugin.json`
- `.mcp.json`
- `skills/ziweimaster/SKILL.md`

完整源码推送到 GitHub 后，其他 Codex 用户可以这样使用：

```bash
git clone https://github.com/nasonliu/ziweimaster.git
cd ziweimaster
pnpm install
pnpm build
```

然后在 Codex 中把这个仓库作为本地插件目录安装或指向它。插件会启动 `.mcp.json` 中声明的 MCP server：

```bash
node ./dist/mcp/server.js
```

如果某个 Codex 版本支持直接从 GitHub URL 安装插件，则可以直接使用这个仓库地址；如果不支持，就使用上面的 clone + 本地插件方式。

注意：这不是 Codex 官方插件市场的一键安装包。要做到“别人点一下就安装”，还需要把插件发布到可被 Codex 发现的插件市场或分发渠道，并确保仓库里已经包含完整源码。

## Features

- Web UI for manual chart verification and chat-style analysis
- China province/prefecture-level birthplace lookup for true solar time
- Natal, decade, and annual chart APIs
- Palace click-equivalent inspection API and MCP tool
- Sanfang Sizheng relationship model with opposite/trine relations
- Heavenly stem / earthly branch yin-yang and five-element attributes
- Star brightness display
- Palace-stem Si Hua targets and fly-star flow evidence
- Persistent local case storage
- DeepSeek-backed streaming chat endpoint
- Codex plugin files at repository root:
  - `.codex-plugin/plugin.json`
  - `.mcp.json`
  - `skills/ziweimaster/SKILL.md`

## Requirements

- Node.js 22+
- pnpm 10+

## Install

```bash
pnpm install
pnpm build
```

## Run The Web App

```bash
pnpm start
```

Open:

```text
http://localhost:3000/
```

Optional environment variables:

```bash
PORT=3000
HOST=0.0.0.0
DEEPSEEK_API_KEY=...
ZIWEI_CASE_STORE=/path/to/cases.json
```

If `DEEPSEEK_API_KEY` is not set, the structured chart APIs and MCP tools still work, but AI streaming analysis will return an explicit missing-key message.

## Run The MCP Server

Build first:

```bash
pnpm build
```

Then run:

```bash
pnpm mcp
```

The MCP server exposes:

- `ziweimaster_get_china_places`
- `ziweimaster_natal_chart`
- `ziweimaster_decades`
- `ziweimaster_annual_fortune`
- `ziweimaster_analysis_payload`
- `ziweimaster_inspect_palace`
- `ziweimaster_from_text`

## Use As A Codex Plugin

This repository is also a Codex plugin. After cloning:

```bash
pnpm install
pnpm build
```

Then install or point Codex at this repository as a local plugin. The plugin manifest is in:

```text
.codex-plugin/plugin.json
```

The MCP server configuration is:

```text
.mcp.json
```

Example Codex prompt:

```text
用 ZiweiMaster 帮我看：男，1981年6月20日0点30分，北京出生，用真太阳时，看2028年财帛宫，重点看三方四正和宫干飞星。
```

Codex should call `ziweimaster_from_text`, `ziweimaster_analysis_payload`, or `ziweimaster_inspect_palace` before producing an interpretation.

## API Examples

Build an LLM-ready payload:

```bash
curl -X POST http://localhost:3000/api/analysis/payload \
  -H 'content-type: application/json' \
  -d '{
    "gender": "male",
    "birthDateTime": "1981-06-20T00:30:00+08:00",
    "calendarType": "solar",
    "trueSolarTime": true,
    "birthPlaceProvince": "北京市",
    "birthPlaceCity": "北京市",
    "timezone": "Asia/Shanghai",
    "locale": "zh-CN",
    "year": 2026,
    "focusPalaces": ["子女宫"],
    "includeDecade": true,
    "includeAnnual": true,
    "includeSanfang": true,
    "includeTransformations": true,
    "includeConflicts": true
  }'
```

Inspect a palace:

```bash
curl -X POST http://localhost:3000/api/chart/sanfang-sizheng \
  -H 'content-type: application/json' \
  -d '{
    "gender": "male",
    "birthDateTime": "1981-06-20T00:30:00+08:00",
    "calendarType": "solar",
    "trueSolarTime": true,
    "birthPlaceProvince": "北京市",
    "birthPlaceCity": "北京市",
    "timezone": "Asia/Shanghai",
    "locale": "zh-CN",
    "year": 2026,
    "layer": "annual",
    "palaceName": "子女宫"
  }'
```

## Test

```bash
pnpm test
pnpm build
```

## Data And Privacy

Case data is stored locally. By default, local runtime data should be placed under `data/` or a path provided through `ZIWEI_CASE_STORE`. The repository `.gitignore` excludes local case data, build output, dependencies, and `.env`.

Do not commit API keys, personal birth records, private readings, or server passwords.

## Disclaimer

ZiweiMaster is for research, entertainment, and self-reflection. It is not medical, legal, financial, psychological, or other professional advice.

## License

MIT
