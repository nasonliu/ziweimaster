import { describe, expect, test } from "vitest";
import { mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildApp } from "../app.js";

const sampleInput = {
  gender: "male",
  birthDateTime: "1981-06-20T00:30:00+08:00",
  calendarType: "solar",
  trueSolarTime: true,
  longitude: 116.917,
  timezone: "Asia/Shanghai",
  locale: "zh-CN"
};

describe("API routes", () => {
  test("serves natal, fortune, sanfang, analysis, and OpenAPI endpoints", async () => {
    process.env.ZIWEI_CASE_STORE = path.join(mkdtempSync(path.join(os.tmpdir(), "ziweimaster-cases-")), "cases.json");
    const app = await buildApp();

    const natal = await app.inject({
      method: "POST",
      url: "/api/chart/natal",
      payload: sampleInput
    });
    expect(natal.statusCode).toBe(200);
    expect(natal.json().palaces).toHaveLength(12);

    const places = await app.inject({ method: "GET", url: "/api/places/china" });
    expect(places.statusCode).toBe(200);
    expect(places.json().byProvince["北京市"][0]).toMatchObject({
      city: "北京市",
      longitude: 116.4074
    });

    const decades = await app.inject({
      method: "POST",
      url: "/api/fortune/decades",
      payload: sampleInput
    });
    expect(decades.statusCode).toBe(200);
    expect(decades.json().decades).toHaveLength(12);

    const annual = await app.inject({
      method: "POST",
      url: "/api/fortune/annual",
      payload: { ...sampleInput, year: 2026 }
    });
    expect(annual.statusCode).toBe(200);
    expect(annual.json().year).toBe(2026);

    const sanfang = await app.inject({
      method: "POST",
      url: "/api/chart/sanfang-sizheng",
      payload: { ...sampleInput, palaceName: "子女宫" }
    });
    expect(sanfang.statusCode).toBe(200);
    expect(sanfang.json().center.palaceName).toBe("子女宫");

    const payload = await app.inject({
      method: "POST",
      url: "/api/analysis/payload",
      payload: {
        ...sampleInput,
        year: 2026,
        focusPalaces: ["子女宫"],
        includeAnnual: true,
        includeDecade: true,
        includeSanfang: true,
        includeTransformations: true,
        includeConflicts: true
      }
    });
    expect(payload.statusCode).toBe(200);
    expect(payload.json().focus.currentYear).toBe(2026);

    const openapi = await app.inject({ method: "GET", url: "/openapi.json" });
    expect(openapi.statusCode).toBe(200);

    const ui = await app.inject({ method: "GET", url: "/" });
    expect(ui.statusCode).toBe(200);
    expect(ui.body).toContain("ZiweiMaster 人工校验台");
    expect(ui.body).toContain("birthDateTime");
    expect(ui.body).toContain("十二宫盘");
    expect(ui.body).toContain("palace-board");
    expect(ui.body).toContain("sanfang-overlay");
    expect(ui.body).toContain("叠加大限");
    expect(ui.body).toContain("四化飞星");
    expect(ui.body).toContain("干支五行");
    expect(ui.body).toContain("星曜亮度");
    expect(ui.body).toContain("宫干四化");
    expect(ui.body).toContain("问答分析");
    expect(ui.body).toContain("ai-question");
    expect(ui.body).toContain("expertProfile");
    expect(ui.body).toContain("answerStyle");
    expect(ui.body).toContain("allowFollowup");
    expect(ui.body).toContain("命例档案");
    expect(ui.body).toContain("保存命例");
    expect(ui.body).toContain("ai-output-window");
    expect(ui.body).toContain("ai-input-window");
    expect(ui.body).toContain("连续对话");
    expect(ui.body).toContain("process-panel");
    expect(ui.body).toContain("markdown-body");
    expect(ui.body).toContain("chart-drawer");
    expect(ui.body).toContain("填入示例问题");

    const previousKey = process.env.DEEPSEEK_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
    const ai = await app.inject({
      method: "POST",
      url: "/api/ai/deepseek-stream",
      payload: {
        ...sampleInput,
        year: 2026,
        focusPalaces: ["子女宫"],
        palaceName: "子女宫",
        layer: "annual"
      }
    });
    if (previousKey) {
      process.env.DEEPSEEK_API_KEY = previousKey;
    }
    expect(ai.statusCode).toBe(200);
    expect(ai.body).toContain("event: mcp");
    expect(ai.body).toContain("DEEPSEEK_API_KEY is not set");

    const savedCase = await app.inject({
      method: "POST",
      url: "/api/cases",
      payload: {
        title: "测试命例",
        birthInput: sampleInput,
        uiState: { year: 2026, focusPalace: "子女宫", expertProfile: "balanced" },
        analysisData: payload.json(),
        chatMessages: [{ role: "user", content: "先看财运" }]
      }
    });
    expect(savedCase.statusCode).toBe(200);
    const savedId = savedCase.json().id;

    const caseList = await app.inject({ method: "GET", url: "/api/cases" });
    expect(caseList.statusCode).toBe(200);
    expect(caseList.json().cases[0]).toMatchObject({ id: savedId, title: "测试命例" });

    const loadedCase = await app.inject({ method: "GET", url: `/api/cases/${savedId}` });
    expect(loadedCase.statusCode).toBe(200);
    expect(loadedCase.json().chatMessages[0]).toMatchObject({ role: "user", content: "先看财运" });

    await app.close();
  });
});
