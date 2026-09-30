#!/usr/bin/env node
/**
 * matches.js — Matchs CdM → Image HTML → WhatsApp
 * Config : ~/.whatsapp-agent.env
 * Usage  :
 *   node matches.js                    → CdM du jour → image WhatsApp
 *   node matches.js --competition all  → tous les matchs
 *   node matches.js --dry-run          → génère l'image sans envoyer
 */

const https      = require('https');
const os         = require('os');
const path       = require('path');
const fs         = require('fs');
const puppeteer  = require('puppeteer');

// ── 1. Config ──────────────────────────────────────────────────────────────
const ENV_FILE = path.join(os.homedir(), '.whatsapp-agent.env');
if (!fs.existsSync(ENV_FILE)) { console.error(`❌ ${ENV_FILE} introuvable`); process.exit(1); }
require('dotenv').config({ path: ENV_FILE });

const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const TOKEN           = process.env.WA_TOKEN;
const DEFAULT_TO      = process.env.WHATSAPP_TO;
if (!PHONE_NUMBER_ID || !TOKEN || !DEFAULT_TO) { console.error('❌ Config manquante dans ~/.whatsapp-agent.env'); process.exit(1); }

// ── 2. CLI args ────────────────────────────────────────────────────────────
const args        = process.argv.slice(2);
const get         = f => { const i = args.indexOf(f); return i !== -1 && args[i+1] ? args[i+1] : null; };
const dryRun      = args.includes('--dry-run');
const to          = get('--to') || DEFAULT_TO;
const competition = get('--competition') || 'worldcup';

// ── 3. Fetch ESPN ──────────────────────────────────────────────────────────
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

const dateStr = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0,10).replace(/-/g,'');
};

const fetchMatchesForDate = async (dateCode) => {
  const url = `${ESPN_BASE}?dates=${dateCode}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    }
  });
  if (!res.ok) {
    throw new Error(`ESPN API status ${res.status}`);
  }
  const data = await res.json();
  const events = data.events || [];
  return events.map(e => {
    const comp  = e.competitions?.[0];
    const home  = comp?.competitors?.find(c => c.homeAway === 'home');
    const away  = comp?.competitors?.find(c => c.homeAway === 'away');
    const st    = comp?.status?.type;
    const live  = st?.name === 'STATUS_IN_PROGRESS';
    const done  = st?.completed;
    const hasScore = live || done;
    return {
      home:      home?.team?.displayName || '?',
      homeLogo:  home?.team?.logo || '',
      away:      away?.team?.displayName || '?',
      awayLogo:  away?.team?.logo || '',
      date:      e.date,
      scoreHome: hasScore ? (home?.score ?? '-') : null,
      scoreAway: hasScore ? (away?.score ?? '-') : null,
      live, done,
      statusTxt: st?.description || '',
      venue:     comp?.venue?.fullName || '',
    };
  });
};

const fetchAllDays = async () => {
  const [d0, d1, d2] = await Promise.all([
    fetchMatchesForDate(dateStr(0)),
    fetchMatchesForDate(dateStr(1)),
    fetchMatchesForDate(dateStr(2)),
  ]);
  return [
    { matches: d0, offset: 0 },
    { matches: d1, offset: 1 },
    { matches: d2, offset: 2 },
  ];
};

// ── 4. Drapeaux ────────────────────────────────────────────────────────────
const FLAG = {
  'argentina':'🇦🇷','france':'🇫🇷','brazil':'🇧🇷','germany':'🇩🇪','spain':'🇪🇸',
  'portugal':'🇵🇹','england':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','morocco':'🇲🇦','maroc':'🇲🇦','senegal':'🇸🇳',
  'nigeria':'🇳🇬','egypt':'🇪🇬','usa':'🇺🇸','united states':'🇺🇸','mexico':'🇲🇽',
  'canada':'🇨🇦','japan':'🇯🇵','south korea':'🇰🇷','australia':'🇦🇺','netherlands':'🇳🇱',
  'belgium':'🇧🇪','croatia':'🇭🇷','colombia':'🇨🇴','uruguay':'🇺🇾','switzerland':'🇨🇭',
  'poland':'🇵🇱','ghana':'🇬🇭','cape verde':'🇨🇻','cameroon':'🇨🇲','ivory coast':'🇨🇮',
  'saudi arabia':'🇸🇦','iran':'🇮🇷','denmark':'🇩🇰','serbia':'🇷🇸','turkey':'🇹🇷',
  'austria':'🇦🇹','ukraine':'🇺🇦','ecuador':'🇪🇨','chile':'🇨🇱','paraguay':'🇵🇾',
  'venezuela':'🇻🇪','bolivia':'🇧🇴','peru':'🇵🇪','indonesia':'🇮🇩','new zealand':'🇳🇿',
  'iraq':'🇮🇶','china':'🇨🇳','thailand':'🇹🇭',
};
const flag = n => FLAG[n.toLowerCase()] || '🏳️';

// ── 5. Générer le HTML ─────────────────────────────────────────────────────
const dayLabel = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  if (offset === 0) return `📅 Aujourd'hui — ${d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}`;
  if (offset === 1) return `📅 Demain — ${d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}`;
  return `📅 ${d.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}`;
};

const generateHTML = (days) => {
  const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const totalMatches = days.reduce((s, d) => s + d.matches.length, 0);

  const renderMatches = (matches) => matches.map(m => {
    const time = m.date
      ? new Date(m.date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit', timeZone:'Africa/Casablanca' })
      : '--:--';
    const statusBadge = m.live
      ? `<span class="badge live">🔴 EN DIRECT</span>`
      : m.done
      ? `<span class="badge done">✅ Terminé</span>`
      : `<span class="badge upcoming">🕐 ${time}</span>`;
    const scoreBlock = (m.scoreHome !== null)
      ? `<div class="score-block"><span class="score">${m.scoreHome}</span><span class="dash">—</span><span class="score">${m.scoreAway}</span></div>`
      : `<div class="vs-block">VS</div>`;
    const homeLogo = m.homeLogo ? `<img class="team-logo" src="${m.homeLogo}" onerror="this.style.display='none'">` : '';
    const awayLogo = m.awayLogo ? `<img class="team-logo" src="${m.awayLogo}" onerror="this.style.display='none'">` : '';
    return `
    <div class="card ${m.live ? 'card-live' : m.done ? 'card-done' : ''}">
      <div class="card-status">${statusBadge}</div>
      <div class="matchup">
        <div class="team home">${homeLogo}<span class="team-flag">${flag(m.home)}</span><span class="team-name">${m.home}</span></div>
        ${scoreBlock}
        <div class="team away"><span class="team-name">${m.away}</span><span class="team-flag">${flag(m.away)}</span>${awayLogo}</div>
      </div>
      ${m.venue ? `<div class="venue">📍 ${m.venue}</div>` : ''}
    </div>`;
  }).join('');

  const sections = days.map(({ matches, offset }) => `
    <div class="day-section">
      <div class="day-header">${dayLabel(offset)}</div>
      ${matches.length > 0
        ? `<div class="day-count">${matches.length} match${matches.length > 1 ? 's' : ''}</div>${renderMatches(matches)}`
        : `<div class="empty-day">😴 Aucun match ce jour</div>`
      }
    </div>
  `).join('');

  const emptyState = `<div class="empty"><div style="font-size:48px">😴</div><div>Aucun match sur 3 jours</div></div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: linear-gradient(135deg, #0a0e27 0%, #1a1f4e 50%, #0d1b35 100%);
    padding: 24px;
    width: 520px;
  }
  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  .header-trophy { font-size: 42px; margin-bottom: 6px; }
  .header-title {
    font-size: 22px;
    font-weight: 800;
    color: #FFD700;
    letter-spacing: 1px;
    text-shadow: 0 0 20px rgba(255,215,0,0.4);
  }
  .header-subtitle {
    font-size: 13px;
    color: #94a3b8;
    margin-top: 4px;
    text-transform: capitalize;
  }
  .header-date {
    display: inline-block;
    margin-top: 10px;
    background: rgba(255,215,0,0.12);
    border: 1px solid rgba(255,215,0,0.3);
    color: #FFD700;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 14px;
    border-radius: 20px;
    text-transform: capitalize;
  }
  .count {
    text-align: center;
    color: #64748b;
    font-size: 12px;
    margin-bottom: 16px;
  }
  .card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 12px;
    backdrop-filter: blur(10px);
    transition: all 0.2s;
  }
  .card-live {
    background: rgba(255,60,60,0.08);
    border-color: rgba(255,60,60,0.4);
    box-shadow: 0 0 20px rgba(255,60,60,0.15);
  }
  .card-done {
    background: rgba(34,197,94,0.06);
    border-color: rgba(34,197,94,0.2);
  }
  .card-status {
    text-align: center;
    margin-bottom: 12px;
  }
  .badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 12px;
    border-radius: 20px;
    letter-spacing: 0.5px;
  }
  .badge.live    { background: rgba(255,60,60,0.2); color: #ff6b6b; border: 1px solid rgba(255,60,60,0.4); }
  .badge.done    { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
  .badge.upcoming{ background: rgba(99,179,237,0.12); color: #90cdf4; border: 1px solid rgba(99,179,237,0.3); }
  .matchup {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .team {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    flex: 1;
  }
  .team-logo { width: 36px; height: 36px; object-fit: contain; }
  .team-flag { font-size: 26px; }
  .team-name {
    font-size: 13px;
    font-weight: 700;
    color: #e2e8f0;
    text-align: center;
    line-height: 1.2;
  }
  .score-block {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,215,0,0.08);
    border: 1px solid rgba(255,215,0,0.2);
    border-radius: 12px;
    padding: 8px 16px;
  }
  .score {
    font-size: 28px;
    font-weight: 900;
    color: #FFD700;
    min-width: 28px;
    text-align: center;
  }
  .dash { font-size: 20px; color: #475569; font-weight: 300; }
  .vs-block {
    font-size: 15px;
    font-weight: 800;
    color: #475569;
    letter-spacing: 2px;
    padding: 8px 12px;
  }
  .venue {
    text-align: center;
    font-size: 11px;
    color: #475569;
    margin-top: 10px;
  }
  .empty {
    text-align: center;
    color: #475569;
    padding: 40px;
    font-size: 16px;
    line-height: 2;
  }
  .day-section { margin-bottom: 8px; }
  .day-header {
    font-size: 13px;
    font-weight: 800;
    color: #FFD700;
    background: rgba(255,215,0,0.08);
    border: 1px solid rgba(255,215,0,0.2);
    border-radius: 10px;
    padding: 7px 14px;
    margin-bottom: 8px;
    text-transform: capitalize;
  }
  .day-count {
    text-align: center;
    color: #64748b;
    font-size: 11px;
    margin-bottom: 8px;
  }
  .empty-day {
    text-align: center;
    color: #334155;
    font-size: 13px;
    padding: 12px;
  }
  .footer {
    text-align: center;
    margin-top: 18px;
    font-size: 11px;
    color: #334155;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-trophy">🏆</div>
    <div class="header-title">FIFA COUPE DU MONDE 2026</div>
    <div class="header-subtitle">Programme — 3 prochains jours</div>
  </div>
  <div class="count">${totalMatches} match${totalMatches > 1 ? 's' : ''} au programme</div>
  ${totalMatches > 0 ? sections : emptyState}
  <div class="footer">📊 Source ESPN • Horaires en heure du Maroc (GMT+1)</div>
</body>
</html>`;
};

// ── 6. Screenshot via Puppeteer ────────────────────────────────────────────
const takeScreenshot = async (html) => {
  const outPath = path.join(os.tmpdir(), `matches_${Date.now()}.png`);
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page    = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.setViewport({ width: 520, height: 100, deviceScaleFactor: 2 });
  const body = await page.$('body');
  await body.screenshot({ path: outPath, type: 'png' });
  await browser.close();
  return outPath;
};

// ── 7. Envoyer image via WhatsApp Cloud API ────────────────────────────────
const uploadMedia = (imagePath) => new Promise((resolve, reject) => {
  const imageData   = fs.readFileSync(imagePath);
  const boundary    = '----FormBoundary' + Date.now();
  const filename    = path.basename(imagePath);

  const header = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="messaging_product"\r\n\r\nwhatsapp\r\n--${boundary}--\r\n`);
  const body   = Buffer.concat([header, imageData, footer]);

  const options = {
    hostname: 'graph.facebook.com',
    path:     `/v21.0/${PHONE_NUMBER_ID}/media`,
    method:   'POST',
    headers:  {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type':  `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
    }
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const parsed = JSON.parse(data);
      if (parsed.id) resolve(parsed.id);
      else reject(new Error(`Upload failed: ${data}`));
    });
  });
  req.on('error', reject);
  req.write(body);
  req.end();
});

const sendImageWhatsApp = (to, mediaId, caption) => new Promise((resolve, reject) => {
  const body = JSON.stringify({
    messaging_product: 'whatsapp',
    to: to.replace(/\s|\(|\)|-/g, ''),
    type: 'image',
    image: { id: mediaId, caption }
  });

  const options = {
    hostname: 'graph.facebook.com',
    path:     `/v21.0/${PHONE_NUMBER_ID}/messages`,
    method:   'POST',
    headers:  {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(body),
    }
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const parsed = JSON.parse(data);
      if (res.statusCode === 200) resolve(parsed);
      else reject(new Error(`API Error ${res.statusCode}: ${data}`));
    });
  });
  req.on('error', reject);
  req.write(body);
  req.end();
});

// ── 8. Main ────────────────────────────────────────────────────────────────
(async () => {
  console.log('📡 Récupération des matchs (3 jours)...');
  const days = await fetchAllDays();
  const total = days.reduce((s, d) => s + d.matches.length, 0);
  console.log(`✅ ${total} match(s) trouvé(s) sur 3 jours`);
  days.forEach(d => console.log(`   ${dayLabel(d.offset)} : ${d.matches.length} match(s)`));

  console.log('🎨 Génération du visuel HTML...');
  const html    = generateHTML(days);
  const imgPath = await takeScreenshot(html);
  console.log(`📸 Image générée : ${imgPath}`);

  if (dryRun) {
    console.log('🔍 Mode --dry-run : image sauvegardée, aucun envoi.');
    console.log(`   Ouvrez : ${imgPath}`);
    return;
  }

  const today = new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long' });
  const caption = `🏆 CdM 2026 — Programme 3 jours\n📊 ESPN • Horaires Maroc (GMT+1)`;

  console.log('📤 Upload de l\'image sur WhatsApp...');
  const mediaId = await uploadMedia(imgPath);
  console.log(`☁️  Media ID : ${mediaId}`);

  console.log(`📲 Envoi à ${to}...`);
  const result = await sendImageWhatsApp(to, mediaId, caption);
  console.log(`✅ Image envoyée ! ID : ${result.messages?.[0]?.id}`);

  fs.unlinkSync(imgPath); // nettoyage
})().catch(err => {
  console.error(`❌ Erreur : ${err.message}`);
  process.exit(1);
});
