#!/usr/bin/env node
/**
 * send-cli.js — Agent d'envoi d'e-mail autonome (aucun serveur requis)
 *
 * Configuration : ~/.mail-agent.env  (chargé automatiquement)
 *
 * Usage :
 *   node send-cli.js --to <email> --subject <sujet> [--body <texte>] [--file <chemin>]
 *
 * Exemples :
 *   node send-cli.js --to moi@gmail.com --subject "Rapport" --file ./guide.md
 *   node send-cli.js --to moi@gmail.com --subject "Note rapide" --body "Tout fonctionne"
 *   node send-cli.js --subject "Backup" --file ./config.json   # utilise MAIL_DEFAULT_TO
 */

const path = require('path');
const fs   = require('fs');
const os   = require('os');
const nodemailer = require('nodemailer');

// ── 1. Charger la config depuis ~/.mail-agent.env ──────────────────────────
const ENV_FILE = path.join(os.homedir(), '.mail-agent.env');
if (!fs.existsSync(ENV_FILE)) {
  console.error(`❌ Fichier de configuration introuvable : ${ENV_FILE}`);
  console.error(`   Créez-le avec :\n\n   SMTP_HOST=smtp.gmail.com\n   SMTP_PORT=587\n   SMTP_SECURE=false\n   SMTP_USER=votre@gmail.com\n   SMTP_PASS=votre-app-password\n   MAIL_DEFAULT_TO=votre@gmail.com\n`);
  process.exit(1);
}
require('dotenv').config({ path: ENV_FILE });

// ── 2. Parser les arguments CLI ────────────────────────────────────────────
const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
};

const to       = get('--to')      || process.env.MAIL_DEFAULT_TO;
const subject  = get('--subject');
const body     = get('--body')    || '';
const filePath = get('--file');

// ── 3. Validations ─────────────────────────────────────────────────────────
if (!subject) {
  console.error('❌ --subject est obligatoire');
  console.error('   Usage : node send-cli.js --to email --subject "Sujet" [--body "Texte"] [--file chemin]');
  process.exit(1);
}
if (!to) {
  console.error('❌ --to est obligatoire (ou définir MAIL_DEFAULT_TO dans ~/.mail-agent.env)');
  process.exit(1);
}
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ SMTP_USER et SMTP_PASS doivent être définis dans ~/.mail-agent.env');
  process.exit(1);
}

// ── 4. Préparer la pièce jointe si demandée ────────────────────────────────
let attachments = [];
if (filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`❌ Fichier introuvable : ${resolved}`);
    process.exit(1);
  }
  const size = fs.statSync(resolved).size;
  if (size > 10 * 1024 * 1024) {
    console.error('❌ Fichier trop volumineux (max 10 MB)');
    process.exit(1);
  }
  attachments.push({ filename: path.basename(resolved), path: resolved });
  console.log(`📎 Pièce jointe : ${path.basename(resolved)} (${(size / 1024).toFixed(1)} KB)`);
}

// ── 5. Envoi ───────────────────────────────────────────────────────────────
const send = async () => {
  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  const now = new Date().toLocaleString('fr-FR', { timeZone: 'UTC' });
  const textContent = [
    body,
    attachments.length ? `\n📎 Fichier joint : ${attachments[0].filename}` : '',
    `\n---\nEnvoyé le ${now} (UTC) via Mail Agent`
  ].filter(Boolean).join('');

  const info = await transporter.sendMail({
    from:        `"Mail Agent" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text:        textContent,
    html:        textContent.replace(/\n/g, '<br>'),
    attachments
  });

  console.log(`✅ Email envoyé à ${to}`);
  console.log(`   Sujet    : ${subject}`);
  console.log(`   Message ID : ${info.messageId}`);
};

send().catch(err => {
  console.error(`❌ Erreur SMTP : ${err.message}`);
  process.exit(1);
});
