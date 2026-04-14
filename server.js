const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const app      = express();

// ── Config ────────────────────────────────────────────────────
const PORT        = process.env.PORT || 3000;
const PATH_FARM   = path.join(__dirname, 'database', 'farm.json');
const PATH_CONFIG = path.join(__dirname, 'config.json');
const PANEL_HTML  = path.join(__dirname, 'painel-farm.html');

app.use(express.json());

// Serve o HTML do painel na raiz
app.get('/', (req, res) => {
  if (!fs.existsSync(PANEL_HTML)) {
    return res.status(404).send('painel-farm.html não encontrado.');
  }
  res.sendFile(PANEL_HTML);
});

// ── GET /api/farm (SEM AUTH) ───────────────────────────────────
app.get('/api/farm', (req, res) => {
  try {
    const farm   = fs.existsSync(PATH_FARM)
      ? JSON.parse(fs.readFileSync(PATH_FARM, 'utf8'))
      : {};

    const config = fs.existsSync(PATH_CONFIG)
      ? JSON.parse(fs.readFileSync(PATH_CONFIG, 'utf8'))
      : {};

    res.json({
      farm,
      meta: {
        dinheiroSujo: 100000,
        componentes:  5000,
      },
      timestamp: Date.now(),
    });

  } catch (e) {
    console.error('[API] Erro ao ler farm.json:', e.message);
    res.status(500).json({ erro: 'Erro ao ler dados.' });
  }
});

// ── POST /api/reset (SEM AUTH) ────────────────────────────────
app.post('/api/reset', (req, res) => {
  const { confirmar } = req.body;

  if (confirmar !== true) {
    return res.status(400).json({
      erro: 'Envie { "confirmar": true } para resetar.'
    });
  }

  try {
    fs.writeFileSync(PATH_FARM, JSON.stringify({}, null, 2), 'utf8');
    console.log('[API] Farm resetado.');
    res.json({ ok: true });

  } catch (e) {
    console.error('[API] Erro ao resetar farm:', e.message);
    res.status(500).json({ erro: 'Erro ao resetar farm.' });
  }
});

// ── Inicia servidor ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});