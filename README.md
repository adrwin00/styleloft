# StyleLoft – Prototyp eines Online-Shops für die Studie (HTML/CSS/JS)

Statische Webseite ohne Backend und ohne Datenbank. Zwei Varianten desselben Mode-Shops:

- `a.html` – Version A (Empfehlungssystem: Kennzeichnung „Empfohlen für dich“ bei den ersten drei Treffern nach einer Suche)
- `b.html` – Version B (Chatbot StyleBot, Skript auf Basis von Stichwörtern, ohne KI-Modell)
- `index.html` – Vorschau mit Umschalter A/B (nur zum Testen, diesen Link nicht an Teilnehmer:innen weitergeben)

Adressen auf GitHub Pages:

- `https://adrwin00.github.io/styleloft/a.html`
- `https://adrwin00.github.io/styleloft/b.html`

## Dateistruktur (Version ohne Ordner)

Alle Dateien liegen nebeneinander, ohne Unterordner. Dadurch muss beim Hochladen auf GitHub keine Ordnerstruktur erhalten bleiben.

| Datei | Zweck |
| --- | --- |
| `a.html`, `b.html`, `index.html` | Einstiegspunkte (jede legt die Studienbedingung fest) |
| `style.css` | gesamtes Erscheinungsbild |
| `catalog.js` | Liste der 82 Produkte und die Kategorien |
| `app.js` | gesamte Logik: Startseite, Katalog, Suche, StyleBot, Warenkorb, Weitergabe der Suchbegriffe an die Umfrage |
| `img-*.jpg` | Produktbilder (jedes Bild enthält 8 Ausschnitte, die per CSS zugeschnitten werden) und Hintergrundbild |
| `favicon.svg`, `favicon.ico` | Symbol im Browser-Tab |

## Veröffentlichung auf GitHub Pages

1. Ein Repository anlegen (öffentlich – mit dem kostenlosen Konto funktioniert Pages nicht aus einem privaten Repository).
2. Alle Dateien aus diesem Ordner hochladen (die Dateien müssen im Hauptverzeichnis des Repositorys liegen).
3. Settings → Pages → Source: „Deploy from a branch“, Branch `main`, Ordner `/ (root)` → Save.
4. Nach ein bis zwei Minuten ist die Seite unter der in Settings → Pages angezeigten Adresse erreichbar.

Lokaler Test ohne Internet: `a.html` oder `b.html` einfach per Doppelklick öffnen.

## Anbindung an die Umfrage (iframe)

Der Shop sendet jeden eingegebenen Suchbegriff (Suchfeld und Chat) per `postMessage` an die übergeordnete Seite.
Die Umfrageseite muss darauf lauschen, z. B.:

```html
<script>
window.addEventListener("message", function (e) {
  if (e.origin !== "https://adrwin00.github.io") return;   // Absender prüfen
  if (!e.data || e.data.channel !== "styleloft:search") return;
  console.log(e.data.search);    // letzter Suchbegriff
  console.log(e.data.searches);  // alle Suchbegriffe dieser Sitzung (Array)
  // hier den Wert in einem versteckten Feld der Umfrage speichern
});
</script>
```

Einbettung:

```html
<iframe src="https://adrwin00.github.io/styleloft/a.html" width="100%" height="900"></iframe>
```

## Was gespeichert wird

- Der Shop sendet nichts an einen Server und enthält keine Analyse- oder Tracking-Dienste und keine Speicherung im Browser.
- Warenkorb und Liste der Suchbegriffe existieren nur im Arbeitsspeicher des geöffneten Tabs und verschwinden beim Schließen oder Neuladen.
- Die Studiendaten entstehen ausschließlich auf Seiten der Umfrage (Empfang der `postMessage`).
- Der Hosting-Anbieter
