# Soucasny stav projektu Filky

Tento dokument slouzi jako navazovaci kontext pro dalsi sezeni s Codexem.

## Technologie

Projekt je staticka webova aplikace:

- Vite
- TypeScript
- HTML/CSS
- bez Reactu
- Vitest pro testy herni logiky

Herni logika je oddelena od UI v adresari `src/game`.

## Aktualne funkcni hra

Aplikace ma funkcni prototyp cele jedne hry:

1. Cervene
2. Filky
3. Kral
4. Stychy
5. Vykladani
6. rozdeleni banku
7. pokracovani do dalsi hry se zachovanim penez

Funguje:

- 1 lidsky hrac proti 3 botum
- mariasky balicek 32 karet
- barvy: `cervene`, `kule`, `zelene`, `zaludy`
- hodnoty: `7`, `8`, `9`, `10`, `spodek`, `svrsek`, `kral`, `eso`
- povinnost ctit vynesenou barvu ve stychovych kolech
- vyhodnoceni viteze stychu
- tresty do banku pro Cervene, Filky, Kral a Stychy
- Vykladani vcetne stani, poradi hracu a vyplaty banku `16 / 10 / 6 / 0`
- automaticke preskoceni hrace ve Vykladani, pokud nema platny tah
- pauza po kazdem dokonceni stychu, aby bylo videt, kdo co zahral
- tlacitko `Dalsi stych` nad rukou hrace
- pocty karet souperu pomoci tecek
- tlacitko `Dalsi hra` po Vykladani
- tlacitko `Nova hra` nahore

UI je stale pouze pracovni textovy prototyp. Neni to finalni grafika.

## Dulezite soubory

- `src/game/cards.ts`: definice karet, barev, hodnot, balicku, razeni
- `src/game/trick.ts`: obecna logika stychu
- `src/game/trickRound.ts`: Cervene, Filky, Kral, Stychy
- `src/game/layingRound.ts`: Vykladani
- `src/game/gameFlow.ts`: zacatek prvni hry a pokracovani do dalsi hry
- `src/main.ts`: aktualni jednoduche UI
- `src/styles.css`: aktualni jednoduche styly
- `docs/pravidla.md`: pravidla hry
- `docs/reference/puvodni-design.png`: pouze vizualni reference starsiho pokusu
- `card_back.png`: pracovni navrh rubu karty
- `cards_hearts.png`: pracovni navrh karet cervene barvy

## Pracovni obrazky karet

V koreni projektu jsou pridane dva obrazky:

```text
card_back.png
cards_hearts.png
```

Aktualni stav:

- `card_back.png`: cca `1.3 MB`, `1024x1024`
- `cards_hearts.png`: cca `1004 KB`, `1024x1024`
- oba soubory maji priponu `.png`, ale podle `file` jsou uvnitr JPEG/JFIF data

Pri finalizaci UI je vhodne:

- rozhodnout, zda z techto obrazku vychazet jako z hlavniho vizualniho stylu karet
- prejmenovat je na `.jpg`, nebo je prevest do `.webp`
- optimalizovat velikost pro web
- zvolit, zda pouzit sprite sheet, nebo jednotlive obrazky karet
- doplnit/odvodit i dalsi barvy: kule, zelene, zaludy

GitHub Pages podporuje staticke obrazky typu PNG/JPG/WebP. Tyto konkretni soubory jsou velikostne v poradku.

Aktualne overene limity GitHubu:

- soubor nad `50 MiB` vyvolava varovani
- soubor nad `100 MiB` je blokovan
- GitHub Pages publikovany web ma limit `1 GB`
- GitHub Pages ma soft bandwidth limit `100 GB / mesic`

Pozor: `cards_hearts.png` pouziva na figurach znacky `U`, `O`, `K`, `A`. Logika hry pouziva hodnoty `spodek`, `svrsek`, `kral`, `eso`. Pri tvorbe UI je potreba rozhodnout, jestli vizualni znacky ponechat, nebo je upravit na ceske/mariášove znaceni.

## Testy a overeni

V poslednim sezeni proslo:

```bash
tsc -p tsconfig.json
vitest run
vite build
```

Stav testu:

```text
17 testu proslo
```

## Spusteni bez problemu s opravnenimi

Standardni postup je:

```bash
npm install
npm run dev
```

Vite obvykle spusti server na:

```text
http://localhost:5173/
```

Pokud je port obsazeny, Vite pouzije dalsi volny port. V tomto sezeni byl server dostupny na:

```text
http://localhost:5174/
```

## Problem v tomto prostredi

Projekt je v adresari na pripojenem disku:

```text
/media/DATA/Codex_vesmir/Filky na www přes GitHub/filky
```

Pri `npm install` primo v projektu nastala chyba:

```text
EPERM: operation not permitted, chmod ... node_modules/esbuild/bin/esbuild
```

Kvuli tomu byly nastroje docasne nainstalovane mimo projekt:

```bash
npm install --prefix /tmp/filky-deps typescript@^5.8.3 vite@^6.3.5 vitest@^3.1.3
```

Pak se overovalo pres:

```bash
/tmp/filky-deps/node_modules/.bin/tsc -p tsconfig.json
/tmp/filky-deps/node_modules/.bin/vitest run
/tmp/filky-deps/node_modules/.bin/vite build
```

Dev server byl spusten prikazem:

```bash
/tmp/filky-deps/node_modules/.bin/vite --host 0.0.0.0
```

Vite napsal:

```text
Local:   http://localhost:5174/
Network: http://10.0.11.174:5174/
```

Pro dalsi sezeni jsou mozne dve cesty:

1. Zkusit znovu standardni `npm install`.
2. Pokud se vrati chyba `chmod` u `esbuild`, pouzit znovu docasny `/tmp/filky-deps`, nebo presunout projekt na bezny linuxovy disk.

## GitHub Pages

Projekt ma `vite.config.js`:

```js
export default {
  base: "./",
};
```

To je zamerne kvuli statickemu buildu pro GitHub Pages.

Produkce se vytvari:

```bash
npm run build
```

V tomto prostredi pri docasnych zavislostech:

```bash
/tmp/filky-deps/node_modules/.bin/vite build
```

## Zname omezeni

- UI je pracovni a textove.
- Karty zatim nejsou graficke.
- Boti hraji jednoduse, ne strategicky dokonale.
- Neni registrace ani ukladani mezi sezenimi.
- Neni jeste reseno ukonceni celeho sezeni pri penezich `0 Kc` nebo mene.
- Neni pripraven GitHub Actions workflow pro automaticky deploy na GitHub Pages.
- `package-lock.json` zatim nevznikl, protoze lokalni `npm install` narazil na problem s opravnenimi na pripojenem disku.

## Doporuceny dalsi postup

Nejblizsi vhodny krok je prebudovat UI na citelnejsi karetní stul:

- graficky citelnejsi karty
- zvazit pouziti pracovnich obrazku `card_back.png` a `cards_hearts.png`
- porad jasne videt aktualni stych a posledni stych
- rozmistit hrace kolem stolu
- ponechat rychle ovladani `Dalsi stych` blizko ruky hrace
- lepe zobrazit Vykladani po barvach
- zachovat textove informace pro testovani pravidel

Az potom dava smysl resit:

- lepsi strategii botu
- historii odehranych karet
- nasazeni na GitHub Pages
- registraci a ukladani penez mezi sezenimi

## Veta pro dalsi sezeni

Doporucena uvodni veta pro pristi konverzaci:

```text
Jsme v projektu Filky. Precti si README.md, docs/soucasny-stav.md a docs/pravidla.md, potom navaz na vyvoj. Aktualni cil je prebudovat pracovni textove UI na citelnejsi karetní stul, ale zachovat funkcni logiku a testy.
```
