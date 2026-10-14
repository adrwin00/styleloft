# StyleLoft – prototyp sklepu do badania (HTML/CSS/JS)

Statyczna strona bez backendu i bez bazy danych. Dwa warianty tego samego sklepu mody:

- `a.html` – wersja A (system rekomendacji: plakietki „Empfohlen für dich” przy pierwszych trzech wynikach po wyszukaniu)
- `b.html` – wersja B (chatbot StyleBot, skrypt na słowach kluczowych, bez modelu AI)
- `index.html` – podgląd z przełącznikiem A/B (tylko do testów, nie dawaj tego linku uczestnikom)

Przykładowe adresy po wdrożeniu na GitHub Pages:

- `https://adrwin00.github.io/styleloft/a.html`
- `https://adrwin00.github.io/styleloft/b.html`

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
  if (e.origin !== "https://adrwin00.github.io") return;   // sprawdź nadawcę
  if (!e.data || e.data.channel !== "styleloft:search") return;
  console.log(e.data.search);    // ostatnia fraza
  console.log(e.data.searches);  // wszystkie frazy z tej sesji (tablica)
  // tutaj zapisz wartość do ukrytego pola ankiety
});
</script>
```

Osadzenie:

```html
<iframe src="https://adrwin00.github.io/styleloft/a.html" width="100%" height="900"></iframe>
```

## Co jest zapisywane

- Sklep nie wysyła nic na żaden serwer i nie ma analityki ani zapisu w przeglądarce.
- Koszyk i lista fraz istnieją tylko w pamięci otwartej karty i znikają po jej zamknięciu lub odświeżeniu.
- Dane z badania powstają wyłącznie po stronie ankiety (odbiór `postMessage`).
- Serwer hostingu (GitHub) może zapisywać standardowe logi odwiedzin.

## Zachowanie (jak w pierwotnym prototypie)

- Karta produktu (zdjęcie lub nazwa) otwiera okno ze szczegółami: materiał, skład, krój i dział. Działa w obu wersjach.
- Wersja A: po wpisaniu frazy lista filtruje się na żywo, a pierwsze trzy wyniki dostają plakietkę „Empfohlen für dich” i cenę 149 €. Wyszukiwanie tekstowe jest zawężone do wybranej zakładki kategorii. Wyszukiwanie „schwarz” lub „Mantel” pokazuje tylko czarne kurtki i płaszcze.
- W zakładce „Jacken & Mäntel” pierwsze trzy czarne modele zawsze stoją na początku listy w cenie 149 €.
- Wersja B: bez pola wyszukiwania. StyleBot wita się pytaniem „Wonach suchen Sie?”, potem pyta o okazję, krój, materiał i budżet. Uwzględnia całą dotychczasową rozmowę i pomija pytania, na które uczestnik już odpowiedział. Na końcu pokazuje cztery płaszcze (trzy po 149 € i jeden za 199 €), a kliknięcie otwiera okno ze szczegółami.
- Bot działa wyłącznie na regułach i nie korzysta z żadnego modelu AI ani zewnętrznego serwera.
- Kliknięcie logo STYLELOFT wraca na stronę główną (w wersji B pokazuje wtedy wyszukiwarkę, tak jak wcześniej).
