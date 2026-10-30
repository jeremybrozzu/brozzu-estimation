/**
 * BROZZU – réception des demandes du simulateur d'estimation.
 * À coller dans Extensions > Apps Script d'une feuille Google Sheets,
 * puis à déployer en « Application Web » (exécuter en tant que : moi ; accès : tout le monde).
 * Chaque demande est envoyée par e-mail à DEST et ajoutée comme ligne dans l'onglet « Demandes ».
 */
const DEST = "jeremy@brozzu.fr";
const ONGLET = "Demandes";
const COLONNES = ["Date", "Objet", "Client", "Téléphone", "E-mail", "Projet", "Estimation", "Bien", "Adresse",
  "Parcelle cadastrale", "Rappel souhaité", "Action", "Voir sur la carte", "Détail"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data._source !== "brozzu-estimation") return reponse({ success: "false", message: "source inconnue" });
    const objet = String(data._subject || "Nouvelle demande d'estimation").slice(0, 200);
    const champs = Object.keys(data).filter(function (k) { return k.charAt(0) !== "_"; });

    const texte = champs.map(function (k) { return k + " : " + data[k]; }).join("\n");
    const html = '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' +
      champs.map(function (k) {
        const v = String(data[k]);
        const val = /^https?:\/\//.test(v) ? '<a href="' + echap(v) + '">Ouvrir</a>' : echap(v);
        return '<tr><th style="text-align:left;padding:6px 12px;border-bottom:1px solid #E2D3C2;color:#7B4225">' + echap(k) +
          '</th><td style="padding:6px 12px;border-bottom:1px solid #E2D3C2">' + val + '</td></tr>';
      }).join("") + "</table>";
    const options = { htmlBody: html, name: "Simulateur BROZZU" };
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data._replyto || "")) options.replyTo = data._replyto;
    MailApp.sendEmail(DEST, objet, texte, options);

    journal(data, objet, champs);
    return reponse({ success: "true" });
  } catch (err) {
    return reponse({ success: "false", message: String(err) });
  }
}

function doGet() {
  return reponse({ ok: true, message: "Le point de réception BROZZU fonctionne." });
}

function journal(data, objet, champs) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;
  let feuille = ss.getSheetByName(ONGLET);
  if (!feuille) {
    feuille = ss.insertSheet(ONGLET);
    feuille.appendRow(COLONNES);
    feuille.setFrozenRows(1);
  }
  const autres = champs.filter(function (k) { return COLONNES.indexOf(k) < 0; })
    .map(function (k) { return k + " : " + data[k]; }).join("\n");
  feuille.appendRow(COLONNES.map(function (c) {
    if (c === "Date") return new Date();
    if (c === "Objet") return objet;
    if (c === "Détail") return autres;
    return data[c] || "";
  }));
}

function reponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function echap(s) {
  return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
}
