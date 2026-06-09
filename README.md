# ZiweiMaster

ZiweiMaster is a structured Ziwei Dou Shu charting service, web verification console, and Codex MCP plugin.

It can generate natal charts, decade charts, annual charts, Sanfang Sizheng relations, palace-stem transformations, fly-star targets, true-solar-time adjusted inputs, and LLM-ready JSON payloads.

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
