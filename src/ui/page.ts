export function renderHomePage(): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ZiweiMaster 人工校验台</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #17211b;
      --muted: #607064;
      --line: #d6ded8;
      --panel: #f7faf8;
      --field: #ffffff;
      --accent: #0f766e;
      --accent-2: #9a3412;
      --soft: #edf6f3;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background: #fbfcfb;
    }
    header {
      border-bottom: 1px solid var(--line);
      background: var(--panel);
      padding: 18px 24px;
    }
    h1 { margin: 0; font-size: 22px; font-weight: 720; letter-spacing: 0; }
    main {
      display: grid;
      grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
      min-height: calc(100vh - 70px);
    }
    #birth-form {
      border-right: 1px solid var(--line);
      padding: 20px 24px 28px;
      background: #ffffff;
    }
    fieldset {
      border: 0;
      padding: 0;
      margin: 0 0 22px;
      display: grid;
      gap: 12px;
    }
    legend {
      font-size: 13px;
      font-weight: 720;
      color: var(--muted);
      margin-bottom: 10px;
    }
    label { display: grid; gap: 6px; font-size: 13px; color: var(--muted); }
    input, select {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 10px 11px;
      color: var(--ink);
      background: var(--field);
      font-size: 14px;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .check {
      display: flex;
      align-items: center;
      gap: 9px;
      color: var(--ink);
    }
    .check input { width: 16px; height: 16px; }
    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .case-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .case-status {
      min-height: 18px;
      font-size: 12px;
      color: var(--muted);
    }
    .ai-settings {
      display: grid;
      gap: 10px;
    }
    button {
      border: 0;
      border-radius: 6px;
      padding: 11px 12px;
      background: var(--accent);
      color: white;
      font-weight: 700;
      cursor: pointer;
    }
    button.secondary { background: #3f4f46; }
    button.ai {
      grid-column: 1 / -1;
      background: #6d28d9;
    }
    section.output {
      padding: 16px 20px 24px;
      display: grid;
      gap: 10px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }
    .metric {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--soft);
      padding: 12px;
      min-height: 76px;
    }
    .metric span { display: block; color: var(--muted); font-size: 12px; }
    .metric strong { display: block; margin-top: 7px; font-size: 16px; overflow-wrap: anywhere; }
    .warnings {
      border-left: 4px solid var(--accent-2);
      background: #fff7ed;
      padding: 10px 12px;
      color: #7c2d12;
      min-height: 42px;
      white-space: pre-wrap;
    }
    .palace-panel {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #ffffff;
      padding: 10px;
      display: grid;
      grid-template-columns: minmax(500px, 1.35fr) minmax(280px, 0.65fr);
      gap: 9px;
    }
    .chart-drawer {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #ffffff;
    }
    .chart-drawer summary {
      cursor: pointer;
      padding: 10px 12px;
      font-weight: 800;
      color: var(--ink);
      border-bottom: 1px solid var(--line);
    }
    .chart-drawer[open] summary {
      background: var(--panel);
    }
    .palace-toolbar {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      grid-column: 1 / -1;
    }
    .palace-tools {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .palace-toolbar h2 {
      margin: 0;
      font-size: 14px;
      letter-spacing: 0;
    }
    .layer-switch {
      display: inline-flex;
      border: 1px solid var(--line);
      border-radius: 7px;
      overflow: hidden;
      background: var(--panel);
    }
    .layer-switch button {
      border-radius: 0;
      background: transparent;
      color: var(--muted);
      padding: 8px 12px;
      border-left: 1px solid var(--line);
    }
    .layer-switch button:first-child { border-left: 0; }
    .layer-switch button.active {
      background: var(--accent);
      color: #ffffff;
    }
    .overlay-toggle {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: var(--muted);
      white-space: nowrap;
    }
    .overlay-toggle input {
      width: 14px;
      height: 14px;
      padding: 0;
    }
    .palace-board {
      position: relative;
      display: grid;
      grid-template-columns: repeat(4, minmax(90px, 1fr));
      grid-template-rows: repeat(4, minmax(58px, auto));
      gap: 5px;
    }
    .sanfang-overlay {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    }
    .sanfang-overlay line,
    .sanfang-overlay polyline {
      stroke: var(--accent);
      stroke-width: 2.5;
      vector-effect: non-scaling-stroke;
      fill: none;
    }
    .sanfang-overlay .trine-line {
      stroke: #7c3aed;
      stroke-dasharray: 7 6;
      stroke-width: 2;
    }
    .palace-cell {
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 6px;
      background: #fcfefd;
      min-height: 58px;
      display: grid;
      align-content: start;
      gap: 3px;
      position: relative;
      z-index: 3;
      cursor: pointer;
    }
    .palace-cell:hover {
      border-color: #93c5fd;
      box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.12);
    }
    .palace-cell.focus {
      border-color: var(--accent);
      box-shadow: inset 0 0 0 2px rgba(15, 118, 110, 0.14);
    }
    .palace-cell.selected {
      border-color: #0f766e;
      background: #ecfdf5;
      box-shadow: inset 0 0 0 2px rgba(15, 118, 110, 0.22);
    }
    .palace-cell.opposite {
      border-color: #f97316;
      background: #fff7ed;
    }
    .palace-cell.trine {
      border-color: #8b5cf6;
      background: #f5f3ff;
    }
    .palace-name-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      align-items: baseline;
    }
    .palace-name {
      font-weight: 800;
      font-size: 12px;
    }
    .palace-branch {
      font-size: 12px;
      color: var(--muted);
    }
    .palace-stars {
      font-size: 11px;
      line-height: 1.3;
      color: var(--ink);
      overflow-wrap: anywhere;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .star-brightness {
      color: #7c2d12;
      font-weight: 700;
    }
    .palace-ganzhi {
      display: flex;
      flex-wrap: wrap;
      gap: 3px 6px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.72);
      padding: 3px 5px;
      font-size: 10px;
      line-height: 1.25;
      color: var(--muted);
    }
    .palace-ganzhi strong {
      color: var(--ink);
      font-size: 10px;
    }
    .palace-ganzhi span {
      overflow-wrap: anywhere;
    }
    .palace-stack {
      display: grid;
      gap: 3px;
      color: var(--muted);
      font-size: 10px;
      line-height: 1.25;
    }
    .stack-item {
      border-left: 3px solid var(--line);
      padding-left: 5px;
    }
    .stack-item.decade { border-left-color: #0f766e; }
    .stack-item.annual { border-left-color: #7c3aed; }
    .palace-transform {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .transform-pill {
      border-radius: 999px;
      padding: 2px 6px;
      background: #e0f2fe;
      color: #075985;
      font-size: 10px;
      font-weight: 700;
    }
    .transform-pill.bad {
      background: #fee2e2;
      color: #991b1b;
    }
    .center-cell {
      grid-column: 2 / span 2;
      grid-row: 2 / span 2;
      border: 1px dashed var(--line);
      border-radius: 8px;
      background: var(--panel);
      display: grid;
      place-items: center;
      text-align: center;
      padding: 10px;
      color: var(--muted);
      min-height: 120px;
    }
    .center-cell strong {
      display: block;
      color: var(--ink);
      font-size: 14px;
      margin-bottom: 4px;
    }
    .selected-panel {
      display: grid;
      gap: 10px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      background: var(--panel);
    }
    .selected-panel h3 {
      margin: 0;
      font-size: 15px;
    }
    .selected-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .selected-box {
      border: 1px solid var(--line);
      border-radius: 7px;
      background: #ffffff;
      padding: 8px;
      min-height: 58px;
      font-size: 12px;
      line-height: 1.45;
    }
    .selected-box span {
      display: block;
      color: var(--muted);
      font-size: 11px;
      margin-bottom: 4px;
    }
    .flystar-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .flystar-item {
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #ffffff;
      padding: 5px 8px;
      font-size: 12px;
      color: var(--ink);
    }
    .flystar-item.bad {
      border-color: #fecaca;
      background: #fef2f2;
      color: #991b1b;
    }
    .ai-panel {
      display: grid;
      gap: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background: #f8f5ff;
      min-height: 520px;
    }
    .ai-panel h3 {
      margin: 0;
      font-size: 15px;
    }
    .ai-output-window {
      border: 1px solid #ddd6fe;
      border-radius: 8px;
      background: #ffffff;
      padding: 12px;
      min-height: 420px;
      max-height: 620px;
      overflow: auto;
      display: grid;
      align-content: start;
      gap: 8px;
    }
    .ai-input-window {
      border: 1px solid #ddd6fe;
      border-radius: 8px;
      background: #ffffff;
      padding: 10px;
    }
    .ai-chat-form {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: stretch;
    }
    .followup-toggle {
      border: 1px solid var(--line);
      border-radius: 7px;
      background: #ffffff;
      padding: 9px 10px;
      min-height: 58px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--ink);
      font-size: 13px;
    }
    .followup-toggle input {
      width: 16px;
      height: 16px;
    }
    textarea {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 10px 11px;
      color: var(--ink);
      background: var(--field);
      font-size: 14px;
      line-height: 1.45;
      resize: vertical;
      min-height: 52px;
      font-family: inherit;
    }
    .chat-message {
      border: 0;
      border-radius: 0;
      padding: 4px 2px;
      font-size: 14px;
      line-height: 1.6;
      background: transparent;
    }
    .chat-message.user {
      justify-self: end;
      width: min(78%, 820px);
      border: 1px solid #dbe4df;
      border-radius: 8px;
      background: #f7faf8;
      padding: 9px 11px;
      margin: 4px 0 4px 44px;
    }
    .chat-message.assistant {
      background: transparent;
    }
    .chat-message.working {
      color: var(--muted);
    }
    .chat-message strong {
      display: block;
      margin-bottom: 3px;
      font-size: 12px;
      color: var(--muted);
    }
    .chat-message.assistant > strong {
      display: none;
    }
    .chat-message.user div {
      white-space: pre-wrap;
    }
    .process-panel {
      border: 0;
      border-radius: 0;
      background: transparent;
      font-size: 13px;
      line-height: 1.5;
      color: #64748b;
    }
    .process-panel summary {
      cursor: pointer;
      display: flex;
      gap: 7px;
      align-items: baseline;
      padding: 2px;
      min-height: 24px;
    }
    .process-icon {
      color: #64748b;
      font-size: 13px;
      white-space: nowrap;
    }
    .process-latest {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .process-history {
      margin: 3px 0 8px 20px;
      max-height: 180px;
      overflow: auto;
      border: 0;
      border-left: 2px solid #e5e7eb;
      background: transparent;
      color: #64748b;
      padding: 2px 0 2px 8px;
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 12px;
    }
    .markdown-body {
      white-space: normal;
    }
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3 {
      margin: 12px 0 6px;
      line-height: 1.25;
    }
    .markdown-body h1 { font-size: 20px; }
    .markdown-body h2 { font-size: 18px; }
    .markdown-body h3 { font-size: 16px; }
    .markdown-body p {
      margin: 7px 0;
    }
    .markdown-body ul,
    .markdown-body ol {
      margin: 7px 0 7px 20px;
      padding: 0;
    }
    .markdown-body li {
      margin: 4px 0;
    }
    .markdown-body code {
      border-radius: 4px;
      background: #eef2f7;
      padding: 1px 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.92em;
    }
    .stem-sihua-block {
      display: grid;
      gap: 7px;
    }
    .stem-sihua-block h4 {
      margin: 0;
      font-size: 13px;
    }
    pre {
      margin: 0;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #111816;
      color: #e7f5ed;
      padding: 14px;
      overflow: auto;
      font-size: 12px;
      line-height: 1.55;
    }
    @media (max-width: 900px) {
      main { grid-template-columns: 1fr; }
      #birth-form { border-right: 0; border-bottom: 1px solid var(--line); }
      .summary { grid-template-columns: 1fr 1fr; }
      .palace-panel { grid-template-columns: 1fr; }
      .palace-board { grid-template-columns: repeat(2, minmax(140px, 1fr)); }
      .center-cell { grid-column: auto; grid-row: auto; min-height: 120px; }
      .selected-grid { grid-template-columns: 1fr; }
      .ai-chat-form { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header><h1>ZiweiMaster 人工校验台</h1></header>
  <main>
    <form id="birth-form">
      <fieldset>
        <legend>命例档案</legend>
        <label for="caseSelect">历史命例</label>
        <select id="caseSelect" name="caseSelect">
          <option value="">新命例</option>
        </select>
        <div class="case-actions">
          <button type="button" id="save-case-btn">保存命例</button>
          <button class="secondary" type="button" id="new-case-btn">新建</button>
        </div>
        <div class="case-status" id="case-status">尚未保存</div>
      </fieldset>
      <fieldset>
        <legend>出生资料</legend>
        <label for="name">姓名</label>
        <input id="name" name="name" value="测试命盘" autocomplete="name" />
        <div class="grid-2">
          <label for="gender">性别</label>
          <label for="calendarType">历法</label>
          <select id="gender" name="gender">
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
          <select id="calendarType" name="calendarType">
            <option value="solar">阳历</option>
            <option value="lunar">阴历</option>
          </select>
        </div>
        <label for="birthDateTime">出生日期时间</label>
        <input id="birthDateTime" name="birthDateTime" type="datetime-local" value="1981-06-20T00:30" />
        <div class="grid-2">
          <label for="offset">时区偏移</label>
          <label for="timezone">时区名称</label>
          <select id="offset" name="offset">
            <option value="+08:00">中国标准时间 +08:00</option>
            <option value="+09:00">日本/韩国 +09:00</option>
            <option value="+00:00">UTC +00:00</option>
            <option value="-05:00">美东标准 -05:00</option>
            <option value="-08:00">美西标准 -08:00</option>
          </select>
          <input id="timezone" name="timezone" value="Asia/Shanghai" />
        </div>
      </fieldset>
      <fieldset>
        <legend>真太阳时</legend>
        <label class="check">
          <input name="trueSolarTime" type="checkbox" checked />
          使用真太阳时
        </label>
        <div class="grid-2">
          <label for="birthPlaceProvince">出生省份</label>
          <label for="birthPlaceCity">地级市</label>
          <select id="birthPlaceProvince" name="birthPlaceProvince"></select>
          <select id="birthPlaceCity" name="birthPlaceCity"></select>
        </div>
        <div class="grid-2">
          <label for="resolvedLongitude">城市中心经度</label>
          <label for="resolvedLatitude">城市中心纬度</label>
          <input id="resolvedLongitude" name="resolvedLongitude" readonly />
          <input id="resolvedLatitude" name="resolvedLatitude" readonly />
        </div>
        <label for="longitude">手动经度覆盖</label>
        <input id="longitude" name="longitude" type="number" placeholder="留空则使用城市中心经度" step="0.001" />
      </fieldset>
      <fieldset>
        <legend>分析范围</legend>
        <div class="grid-2">
          <label for="year">流年</label>
          <label for="focusPalace">关注宫位</label>
          <input id="year" name="year" type="number" value="2026" />
          <select id="focusPalace" name="focusPalace">
            <option value="子女宫">子女宫</option>
            <option value="财帛宫">财帛宫</option>
            <option value="官禄宫">官禄宫</option>
            <option value="迁移宫">迁移宫</option>
            <option value="交友宫">交友宫</option>
            <option value="命宫">命宫</option>
          </select>
        </div>
      </fieldset>
      <fieldset>
        <legend>AI 设置</legend>
        <div class="ai-settings">
          <label for="expertProfile">专家流派</label>
          <select id="expertProfile" name="expertProfile">
            <option value="balanced">综合派</option>
            <option value="south">南派</option>
            <option value="north">北派</option>
            <option value="sanhe">三合派</option>
            <option value="feixing">飞星派</option>
          </select>
          <label for="answerStyle">回答风格</label>
          <select id="answerStyle" name="answerStyle">
            <option value="mixed">普通 + 专业依据</option>
            <option value="plain">通俗回答</option>
            <option value="professional">专业回答</option>
          </select>
          <label class="followup-toggle">
            <input id="allowFollowup" name="allowFollowup" type="checkbox" checked />
            允许先追问
          </label>
        </div>
      </fieldset>
      <div class="actions">
        <button type="submit">生成 Payload</button>
        <button class="secondary" type="button" id="natal-btn">只看本命盘</button>
        <button class="ai" type="button" id="ai-btn">填入示例问题</button>
      </div>
    </form>
    <section class="output">
      <div class="summary">
        <div class="metric"><span>流年</span><strong id="m-year">-</strong></div>
        <div class="metric"><span>虚岁</span><strong id="m-age">-</strong></div>
        <div class="metric"><span>真太阳时</span><strong id="m-solar">-</strong></div>
        <div class="metric"><span>流年四化</span><strong id="m-sihua">-</strong></div>
      </div>
      <div class="warnings" id="warnings">等待生成</div>
      <details class="chart-drawer" open>
        <summary>盘面参考：十二宫、三方四正与飞星落点</summary>
      <div class="palace-panel">
        <div class="palace-toolbar">
          <h2>十二宫盘</h2>
          <div class="palace-tools">
            <div class="layer-switch" aria-label="盘面层级">
              <button type="button" class="active" data-layer="natal">本命</button>
              <button type="button" data-layer="decade">大限</button>
              <button type="button" data-layer="annual">流年</button>
            </div>
            <label class="overlay-toggle"><input id="overlay-decade" type="checkbox" checked />叠加大限</label>
            <label class="overlay-toggle"><input id="overlay-annual" type="checkbox" checked />叠加流年</label>
          </div>
        </div>
        <div class="palace-board" id="palace-board">
          <div class="center-cell"><div><strong>等待生成</strong>提交后显示十二宫盘</div></div>
        </div>
        <div class="selected-panel" id="selected-panel">
          <h3>三方四正 / 四化飞星</h3>
          <div class="selected-grid">
            <div class="selected-box"><span>已选本宫</span><strong id="selected-center">-</strong></div>
            <div class="selected-box"><span>对宫</span><strong id="selected-opposite">-</strong></div>
            <div class="selected-box"><span>三合两宫</span><strong id="selected-trines">-</strong></div>
          </div>
          <div class="flystar-list" id="flystar-list">
            <span class="flystar-item">生成后点击任意宫位查看四化飞星</span>
          </div>
          <div class="stem-sihua-block">
            <h4>宫干四化</h4>
            <div class="flystar-list" id="stem-sihua-list">
              <span class="flystar-item">生成后点击任意宫位查看宫干四化落点</span>
            </div>
          </div>
        </div>
      </div>
      </details>
      <div class="ai-panel">
        <h3>问答分析</h3>
        <div class="ai-output-window" id="ai-chat-log">
          <div class="chat-message assistant"><strong>AI</strong>这里会保留连续对话。必要时我会先问一个补充问题，等你回答后再生成长分析。</div>
        </div>
        <form class="ai-input-window" id="ai-chat-form">
          <div class="ai-chat-form">
            <textarea id="ai-question" placeholder="直接问，或回答 AI 刚才追问的问题。比如“帮我看 2028 年财帛宫流年四化，重点看三方四正和宫干飞星”。"></textarea>
            <button type="submit" id="ai-send">发送</button>
          </div>
        </form>
      </div>
      <details class="chart-drawer">
        <summary>调试 JSON</summary>
        <pre id="json">{}</pre>
      </details>
    </section>
  </main>
  <script>
    const form = document.querySelector("#birth-form");
    const json = document.querySelector("#json");
    const warnings = document.querySelector("#warnings");
    const palaceBoard = document.querySelector("#palace-board");
    const aiChatForm = document.querySelector("#ai-chat-form");
    const aiQuestion = document.querySelector("#ai-question");
    const aiSend = document.querySelector("#ai-send");
    const aiChatLog = document.querySelector("#ai-chat-log");
    const expertProfile = document.querySelector("#expertProfile");
    const answerStyle = document.querySelector("#answerStyle");
    const allowFollowup = document.querySelector("#allowFollowup");
    const caseSelect = document.querySelector("#caseSelect");
    const saveCaseBtn = document.querySelector("#save-case-btn");
    const newCaseBtn = document.querySelector("#new-case-btn");
    const caseStatus = document.querySelector("#case-status");
    let latestData = null;
    let activeLayer = "natal";
    let selectedPalaceId = 3;
    let activeAssistantBody = null;
    let activeProcessItem = null;
    let activeProcessIcon = null;
    let activeProcessLatest = null;
    let activeProcessHistory = null;
    let latestAnswerText = "";
    let chatMessages = [];
    let activeCaseId = "";
    const initialAiText = "这里会保留连续对话。必要时我会先问一个补充问题，等你回答后再生成长分析。";
    const palaceOrder = ["命宫", "兄弟宫", "夫妻宫", "子女宫", "财帛宫", "疾厄宫", "迁移宫", "交友宫", "官禄宫", "田宅宫", "福德宫", "父母宫"];
    const stemAttributes = {
      "甲": ["阳", "木"], "乙": ["阴", "木"], "丙": ["阳", "火"], "丁": ["阴", "火"], "戊": ["阳", "土"],
      "己": ["阴", "土"], "庚": ["阳", "金"], "辛": ["阴", "金"], "壬": ["阳", "水"], "癸": ["阴", "水"]
    };
    const branchAttributes = {
      "子": ["阳", "水"], "丑": ["阴", "土"], "寅": ["阳", "木"], "卯": ["阴", "木"], "辰": ["阳", "土"], "巳": ["阴", "火"],
      "午": ["阳", "火"], "未": ["阴", "土"], "申": ["阳", "金"], "酉": ["阴", "金"], "戌": ["阳", "土"], "亥": ["阴", "水"]
    };
    const sihuaTable = {
      "甲": { "禄": "廉贞", "权": "破军", "科": "武曲", "忌": "太阳" },
      "乙": { "禄": "天机", "权": "天梁", "科": "紫微", "忌": "太阴" },
      "丙": { "禄": "天同", "权": "天机", "科": "文昌", "忌": "廉贞" },
      "丁": { "禄": "太阴", "权": "天同", "科": "天机", "忌": "巨门" },
      "戊": { "禄": "贪狼", "权": "太阴", "科": "右弼", "忌": "天机" },
      "己": { "禄": "武曲", "权": "贪狼", "科": "天梁", "忌": "文曲" },
      "庚": { "禄": "太阳", "权": "武曲", "科": "太阴", "忌": "天同" },
      "辛": { "禄": "巨门", "权": "太阳", "科": "文曲", "忌": "文昌" },
      "壬": { "禄": "天梁", "权": "紫微", "科": "左辅", "忌": "武曲" },
      "癸": { "禄": "破军", "权": "巨门", "科": "太阴", "忌": "贪狼" }
    };
    const metrics = {
      year: document.querySelector("#m-year"),
      age: document.querySelector("#m-age"),
      solar: document.querySelector("#m-solar"),
      sihua: document.querySelector("#m-sihua")
    };
    let placeLibrary = { provinces: [], byProvince: {} };

    function selectedCity() {
      const province = document.querySelector("#birthPlaceProvince").value;
      const city = document.querySelector("#birthPlaceCity").value;
      return (placeLibrary.byProvince[province] || []).find((item) => item.city === city);
    }

    function stripLayerPrefix(name) {
      return String(name || "").replace(/^本命|^大限|^流年/, "");
    }

    function normalizePalaceId(id) {
      return ((Number(id) % 12) + 12) % 12;
    }

    function oppositeId(id) {
      return normalizePalaceId(id + 6);
    }

    function trineIds(id) {
      return [normalizePalaceId(id + 4), normalizePalaceId(id + 8)];
    }

    function relationIds(id) {
      return [normalizePalaceId(id), oppositeId(id), ...trineIds(id)];
    }

    function updateCityOptions() {
      const province = document.querySelector("#birthPlaceProvince").value;
      const citySelect = document.querySelector("#birthPlaceCity");
      const cities = placeLibrary.byProvince[province] || [];
      citySelect.innerHTML = cities.map((item) => '<option value="' + item.city + '">' + item.city + '</option>').join("");
      updateResolvedPlace();
    }

    function updateResolvedPlace() {
      const city = selectedCity();
      document.querySelector("#resolvedLongitude").value = city ? city.longitude : "";
      document.querySelector("#resolvedLatitude").value = city ? city.latitude : "";
    }

    async function loadPlaceLibrary() {
      placeLibrary = await fetch("/api/places/china").then((response) => response.json());
      const provinceSelect = document.querySelector("#birthPlaceProvince");
      provinceSelect.innerHTML = placeLibrary.provinces
        .map((province) => '<option value="' + province + '">' + province + '</option>')
        .join("");
      provinceSelect.value = "北京市";
      updateCityOptions();
      document.querySelector("#birthPlaceCity").value = "北京市";
      updateResolvedPlace();
    }

    function baseInput() {
      const data = new FormData(form);
      const local = data.get("birthDateTime");
      const offset = data.get("offset");
      const manualLongitude = String(data.get("longitude") || "").trim();
      const city = selectedCity();
      return {
        name: data.get("name") || undefined,
        gender: data.get("gender"),
        calendarType: data.get("calendarType"),
        birthDateTime: local + ":00" + offset,
        timezone: data.get("timezone") || undefined,
        trueSolarTime: data.get("trueSolarTime") === "on",
        birthPlaceProvince: data.get("birthPlaceProvince") || undefined,
        birthPlaceCity: data.get("birthPlaceCity") || undefined,
        latitude: city ? city.latitude : undefined,
        longitude: manualLongitude === "" ? undefined : Number(manualLongitude),
        locale: "zh-CN"
      };
    }

    async function postJson(url, payload) {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    }

    async function getJson(url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    }

    function setCaseStatus(text) {
      caseStatus.textContent = text;
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function inlineMarkdown(text) {
      const codePattern = new RegExp(String.fromCharCode(96) + "([^" + String.fromCharCode(96) + "]+)" + String.fromCharCode(96), "g");
      return escapeHtml(text)
        .replace(codePattern, "<code>$1</code>")
        .replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>");
    }

    function renderMarkdown(text) {
      const lines = String(text || "").replace(/\\r\\n/g, "\\n").split("\\n");
      const html = [];
      let listType = "";
      const closeList = () => {
        if (listType) {
          html.push("</" + listType + ">");
          listType = "";
        }
      };
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
          closeList();
          continue;
        }
        const heading = line.match(/^(#{1,3})\\s+(.+)$/);
        if (heading) {
          closeList();
          const level = heading[1].length;
          html.push("<h" + level + ">" + inlineMarkdown(heading[2]) + "</h" + level + ">");
          continue;
        }
        const ordered = line.match(/^\\d+[\\.、)]\\s+(.+)$/);
        if (ordered) {
          if (listType !== "ol") {
            closeList();
            html.push("<ol>");
            listType = "ol";
          }
          html.push("<li>" + inlineMarkdown(ordered[1]) + "</li>");
          continue;
        }
        const bullet = line.match(/^[-*]\\s+(.+)$/);
        if (bullet) {
          if (listType !== "ul") {
            closeList();
            html.push("<ul>");
            listType = "ul";
          }
          html.push("<li>" + inlineMarkdown(bullet[1]) + "</li>");
          continue;
        }
        closeList();
        html.push("<p>" + inlineMarkdown(line) + "</p>");
      }
      closeList();
      return html.join("");
    }

    function setAssistantBody(body, text) {
      body.innerHTML = renderMarkdown(text);
    }

    function currentCaseTitle() {
      const name = String(document.querySelector("#name").value || "").trim() || "未命名命例";
      const date = String(document.querySelector("#birthDateTime").value || "").slice(0, 10);
      return date ? name + " " + date : name;
    }

    function currentUiState() {
      return {
        year: Number(document.querySelector("#year").value),
        focusPalace: document.querySelector("#focusPalace").value,
        activeLayer,
        selectedPalaceId,
        expertProfile: expertProfile.value,
        answerStyle: answerStyle.value,
        allowFollowup: allowFollowup.checked
      };
    }

    async function loadCaseList(selectedId) {
      const data = await getJson("/api/cases");
      const options = ['<option value="">新命例</option>'].concat(
        (data.cases || []).map((item) =>
          '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.title) + '</option>'
        )
      );
      caseSelect.innerHTML = options.join("");
      caseSelect.value = selectedId || activeCaseId || "";
    }

    async function saveCurrentCase(silent) {
      const payload = {
        id: activeCaseId || undefined,
        title: currentCaseTitle(),
        birthInput: baseInput(),
        uiState: currentUiState(),
        analysisData: latestData,
        chatMessages
      };
      const saved = await postJson("/api/cases", payload);
      activeCaseId = saved.id;
      await loadCaseList(activeCaseId);
      setCaseStatus((silent ? "已自动保存 " : "已保存 ") + new Date(saved.updatedAt).toLocaleTimeString());
      return saved;
    }

    function resetChatLog(messages) {
      aiChatLog.innerHTML = "";
      chatMessages = (messages || []).slice(-16);
      if (!chatMessages.length) {
        appendChat("assistant", initialAiText);
        return;
      }
      chatMessages.forEach((message) => {
        appendChat(message.role, message.content);
      });
    }

    function splitDateTimeOffset(value) {
      const text = String(value || "");
      const offsetMatch = text.match(/([+-]\\d\\d:\\d\\d|Z)$/);
      return {
        local: text.slice(0, 16),
        offset: offsetMatch ? (offsetMatch[1] === "Z" ? "+00:00" : offsetMatch[1]) : "+08:00"
      };
    }

    function applyBirthInput(input) {
      if (!input || typeof input !== "object") return;
      const setValue = (selector, value) => {
        if (value !== undefined && value !== null) document.querySelector(selector).value = value;
      };
      setValue("#name", input.name);
      setValue("#gender", input.gender);
      setValue("#calendarType", input.calendarType);
      const dateTime = splitDateTimeOffset(input.birthDateTime);
      setValue("#birthDateTime", dateTime.local);
      setValue("#offset", dateTime.offset);
      setValue("#timezone", input.timezone);
      document.querySelector('[name="trueSolarTime"]').checked = input.trueSolarTime !== false;
      if (input.birthPlaceProvince && placeLibrary.byProvince[input.birthPlaceProvince]) {
        document.querySelector("#birthPlaceProvince").value = input.birthPlaceProvince;
        updateCityOptions();
        if (input.birthPlaceCity) {
          document.querySelector("#birthPlaceCity").value = input.birthPlaceCity;
          updateResolvedPlace();
        }
      }
      document.querySelector("#longitude").value = "";
    }

    function applyUiState(state) {
      if (!state || typeof state !== "object") return;
      if (state.year) document.querySelector("#year").value = state.year;
      if (state.focusPalace) document.querySelector("#focusPalace").value = state.focusPalace;
      if (state.expertProfile) expertProfile.value = state.expertProfile;
      if (state.answerStyle) answerStyle.value = state.answerStyle;
      allowFollowup.checked = state.allowFollowup !== false;
      selectedPalaceId = Number.isInteger(state.selectedPalaceId) ? state.selectedPalaceId : selectedPalaceId;
      setActiveLayer(state.activeLayer || activeLayer);
    }

    async function loadStoredCase(id) {
      if (!id) return;
      const item = await getJson("/api/cases/" + encodeURIComponent(id));
      activeCaseId = item.id;
      applyBirthInput(item.birthInput);
      applyUiState(item.uiState);
      latestData = item.analysisData || null;
      json.textContent = latestData ? JSON.stringify(latestData, null, 2) : "{}";
      if (latestData) {
        render(latestData);
        if (item.uiState?.selectedPalaceId !== undefined) {
          selectedPalaceId = Number(item.uiState.selectedPalaceId);
          renderPalaceBoard();
        }
      } else {
        palaceBoard.innerHTML = '<div class="center-cell"><div><strong>等待生成</strong>提交后显示十二宫盘</div></div>';
      }
      resetChatLog(item.chatMessages || []);
      setCaseStatus("已载入 " + item.title);
    }

    function appendReasoning(text) {
      if (!activeProcessItem) {
        activeProcessItem = appendProcessPanel("正在思考...");
      }
      const next = String(text || "").trim();
      activeProcessItem.dataset.latest = next;
      activeProcessIcon.textContent = processIconFor(next);
      activeProcessLatest.textContent = next || "正在思考...";
      activeProcessHistory.textContent += (activeProcessHistory.textContent ? "\\n" : "") + next;
      aiChatLog.scrollTop = aiChatLog.scrollHeight;
    }

    function processIconFor(text) {
      const value = String(text || "");
      if (value.includes("MCP") || value.includes("盘面") || value.includes("工具")) return "◇";
      if (value.includes("调度") || value.includes("Planner")) return "⌁";
      if (value.includes("推理") || value.includes("思考")) return "✦";
      if (value.includes("错误") || value.includes("失败")) return "!";
      return "·";
    }

    function appendAnswer(text) {
      if (activeAssistantBody?.dataset.pending === "true") {
        activeAssistantBody.innerHTML = "";
        activeAssistantBody.dataset.pending = "false";
      }
      latestAnswerText += text;
      if (activeAssistantBody) {
        activeAssistantBody.parentElement.hidden = false;
        setAssistantBody(activeAssistantBody, latestAnswerText);
        aiChatLog.scrollTop = aiChatLog.scrollHeight;
      }
    }

    function appendProcessPanel(initialText) {
      const item = document.createElement("details");
      item.className = "process-panel";
      const summary = document.createElement("summary");
      const icon = document.createElement("span");
      icon.className = "process-icon";
      icon.textContent = processIconFor(initialText);
      const latest = document.createElement("span");
      latest.className = "process-latest";
      latest.textContent = initialText;
      const history = document.createElement("pre");
      history.className = "process-history";
      history.textContent = initialText;
      summary.append(icon, latest);
      item.append(summary, history);
      aiChatLog.appendChild(item);
      aiChatLog.scrollTop = aiChatLog.scrollHeight;
      activeProcessItem = item;
      activeProcessIcon = icon;
      activeProcessLatest = latest;
      activeProcessHistory = history;
      return item;
    }

    function appendChat(role, text, extraClass) {
      const item = document.createElement("div");
      item.className = "chat-message " + role + (extraClass ? " " + extraClass : "");
      const label = document.createElement("strong");
      label.textContent = role === "user" ? "你" : "AI";
      const body = document.createElement("div");
      if (role === "assistant") {
        body.className = "markdown-body";
        setAssistantBody(body, text);
      } else {
        body.textContent = text;
      }
      item.append(label, body);
      aiChatLog.appendChild(item);
      aiChatLog.scrollTop = aiChatLog.scrollHeight;
      return { item, body };
    }

    function setActiveLayer(layer) {
      activeLayer = layer;
      document.querySelectorAll("[data-layer]").forEach((item) => {
        item.classList.toggle("active", item.dataset.layer === layer);
      });
    }

    async function syncRoutedChart(route) {
      if (!route) return;
      document.querySelector("#year").value = route.year;
      document.querySelector("#focusPalace").value = route.palaceName;
      setActiveLayer(route.layer);
      const payload = {
        ...baseInput(),
        year: route.year,
        focusPalaces: [route.palaceName],
        includeDecade: true,
        includeAnnual: true,
        includeSanfang: true,
        includeTransformations: true,
        includeConflicts: true
      };
      const nextData = await postJson("/api/analysis/payload", payload);
      render(nextData);
      selectedPalaceId = palaceOrder.indexOf(route.palaceName);
      if (selectedPalaceId < 0) selectedPalaceId = 0;
      renderPalaceBoard();
    }

    async function streamDeepSeek(payload) {
      latestAnswerText = "";
      let saveAssistantMessage = true;
      appendProcessPanel("已收到问题，正在连接分析服务。");
      const assistant = appendChat("assistant", "正在判断是否需要先追问...", "working");
      assistant.item.hidden = true;
      activeAssistantBody = assistant.body;
      activeAssistantBody.dataset.pending = "true";
      aiSend.disabled = true;
      aiSend.textContent = "分析中";
      const startedAt = Date.now();
      const heartbeat = window.setInterval(() => {
        const seconds = Math.round((Date.now() - startedAt) / 1000);
        appendReasoning("仍在工作：AI Planner / MCP / DeepSeek 流式回答未结束，已等待约 " + seconds + " 秒。");
      }, 8000);
      try {
        const response = await fetch("/api/ai/deepseek-stream", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok || !response.body) {
          const errorText = "DeepSeek 请求失败：" + await response.text();
          appendReasoning(errorText);
          latestAnswerText = errorText;
          assistant.item.hidden = false;
          setAssistantBody(activeAssistantBody, errorText);
          activeAssistantBody.dataset.pending = "false";
          saveAssistantMessage = false;
          return;
        }
        appendReasoning("服务已连接，先判断是否需要向你追问。");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\\n\\n");
          buffer = chunks.pop() || "";
          for (const chunk of chunks) {
            const eventLine = chunk.split("\\n").find((line) => line.startsWith("event:"));
            const dataLine = chunk.split("\\n").find((line) => line.startsWith("data:"));
            if (!eventLine || !dataLine) continue;
            const event = eventLine.slice(6).trim();
            const data = JSON.parse(dataLine.slice(5).trim());
            if (event === "routing") {
              appendReasoning("信息已补足，正在按 AI Planner 调度盘面工具。");
              const calls = (data.toolCalls || []).map((call) =>
                call.tool + "：" + call.layer + "/" + call.palaceName + "/" + call.year + "（" + call.reason + "）"
              ).join("\\n");
              appendReasoning("自动调度：" + data.reason + (calls ? "\\n" + calls : ""));
              syncRoutedChart(data).catch((error) => appendReasoning("盘面同步失败：" + error.message));
            } else if (event === "mcp") {
              appendReasoning("MCP 已读取盘面，正在等待模型生成正式回答。");
              appendReasoning("MCP 已读取：" + data.selectedPalace + "；对宫 " + data.visualRelations.opposite + "；三合 " + data.visualRelations.trines.join("、"));
            } else if (event === "reasoning_summary") {
              appendReasoning(data.step);
            } else if (event === "clarification") {
              const question = String(data.question || "").trim();
              latestAnswerText = question;
              if (activeAssistantBody) {
                assistant.item.hidden = false;
                setAssistantBody(activeAssistantBody, "我需要先确认一个信息：\\n" + question);
                activeAssistantBody.dataset.pending = "false";
                aiChatLog.scrollTop = aiChatLog.scrollHeight;
              }
              appendReasoning("本轮先追问，不生成长回答：" + (data.reason || "等待用户补充。"));
            } else if (event === "answer_delta") {
              appendAnswer(data.text);
            } else if (event === "error") {
              const errorText = "错误：" + data.message;
              appendReasoning(errorText);
              saveAssistantMessage = false;
              if (activeAssistantBody?.dataset.pending === "true") {
                latestAnswerText = errorText;
                assistant.item.hidden = false;
                setAssistantBody(activeAssistantBody, errorText);
                activeAssistantBody.dataset.pending = "false";
              }
            } else if (event === "done") {
              if (activeProcessItem) {
                activeProcessItem.remove();
                activeProcessItem = null;
                activeProcessIcon = null;
                activeProcessLatest = null;
                activeProcessHistory = null;
              }
            }
          }
        }
      } finally {
        window.clearInterval(heartbeat);
        assistant.item.classList.remove("working");
        aiSend.disabled = false;
        aiSend.textContent = "发送";
        if (activeAssistantBody?.dataset.pending === "true") {
          latestAnswerText = latestAnswerText.trim() || "这次没有收到正式回答，请再问一次。";
          assistant.item.hidden = false;
          setAssistantBody(activeAssistantBody, latestAnswerText);
          activeAssistantBody.dataset.pending = "false";
        }
        if (saveAssistantMessage && latestAnswerText.trim()) {
          chatMessages.push({ role: "assistant", content: latestAnswerText.trim() });
          chatMessages = chatMessages.slice(-16);
        }
        saveCurrentCase(true).catch((error) => setCaseStatus("保存失败：" + error.message));
        activeAssistantBody = null;
        activeProcessItem = null;
        activeProcessIcon = null;
        activeProcessLatest = null;
        activeProcessHistory = null;
      }
    }

    function render(data) {
      latestData = data;
      json.textContent = JSON.stringify(data, null, 2);
      const allWarnings = data.llmHints?.warnings || data.warnings || data.meta?.warnings || [];
      warnings.textContent = allWarnings.length ? allWarnings.join("\\n") : "没有 warning";
      metrics.year.textContent = data.focus?.currentYear || data.year || "-";
      metrics.age.textContent = data.focus?.currentAge || data.sui || "-";
      metrics.solar.textContent = data.meta?.trueSolarTime || "-";
      const annual = data.annual?.annualInfo?.transformations || data.transformations || [];
      metrics.sihua.textContent = annual.map((item) => item.star + item.transformation).join(" / ") || "-";
      selectedPalaceId = palaceOrder.indexOf(document.querySelector("#focusPalace").value);
      if (selectedPalaceId < 0) selectedPalaceId = 0;
      renderPalaceBoard();
    }

    function layerTransformTargets(data, layer) {
      if (layer === "natal") return data.transformations?.natal || [];
      if (layer === "decade") return data.transformations?.decade || data.currentDecade?.transformationTargets || [];
      if (layer === "annual") return data.transformations?.annual || data.transformationTargets || [];
      return [];
    }

    function allStars(palace) {
      return [...(palace.majorStars || []), ...(palace.minorStars || []), ...(palace.auxiliaryStars || [])];
    }

    function starText(star) {
      return star.brightness ? star.name + '<span class="star-brightness">(' + star.brightness + ')</span>' : star.name;
    }

    function plainStarText(star) {
      if (!star) return "";
      return star.brightness ? star.name + "(" + star.brightness + ")" : star.name;
    }

    function stemBranchText(palace) {
      const stem = palace.heavenlyStem || "-";
      const branch = palace.earthlyBranch || "-";
      const stemAttr = stemAttributes[stem];
      const branchAttr = branchAttributes[branch];
      const stemText = stemAttr ? stem + " " + stemAttr[0] + stemAttr[1] : stem;
      const branchText = branchAttr ? branch + " " + branchAttr[0] + branchAttr[1] : branch;
      return { stemText, branchText };
    }

    function buildLayerPalaces(data, layer) {
      const natalPalaces = data.natal?.palaces || data.palaces || [];
      if (layer === "natal") {
        return natalPalaces.map((palace) => ({ ...palace, displayName: palace.name, sourceNatalPalaceId: palace.palaceId }));
      }
      const info = layer === "decade" ? data.decade?.decadeInfo || data.currentDecade : data.annual?.annualInfo || data;
      const mapping = info?.palaceMapping || [];
      const key = layer === "decade" ? "decadePalaceName" : "annualPalaceName";
      return mapping.map((item, index) => {
        const source = natalPalaces[item.natalPalaceId] || {};
        return {
          ...source,
          palaceId: index,
          displayName: item[key] || source.name,
          name: item[key] || source.name,
          earthlyBranch: item.branch || source.earthlyBranch,
          sourceNatalPalaceId: item.natalPalaceId
        };
      });
    }

    function transformationsForPalace(data, layer, palace) {
      const targets = layerTransformTargets(data, layer);
      return targets.filter((target) => target.targetNatalPalace?.palaceId === palace.sourceNatalPalaceId);
    }

    function stackItemsForPalace(data, palace) {
      const items = [];
      if (document.querySelector("#overlay-decade").checked) {
        const decade = data.decade?.decadeInfo || data.currentDecade;
        const decadeMap = decade?.palaceMapping?.find((item) => item.natalPalaceId === palace.sourceNatalPalaceId);
        if (decadeMap) items.push({ layer: "decade", label: "大限", value: decadeMap.decadePalaceName });
      }
      if (document.querySelector("#overlay-annual").checked) {
        const annual = data.annual?.annualInfo || data;
        const annualMap = annual?.palaceMapping?.find((item) => item.natalPalaceId === palace.sourceNatalPalaceId);
        if (annualMap) items.push({ layer: "annual", label: "流年", value: annualMap.annualPalaceName });
      }
      return items;
    }

    function drawSanfangOverlay() {
      const overlay = document.querySelector("#sanfang-overlay");
      if (!overlay) return;
      overlay.innerHTML = "";
      const boardRect = palaceBoard.getBoundingClientRect();
      overlay.setAttribute("viewBox", "0 0 " + boardRect.width + " " + boardRect.height);
      const from = document.querySelector('.palace-cell[data-palace-id="' + selectedPalaceId + '"]');
      if (!from) return;
      const fromRect = from.getBoundingClientRect();
      const center = {
        x: fromRect.left - boardRect.left + fromRect.width / 2,
        y: fromRect.top - boardRect.top + fromRect.height / 2
      };
      const drawLine = (targetId, className) => {
        const to = document.querySelector('.palace-cell[data-palace-id="' + targetId + '"]');
        if (!to) return;
        const toRect = to.getBoundingClientRect();
        const end = {
          x: toRect.left - boardRect.left + toRect.width / 2,
          y: toRect.top - boardRect.top + toRect.height / 2
        };
        if (className === "trine-line") {
          const mid = { x: boardRect.width / 2, y: boardRect.height / 2 };
          const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
          polyline.setAttribute("points", center.x + "," + center.y + " " + mid.x + "," + mid.y + " " + end.x + "," + end.y);
          polyline.setAttribute("class", className);
          overlay.appendChild(polyline);
        } else {
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", String(center.x));
          line.setAttribute("y1", String(center.y));
          line.setAttribute("x2", String(end.x));
          line.setAttribute("y2", String(end.y));
          line.setAttribute("class", className);
          overlay.appendChild(line);
        }
      };
      drawLine(oppositeId(selectedPalaceId), "opposite-line");
      trineIds(selectedPalaceId).forEach((id) => drawLine(id, "trine-line"));
    }

    function updateSelectedPanel(palaces) {
      const center = palaces[selectedPalaceId];
      const opposite = palaces[oppositeId(selectedPalaceId)];
      const trines = trineIds(selectedPalaceId).map((id) => palaces[id]).filter(Boolean);
      document.querySelector("#selected-center").textContent = center ? center.displayName || center.name : "-";
      document.querySelector("#selected-opposite").textContent = opposite ? opposite.displayName || opposite.name : "-";
      document.querySelector("#selected-trines").textContent = trines.map((item) => item.displayName || item.name).join("、") || "-";

      const relatedSourceIds = relationIds(selectedPalaceId)
        .map((id) => palaces[id]?.sourceNatalPalaceId)
        .filter((id) => typeof id === "number");
      const targets = layerTransformTargets(latestData, activeLayer).filter((target) =>
        relatedSourceIds.includes(target.targetNatalPalace?.palaceId)
      );
      const list = document.querySelector("#flystar-list");
      if (!targets.length) {
        list.innerHTML = '<span class="flystar-item">当前三方四正内暂无本层四化飞入</span>';
      } else {
        list.innerHTML = targets.map((target) => {
          const bad = target.transformation === "忌" ? " bad" : "";
          return '<span class="flystar-item' + bad + '">' +
            target.star + target.transformation + ' → ' + target.targetNatalPalace.palaceName +
            '，冲 ' + target.oppositeNatalPalace.palaceName +
          '</span>';
        }).join("");
      }

      const stemList = document.querySelector("#stem-sihua-list");
      if (!center || !center.heavenlyStem || !sihuaTable[center.heavenlyStem]) {
        stemList.innerHTML = '<span class="flystar-item">当前宫位没有可用宫干四化</span>';
        return;
      }
      const row = sihuaTable[center.heavenlyStem];
      stemList.innerHTML = ["禄", "权", "科", "忌"].map((type) => {
        const starName = row[type];
        const targetPalace = palaces.find((palace) => allStars(palace).some((star) => star.name === starName));
        const targetStar = targetPalace ? allStars(targetPalace).find((star) => star.name === starName) : null;
        const bad = type === "忌" ? " bad" : "";
        const targetText = targetPalace
          ? (targetPalace.displayName || targetPalace.name) + ' · ' + plainStarText(targetStar)
          : '未在当前盘面找到 ' + starName;
        return '<span class="flystar-item' + bad + '">宫干' + center.heavenlyStem + '：' + starName + type + ' → ' + targetText + '</span>';
      }).join("");
    }

    function renderPalaceBoard() {
      if (!latestData) return;
      const palaces = buildLayerPalaces(latestData, activeLayer);
      const focus = document.querySelector("#focusPalace").value;
      const title = activeLayer === "natal" ? "本命盘" : activeLayer === "decade" ? "大限盘" : "流年盘";
      const slotOrder = [
        0, 1, 2, 3,
        11, "center", "center", 4,
        10, "center", "center", 5,
        9, 8, 7, 6
      ];
      const renderedCenter = { done: false };
      const opp = oppositeId(selectedPalaceId);
      const trines = trineIds(selectedPalaceId);
      palaceBoard.innerHTML = slotOrder.map((slot) => {
        if (slot === "center") {
          if (renderedCenter.done) return "";
          renderedCenter.done = true;
          return '<div class="center-cell"><div><strong>' + title + '</strong><span>外圈按十二宫顺序旋转；切换层级可看本命、大限、流年叠宫。</span></div></div>';
        }
         const palace = palaces[slot];
         if (!palace) return '<div class="palace-cell"></div>';
         const ganzhi = stemBranchText(palace);
          const stars = allStars(palace).slice(0, 8).map(starText).join("、") || "无主星";
         const transforms = transformationsForPalace(latestData, activeLayer, palace);
         const transformHtml = transforms.map((item) => {
           const bad = item.transformation === "忌" ? " bad" : "";
           return '<span class="transform-pill' + bad + '">' + item.star + item.transformation + '</span>';
         }).join("");
         const stackHtml = stackItemsForPalace(latestData, palace).map((item) =>
           '<div class="stack-item ' + item.layer + '">' + item.label + '：' + item.value + '</div>'
         ).join("");
         const isFocus = stripLayerPrefix(palace.displayName || palace.name) === focus;
          const relationClass =
            palace.palaceId === selectedPalaceId ? " selected" :
            palace.palaceId === opp ? " opposite" :
            trines.includes(palace.palaceId) ? " trine" : "";
          return '<div class="palace-cell' + (isFocus ? " focus" : "") + relationClass + '" data-palace-id="' + palace.palaceId + '" data-source-id="' + palace.sourceNatalPalaceId + '">' +
            '<div class="palace-name-row"><span class="palace-name">' + (palace.displayName || palace.name) + '</span><span class="palace-branch">' + (palace.earthlyBranch || "-") + '</span></div>' +
            '<div class="palace-ganzhi"><strong>干支五行</strong><span>宫干：' + ganzhi.stemText + '</span><span>宫支：' + ganzhi.branchText + '</span></div>' +
             '<div class="palace-stars"><strong>星曜亮度</strong>：' + stars + '</div>' +
           '<div class="palace-stack">' + stackHtml + '</div>' +
           '<div class="palace-transform">' + transformHtml + '</div>' +
         '</div>';
      }).join("") + '<svg class="sanfang-overlay" id="sanfang-overlay" aria-hidden="true"></svg>';
      updateSelectedPanel(palaces);
      requestAnimationFrame(drawSanfangOverlay);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const payload = {
        ...baseInput(),
        year: Number(data.get("year")),
        focusPalaces: [data.get("focusPalace")],
        includeDecade: true,
        includeAnnual: true,
        includeSanfang: true,
        includeTransformations: true,
        includeConflicts: true
      };
      render(await postJson("/api/analysis/payload", payload));
      await saveCurrentCase(true);
    });

    document.querySelector("#natal-btn").addEventListener("click", async () => {
      render(await postJson("/api/chart/natal", baseInput()));
      await saveCurrentCase(true);
    });

    async function askDeepSeek(question) {
      const data = new FormData(form);
      const focusPalace = data.get("focusPalace");
      const year = Number(data.get("year"));
      const payload = {
        ...baseInput(),
        year,
        focusPalaces: [focusPalace],
        palaceName: focusPalace,
        layer: activeLayer,
        question,
        messages: chatMessages.slice(-12),
        expertProfile: expertProfile.value,
        answerStyle: answerStyle.value,
        allowFollowup: allowFollowup.checked,
        includeDecade: true,
        includeAnnual: true,
        includeSanfang: true,
        includeTransformations: true,
        includeConflicts: true
      };
      if (!latestData) {
        render(await postJson("/api/analysis/payload", payload));
      }
      await streamDeepSeek(payload);
    }

    document.querySelector("#ai-btn").addEventListener("click", () => {
      aiQuestion.value = "帮我看 2028 年财帛宫流年四化，重点看三方四正和宫干飞星";
      aiQuestion.focus();
    });

    aiChatForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const question = aiQuestion.value.trim() || "请基于当前盘面，自动选择相关宫位做一次结构化分析。";
      appendChat("user", question);
      chatMessages.push({ role: "user", content: question });
      chatMessages = chatMessages.slice(-16);
      aiQuestion.value = "";
      await askDeepSeek(question);
    });

    saveCaseBtn.addEventListener("click", async () => {
      try {
        await saveCurrentCase(false);
      } catch (error) {
        setCaseStatus("保存失败：" + error.message);
      }
    });

    newCaseBtn.addEventListener("click", () => {
      activeCaseId = "";
      caseSelect.value = "";
      latestData = null;
      chatMessages = [];
      json.textContent = "{}";
      warnings.textContent = "等待生成";
      Object.values(metrics).forEach((item) => {
        item.textContent = "-";
      });
      palaceBoard.innerHTML = '<div class="center-cell"><div><strong>等待生成</strong>提交后显示十二宫盘</div></div>';
      resetChatLog([]);
      setCaseStatus("新命例，尚未保存");
    });

    caseSelect.addEventListener("change", async () => {
      try {
        if (!caseSelect.value) {
          newCaseBtn.click();
          return;
        }
        await loadStoredCase(caseSelect.value);
      } catch (error) {
        setCaseStatus("载入失败：" + error.message);
      }
    });

    document.querySelector("#birthPlaceProvince").addEventListener("change", updateCityOptions);
    document.querySelector("#birthPlaceCity").addEventListener("change", updateResolvedPlace);
    palaceBoard.addEventListener("click", (event) => {
      const cell = event.target.closest(".palace-cell");
      if (!cell || !cell.dataset.palaceId) return;
      selectedPalaceId = Number(cell.dataset.palaceId);
      renderPalaceBoard();
    });
    document.querySelectorAll("[data-layer]").forEach((button) => {
      button.addEventListener("click", () => {
        setActiveLayer(button.dataset.layer);
        renderPalaceBoard();
      });
    });
    document.querySelector("#overlay-decade").addEventListener("change", renderPalaceBoard);
    document.querySelector("#overlay-annual").addEventListener("change", renderPalaceBoard);
    window.addEventListener("resize", drawSanfangOverlay);
    async function bootstrap() {
      await loadPlaceLibrary();
      await loadCaseList("");
    }
    bootstrap().catch((error) => setCaseStatus("初始化失败：" + error.message));
  </script>
</body>
</html>`;
}
