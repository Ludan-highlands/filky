# Filky

Webova verze mistni karetni hry Filky.

## Cil projektu

Cilem je vytvorit jednoduchou online karetní hru a pri tom se naucit zakladni praci s Gitem, GitHubem a GitHub Pages.

Projekt je staticky web bez serveru, postaveny jako Vite aplikace:

- HTML
- CSS
- TypeScript

React se zatim nepouziva. Herni logika je oddelena od UI, aby sla dobre testovat a pozdeji pripadne napojit na slozitejsi rozhrani.

## Zakladni princip hry

Hra se hraje ve 4 hracich s balickem 32 karet:

- 7, 8, 9, 10
- Spodek
- Svrsek
- Kral
- Eso

Hra probiha v cyklech po 5 kolech:

1. Cervene
2. Filky
3. Kral
4. Stychy
5. Vykladani

Prvni ctyri kola jsou trestna a penize se plati do banku. V patem kole se bank rozdeluje podle poradi hracu ve vykladani.

Podrobna pravidla jsou v souboru [docs/pravidla.md](docs/pravidla.md).

## Vizuální reference

Ve slozce `docs/reference` je ulozen screenshot starsiho pokusu o design hry:

```text
docs/reference/puvodni-design.png
```

Tento obrazek slouzi pouze jako vizualni reference rozlozeni herniho stolu.

Ma pomoct pochopit:

- ze hra ma pusobit jako karetní stul
- kde je lidsky hrac
- kde jsou tri boti
- kde se zobrazuje bank, aktualni kolo a penize
- jak muze vypadat ruka hrace a karty botu

Screenshot neni zavazny finalni design. Pri tvorbe nove verze je mozne UI zjednodusit, zprehlednit nebo navrhnout lepe.

V koreni projektu jsou take pracovni obrazkove navrhy karet:

```text
card_back.png
cards_hearts.png
```

Tyto soubory je vhodne pri pristi praci zkontrolovat a pripadne pouzit jako zaklad grafiky karet. Podrobnosti a upozorneni jsou v [docs/soucasny-stav.md](docs/soucasny-stav.md).

## Stav projektu

Je vytvoren prvni funkcni zaklad hry:

- Vite + TypeScript
- textove UI pro ctyri stychova trestna kola
- 1 lidsky hrac proti 3 botum
- rozdani 32 mariaskych karet
- povinnost ctit vynesenou barvu
- vyhodnoceni viteze stychu
- pocitani trestu do banku pro Cervene, Filky, Kral a Stychy
- postup mezi stychovymi koly vcetne posunu rozdavajiciho
- zaklad kola Vykladani vcetne stani, poradi hracu a rozdeleni banku
- pokracovani do dalsi hry se zachovanim penez a posunem prvniho rozdavajiciho
- pauza po dokonceni stychu, aby hrac videl vsechny zahrane karty
- vizualni pocet karet souperu pomoci tecek
- automaticke testy zakladni herni logiky

Podrobny stav, spousteni, struktura kodu a doporucene dalsi kroky jsou v souboru [docs/soucasny-stav.md](docs/soucasny-stav.md).

## Spusteni projektu

Po instalaci zavislosti:

```bash
npm install
npm run dev
```

Testy:

```bash
npm test
```

Produkci build pro GitHub Pages:

```bash
npm run build
```

Poznamka k mistnimu prostredi: pri instalaci na nekterych pripojenych discich muze `npm install` narazit na omezeni opravneni u spustitelnych souboru. V takovem pripade je mozne projekt presunout na bezny linuxovy disk, nebo nastroje docasne instalovat mimo projekt.

V aktualnim sezeni byl kvuli omezeni disku pouzit docasny adresar `/tmp/filky-deps`. Podrobnosti jsou v [docs/soucasny-stav.md](docs/soucasny-stav.md).

## Jak zacit v nove konverzaci

Pokud tento projekt otevira AI/Codex v nove konverzaci, nejdrive si ma precist:

- `README.md`
- `docs/soucasny-stav.md`
- `docs/pravidla.md`
- zohlednit vizualni referenci `docs/reference/puvodni-design.png`, pokud se bude resit UI

Projekt ma zustat cisty a ma se budovat postupne v adresari `filky`.

V nadrazene slozce existuje starsi pokus o hru v adresari:

```text
../Puvodni
```

Tento starsi pokus se nema automaticky kopirovat jako zaklad noveho projektu. Ma slouzit pouze jako reference.

Duvody:

- obsahuje uzitecnou cast herni logiky
- ale zaroven obsahuje duplicitni strukturu souboru
- README je obecny export z AI Studia
- obsahuje `.env.local`
- projektove zavislosti a struktura potrebuji pred pouzitim zkontrolovat

Z adresare `../Puvodni` muze mit smysl opatrne prevzit nebo prepsat:

- definice karet, barev a hodnot
- vytvoreni balicku 32 karet
- michani balicku
- rozdani karet
- kontrolu platneho tahu v trestnych kolech
- vyhodnoceni viteze stychu
- vypocet trestnych bodu
- cast logiky pro Vykladani

Naopak se nema bez kontroly prebirat cele UI ani cela struktura aplikace.

Doporuceny postup:

1. Pri implementaci vychazet primarne z pravidel v `docs/pravidla.md`.
2. `../Puvodni` pouzivat jen jako pomocnou referenci, ne jako zdroj pravdy.
3. Nejdrive rozsirovat a testovat herni logiku.
4. UI vylepsovat postupne az nad overenymi pravidly.
