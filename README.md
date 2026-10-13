# StyleLoft – prototyp sklepu do badania (HTML/CSS/JS)

Statyczna strona bez backendu i bez bazy danych. Dwa warianty tego samego sklepu mody:

- `a.html` – wersja A (system rekomendacji: plakietki „Empfohlen für dich” przy pierwszych trzech wynikach po wyszukaniu)
- `b.html` – wersja B (chatbot StyleBot, skrypt na słowach kluczowych, bez modelu AI)
- `index.html` – podgląd z przełącznikiem A/B (tylko do testów, nie dawaj tego linku uczestnikom)

Przykładowe adresy po wdrożeniu na GitHub Pages:

- `https://TWOJA-NAZWA.github.io/styleloft/a.html`
- `https://TWOJA-NAZWA.github.io/styleloft/b.html`

## Struktura plików (wersja bez folderów)

Wszystkie pliki leżą obok siebie, bez podfolderów. Dzięki temu wgranie na GitHub nie wymaga zachowania struktury.

| Plik | Do czego służy |
| --- | --- |
| `a.html`, `b.html`, `index.html` | punkty wejścia (każdy ustawia wariant badania) |
| `style.css` | cały wygląd |
| `catalog.js` | lista 82 produktów i kategorie |
| `app.js` | cała logika: strona główna, katalog, wyszukiwanie, StyleBot, koszyk, wysyłanie fraz do ankiety |
| `img-*.jpg` | zdjęcia produktów (każde zawiera 8 ujęć przycinanych w CSS) i zdjęcie tła |
| `favicon.svg`, `favicon.ico` | ikonka w karcie przeglądarki |

## Wdrożenie na GitHub Pages

1. Załóż repozytorium (publiczne – na darmowym koncie Pages nie działa z prywatnego).
2. Wgraj wszystkie pliki z tego folderu (pliki mają leżeć w głównym katalogu repozytorium).
3. Settings → Pages → Source: „Deploy from a branch”, branch `main`, folder `/ (root)` → Save.
4. Po minucie–dwóch strona działa pod adresem widocznym w Settings → Pages.

Test lokalny bez internetu: wystarczy dwukrotnie kliknąć `a.html` lub `b.html`.

## Połączenie z ankietą (iframe)

Sklep wysyła każdą wpisaną frazę (wyszukiwarka i czat) do strony nadrzędnej przez `postMessage`.
Strona z ankietą musi na to nasłuchiwać, np.:

```html
<script>
window.addEventListener("message", function (e) {
  if (e.origin !== "https://TWOJA-NAZWA.github.io") return;   // sprawdź nadawcę
  if (!e.data || e.data.channel !== "styleloft:search") return;
  console.log(e.data.search);    // ostatnia fraza
  console.log(e.data.searches);  // wszystkie frazy z tej sesji (tablica)
  // tutaj zapisz wartość do ukrytego pola ankiety
});
</script>
```

Osadzenie:

```html
<iframe src="https://TWOJA-NAZWA.github.io/styleloft/a.html" width="100%" height="900"></iframe>
```

## Co jest zapisywane

- Sklep nie wysyła nic na żaden serwer i nie ma analityki ani zapisu w przeglądarce.
- Koszyk i lista fraz istnieją tylko w pamięci otwartej karty i znikają po jej zamknięciu lub odświeżeniu.
- Dane z badania powstają wyłącznie po stronie ankiety (odbiór `postMessage`).
- Serwer hostingu (GitHub) może zapisywać standardowe logi odwiedzin.

## Zachowanie (jak w pierwotnym prototypie)

- Wersja A: po wpisaniu frazy lista filtruje się na żywo, a pierwsze trzy wyniki dostają plakietkę „Empfohlen für dich”. Wyszukiwanie „schwarz” lub „Mantel” pokazuje tylko czarne kurtki i płaszcze.
- Wersja B: StyleBot wita się pytaniem „Wonach suchen Sie heute?”, potem pyta o okazję, długość, krój, materiał, detale i budżet. Pomija pytania, na które uczestnik już odpowiedział, a na końcu pokazuje cztery płaszcze.
- Kliknięcie logo STYLELOFT wraca na stronę główną (w wersji B pokazuje wtedy wyszukiwarkę, tak jak wcześniej).
