---
name: ziweimaster
description: Use ZiweiMaster MCP tools when the user asks for Ziwei Dou Shu charting, 命盘/紫微斗数 analysis, palace inspection, 三方四正, 大限, 流年, 四化飞星, true solar time, or Chinese birthplace-based chart generation.
---

# ZiweiMaster

Use this skill for Ziwei Dou Shu work in Codex. Do not answer from memory or generic astrology rules when chart data is needed. First call the ZiweiMaster MCP tools, then reason from the returned JSON.

## Tool Strategy

- If the user gives one Chinese natural-language birth description, start with `ziweimaster_from_text`.
- If the user provides structured birth data, use `ziweimaster_analysis_payload` for an LLM-ready full payload.
- If the user asks about a specific palace, click-equivalent view, 三方四正, 宫干四化, 飞星落点, or line relations, use `ziweimaster_inspect_palace`.
- If the user only needs a natal chart, use `ziweimaster_natal_chart`.
- If the user asks for 十年运势 or 大限, use `ziweimaster_decades`.
- If the user asks for a year, 流年, annual transformations, or annual palace mapping, use `ziweimaster_annual_fortune`.
- If the birthplace needs China prefecture-level lookup, use `ziweimaster_get_china_places` or provide `birthPlaceProvince` and `birthPlaceCity` directly.

## Required Reading Pattern

1. Extract or confirm birth data:
   - gender
   - birthDateTime with timezone offset
   - calendarType: `solar` or `lunar`
   - trueSolarTime preference
   - birthplace province/city or longitude
   - target year and palace if relevant
2. Call the MCP tool that best matches the task.
3. For analysis, cite the returned structured fields:
   - palace names and layer
   - stars and brightness
   - heavenly stem / earthly branch with yin-yang and five-element attributes
   - Sanfang Sizheng center/opposite/trines
   - transformations and conflicts
   - palace-stem transformations and fly-star target/opposite palaces
4. Keep the answer grounded in the tool output. If a star, transformation, year, or palace is not in the returned JSON, say the current evidence does not provide it.

## Answer Style

For normal users, give a plain-language conclusion first, then professional evidence. For specialist users, include Ziwei terms such as 三方四正, 庙旺落陷, 宫干四化, 禄权科忌, 对宫反冲, and 限流叠宫.

For North-school or 飞星 analysis, explicitly trace the energy flow:

`source palace/stem -> transformed star/type -> target palace -> opposite palace impact -> Sanfang Sizheng support or pressure -> likely real-world manifestation`

Always include a short disclaimer that the analysis is for research, entertainment, and self-reflection, and is not professional medical, legal, financial, or psychological advice.
