const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const mode = process.argv[2] || 'unit';
const cwd = process.cwd();
const jestBin = path.join(cwd, 'node_modules', 'jest', 'bin', 'jest.js');
const reportsDir = path.join(cwd, 'reports', 'tests');
const jsonPath = path.join(reportsDir, `${mode}-report.json`);
const htmlPath = path.join(reportsDir, `${mode}-report.html`);

const modeConfig = {
  unit: {
    label: 'Testes Unitarios',
    extraArgs: [],
  },
  e2e: {
    label: 'Testes E2E',
    extraArgs: ['--config', './test/jest-e2e.json'],
  },
  integration: {
    label: 'Testes de Integracao',
    extraArgs: ['--config', './test/jest-integration.json'],
  },
};

if (!modeConfig[mode]) {
  console.error(`Modo invalido: "${mode}". Use "unit", "e2e" ou "integration".`);
  process.exit(1);
}

fs.mkdirSync(reportsDir, { recursive: true });

const jestArgs = [
  jestBin,
  ...modeConfig[mode].extraArgs,
  '--runInBand',
  '--json',
  `--outputFile=${jsonPath}`,
];

const result = spawnSync(process.execPath, jestArgs, {
  cwd,
  env: process.env,
  stdio: 'inherit',
});

if (!fs.existsSync(jsonPath)) {
  console.error('Nao foi possivel gerar o JSON de resultado do Jest.');
  process.exit(result.status ?? 1);
}

const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
fs.writeFileSync(htmlPath, buildHtml(report, modeConfig[mode].label), 'utf8');

console.log(`Relatorio HTML gerado em: ${htmlPath}`);
process.exit(result.status ?? (report.success ? 0 : 1));

function buildHtml(reportData, title) {
  const generatedAt = new Date().toLocaleString('pt-BR');
  const suites = reportData.testResults || [];
  const suiteCards = suites.map(renderSuite).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f4f1ea;
      --panel: #fffdf8;
      --text: #1f2937;
      --muted: #6b7280;
      --border: #e7dccb;
      --pass: #1f7a4f;
      --fail: #b42318;
      --pending: #9a6700;
      --shadow: 0 10px 25px rgba(64, 41, 19, 0.08);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background:
        radial-gradient(circle at top right, rgba(255, 215, 153, 0.25), transparent 30%),
        linear-gradient(180deg, #fbf7f0 0%, var(--bg) 100%);
      color: var(--text);
    }

    .page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 20px 48px;
    }

    .hero {
      background: linear-gradient(135deg, #fff8ee 0%, #fffdf8 100%);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 28px;
      box-shadow: var(--shadow);
      margin-bottom: 24px;
    }

    .hero h1 {
      margin: 0 0 10px;
      font-size: 2rem;
    }

    .hero p {
      margin: 0;
      color: var(--muted);
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 14px;
      margin: 24px 0;
    }

    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      box-shadow: var(--shadow);
    }

    .card strong {
      display: block;
      font-size: 1.6rem;
      margin-bottom: 4px;
    }

    .card span {
      color: var(--muted);
    }

    .status-banner {
      display: inline-block;
      padding: 8px 12px;
      border-radius: 999px;
      font-weight: 700;
      margin-top: 16px;
      background: ${reportData.success ? '#e8f7ef' : '#fdecea'};
      color: ${reportData.success ? 'var(--pass)' : 'var(--fail)'};
    }

    .suite {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 18px;
      margin-top: 18px;
      box-shadow: var(--shadow);
    }

    .suite-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .suite-title {
      margin: 0;
      font-size: 1rem;
      word-break: break-word;
    }

    .suite-meta {
      color: var(--muted);
      font-size: 0.92rem;
      white-space: nowrap;
    }

    .badge {
      display: inline-block;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .badge.passed {
      background: #e8f7ef;
      color: var(--pass);
    }

    .badge.failed {
      background: #fdecea;
      color: var(--fail);
    }

    .badge.pending {
      background: #fff5d6;
      color: var(--pending);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    th, td {
      text-align: left;
      padding: 10px 8px;
      border-top: 1px solid #efe6d8;
      vertical-align: top;
    }

    th {
      color: var(--muted);
      font-size: 0.9rem;
      font-weight: 600;
    }

    .test-status {
      font-weight: 700;
    }

    .test-status.passed {
      color: var(--pass);
    }

    .test-status.failed {
      color: var(--fail);
    }

    .test-status.pending, .test-status.todo {
      color: var(--pending);
    }

    pre {
      white-space: pre-wrap;
      word-break: break-word;
      background: #fff7f7;
      border: 1px solid #f4d6d6;
      border-radius: 12px;
      padding: 12px;
      color: #7a271a;
      overflow-x: auto;
    }

    .empty {
      color: var(--muted);
      font-style: italic;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="page">
    <section class="hero">
      <h1>${escapeHtml(title)}</h1>
      <p>Gerado em ${escapeHtml(generatedAt)}</p>
      <div class="summary">
        <div class="card">
          <strong>${reportData.numTotalTestSuites}</strong>
          <span>Suites</span>
        </div>
        <div class="card">
          <strong>${reportData.numTotalTests}</strong>
          <span>Testes totais</span>
        </div>
        <div class="card">
          <strong>${reportData.numPassedTests}</strong>
          <span>Passaram</span>
        </div>
        <div class="card">
          <strong>${reportData.numFailedTests}</strong>
          <span>Falharam</span>
        </div>
        <div class="card">
          <strong>${reportData.numPendingTests}</strong>
          <span>Pendentes</span>
        </div>
      </div>
      <div class="status-banner">
        ${reportData.success ? 'Execucao concluida com sucesso' : 'Execucao concluida com falhas'}
      </div>
    </section>
    ${suiteCards || '<p class="empty">Nenhum teste encontrado.</p>'}
  </div>
</body>
</html>`;
}

function renderSuite(suite) {
  const duration = formatDuration((suite.endTime || 0) - (suite.startTime || 0));
  const suiteStatus = suite.status || 'unknown';
  const assertions = (suite.assertionResults || []).map(renderAssertion).join('\n');

  return `<section class="suite">
    <div class="badge ${escapeHtml(suiteStatus)}">${escapeHtml(normalizeStatus(suiteStatus))}</div>
    <div class="suite-head">
      <h2 class="suite-title">${escapeHtml(suite.name || 'Suite sem nome')}</h2>
      <div class="suite-meta">${escapeHtml(duration)}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Teste</th>
          <th>Status</th>
          <th>Duracao</th>
        </tr>
      </thead>
      <tbody>
        ${assertions || '<tr><td colspan="3">Nenhuma assercao listada.</td></tr>'}
      </tbody>
    </table>
    ${renderFailureBlock(suite)}
  </section>`;
}

function renderAssertion(assertion) {
  return `<tr>
    <td>${escapeHtml(assertion.fullName || assertion.title || 'Teste sem nome')}</td>
    <td class="test-status ${escapeHtml(assertion.status || 'unknown')}">${escapeHtml(normalizeStatus(assertion.status || 'unknown'))}</td>
    <td>${escapeHtml(formatDuration(assertion.duration))}</td>
  </tr>`;
}

function renderFailureBlock(suite) {
  const messages = [];

  if (suite.message) {
    messages.push(suite.message);
  }

  for (const assertion of suite.assertionResults || []) {
    for (const failureMessage of assertion.failureMessages || []) {
      messages.push(failureMessage);
    }
  }

  if (messages.length === 0) {
    return '';
  }

  return `<pre>${escapeHtml(messages.join('\n\n'))}</pre>`;
}

function normalizeStatus(status) {
  const statuses = {
    passed: 'Passou',
    failed: 'Falhou',
    pending: 'Pendente',
    todo: 'Todo',
    skipped: 'Ignorado',
  };

  return statuses[status] || status;
}

function formatDuration(durationMs) {
  if (typeof durationMs !== 'number' || Number.isNaN(durationMs) || durationMs < 0) {
    return '-';
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(2)} s`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
