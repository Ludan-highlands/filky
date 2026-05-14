# Filky - zadani pro mobilni verzi

Tento dokument je predavaci specifikace pro dalsiho vyvojare nebo AI agenta, ktery ma postavit mobilni verzi hry Filky. Cilem je, aby nebylo nutne se znovu ptat na zakladni pravidla, tok hry, terminologii ani aktualni technicke provedeni.

## Shrnutí projektu

Filky jsou webova verze mistni karetní hry pro 4 hrace. Aktualni aplikace je staticky web bez serveru, napsany jako Vite + TypeScript projekt bez Reactu.

Repozitar:

```text
https://github.com/Ludan-highlands/filky
```

Publikovana verze pres GitHub Pages:

```text
https://ludan-highlands.github.io/filky/
```

Aktualni stav:

- hra je hratelna jako desktopovy prototyp
- jeden lidsky hrac hraje proti trem botum
- herni logika je oddelena od UI
- UI je nyni navrzene jako desktopovy karetní stul
- mobilni rozhrani zatim neni cilene navrzene
- boti dodrzuji pravidla, ale nehrají strategicky dokonale

## Technologie a spusteni

Projekt je v adresari:

```text
filky
```

Pouzite technologie:

- Vite
- TypeScript
- HTML/CSS
- Vitest
- bez Reactu
- bez backendu

Spusteni:

```bash
npm install
npm run dev
```

Testy:

```bash
npm test
```

Produkci build:

```bash
npm run build
```

Publikovani:

- GitHub Pages se nasazuje pres GitHub Actions
- workflow je v `.github/workflows/deploy.yml`
- `vite.config.js` pouziva `base: "./"`, aby assety fungovaly i na GitHub Pages
- build vystup je slozka `dist`

## Dulezite soubory

Herni logika:

- `src/game/cards.ts` - karty, barvy, hodnoty, balicek, razeni
- `src/game/players.ts` - hraci, jmena, pocatecni penize, posun hracu
- `src/game/trick.ts` - obecna logika jednoho stychu
- `src/game/trickRound.ts` - kola Cervene, Filky, Kral, Stychy
- `src/game/layingRound.ts` - kolo Vykladani
- `src/game/gameFlow.ts` - start hry a pokracovani do dalsi hry

UI:

- `src/main.ts` - aktualni render cele hry
- `src/styles.css` - aktualni desktopovy vzhled karetního stolu

Testy:

- `src/game/cards.test.ts`
- `src/game/trick.test.ts`
- `src/game/trickRound.test.ts`
- `src/game/layingRound.test.ts`
- `src/game/gameFlow.test.ts`

Dokumentace:

- `README.md`
- `docs/pravidla.md`
- `docs/soucasny-stav.md`
- tento soubor: `docs/zadani-pro-mobilni-verzi.md`

Obrazky karet:

- `card_back.png` - rub karty
- `cards_hearts.png` - cervene
- `cards_bells.png` - kule
- `cards_leaves.png` - zelene
- `cards_acorns.png` - zaludy

Barevne archy jsou pouzite jako CSS sprite. Kazdy arch obsahuje osm karet v poradi:

```text
7, 8, 9, 10
spodek, svrsek, kral, eso
```

Prvni ctyri karty jsou v horni rade, dalsi ctyri ve spodni rade.

## Terminologie

V dokumentaci se rozlisuji pojmy:

- `kolo` - jedna cast hry, napr. Cervene nebo Vykladani
- `hra` - cela sada peti kol od Cervenych po Vykladani
- `sezeni` - opakovane hry, dokud se nepokračuje novou hrou nebo dokud nekdo nespadne na 0 Kc
- `stych` - jedna ctverice zahranych karet ve stychovych kolech
- `bank` - spolecne penize z trestnych kol, rozdelene ve Vykladani
- `spodek` - hodnota karty, na ktere se ve Vykladani zaklada rada
- `svrsek` - hodnota karty, mistne oznacovana jako Filka

Poznamka k obrazkum: na figurach jsou znaceni `U`, `O`, `K`, `A`. V logice hry se pouziva `spodek`, `svrsek`, `kral`, `eso`. Pokud nekdo rekne dama, v kontextu teto hry se tim pravdepodobne mysli karta `svrsek`, ale spravny nazev v logice je `svrsek`.

## Hraci

Hra je pro 4 hrace.

Aktualni webova verze:

- hrac 0: `Ty`, lidsky hrac
- hrac 1: `Bot Pepa`
- hrac 2: `Bot Franta`
- hrac 3: `Bot Karel`

Hraje se po smeru hodinovych rucicek.

V aktualnim desktop UI:

- lidsky hrac je dole
- Bot Pepa je vlevo
- Bot Franta je nahore
- Bot Karel je vpravo

Pro mobilni verzi neni nutne zachovat fyzicke rozmisteni kolem stolu. Dulezite je zachovat jasnou informaci:

- kdo je na tahu
- kdo rozdava
- kolik ma kdo penez
- kolik ma kdo karet
- kdo prave hral nebo stal
- kdo aktualne bere stych

## Balicek karet

Hraje se s 32 kartami.

Barvy:

```text
cervene
kule
zelene
zaludy
```

Hodnoty od nejnizsi po nejvyssi:

```text
7
8
9
10
spodek
svrsek
kral
eso
```

Sila karty se porovnava jen v ramci vynesene barvy. Neexistuji trumfy.

## Penize

Kazdy hrac zacina s hotovosti:

```text
50 Kc
```

V prvnich ctyrech kolech hraci plati tresty do banku. V pate casti, tedy ve Vykladani, se bank rozdeluje mezi prvni tri hrace.

Pravidlo pro konec sezeni:

- pokud nektery hrac klesne na 0 Kc nebo mene, cele sezeni ma skoncit
- tato cast jeste neni v aktualni implementaci plne dotazena

## Celkovy tok jedne hry

Jedna hra ma vzdy pet kol:

1. Cervene
2. Filky
3. Kral
4. Stychy
5. Vykladani

V kazdem kole se znovu zamicha a rozdaji vsechny karty.

Kazdy hrac dostane 8 karet.

Po dokonceni Vykladani se rozdeli bank a muze nasledovat dalsi hra.

## Rozdavani a zacatek tahu

Prvni rozdavajici v prvni hre se urci nahodne.

Prvni stych v kole zacina hrac po levici rozdavajiciho.

Dalsi stych zacina hrac, ktery vzal predchozi stych.

Rozdavajici se posouva po smeru hodinovych rucicek:

- v ramci jedne hry rozdava kazde dalsi kolo hrac po levici predchoziho rozdavajiciho
- v dalsi hre zacina Cervene rozdavat hrac po levici toho, kdo rozdaval Cervene v predchozi hre

Aktualni implementace:

- `createInitialGame()` zalozi prvni hru a nahodne zvoli rozdavajiciho
- `createNextTrickRound()` posouva kolo a rozdavajiciho
- `createFollowingGame()` zacina dalsi hru s prenesenymi penezi

## Obecna pravidla stychovych kol

Stychova kola jsou:

```text
Cervene
Filky
Kral
Stychy
```

V techto kolech plati:

- hrac, ktery vynasi, muze vynest libovolnou kartu z ruky
- ostatni hraci musi ctit vynesenou barvu, pokud ji maji
- pokud hrac vynesenou barvu nema, muze zahrat libovolnou kartu
- stych bere hrac, ktery zahral nejsilnejsi kartu ve vynesene barve
- dalsi stych vynasi hrac, ktery vzal predchozi stych
- kolo ma 8 stychu, protoze kazdy ma 8 karet

UI musi jasne zobrazit:

- aktualni kolo
- kdo je na tahu
- kdo vynesl
- karty zahrane v aktualnim stychu
- kdo aktualne stych bere
- po dokonceni stychu vsechny 4 zahrane karty
- tlacitko `Dalsi stych`, aby hrac mel cas si karty prohlednout

Aktualni desktop implementace:

- boti nehrají cely stych okamzite
- po tahu cloveka hraji boti postupne po kratke pauze
- diky tomu je videt, kdo jakou kartu pridal

## Kolo 1: Cervene

Cil:

- nesebrat zadne cervene karty

Bodovani:

- kazda sebrana cervena karta = 1 Kc do banku
- v balicku je 8 cervenych karet
- celkove se za kolo muze do banku dostat 8 Kc

Poznamka:

- cervena barva je `cervene`
- pokud je vynesena cervena, hraci ji musi ctit, pokud ji maji

## Kolo 2: Filky

Cil:

- nesebrat zadne svršky

Bodovani:

- kazdy sebrany `svrsek` = 2 Kc do banku
- v balicku jsou 4 svršky
- celkove se za kolo muze do banku dostat 8 Kc

Filka je mistni oznaceni pro kartu `svrsek`.

## Kolo 3: Kral

Cil:

- nesebrat cerveneho krale

Bodovani:

- sebrani cerveneho krale = 8 Kc do banku
- ostatni karty v tomto kole trest nemaji

Dulezite:

- kolo pokracuje do konce vsech 8 stychu i v pripade, ze cerveny kral uz byl sebran

## Kolo 4: Stychy

Cil:

- brat co nejmene stychu

Bodovani:

- kazdy sebrany stych = 1 Kc do banku
- kolo ma 8 stychu
- celkove se za kolo dostane do banku 8 Kc

## Bank pred Vykladanim

Pokud prvni ctyri kola probehnou standardne, v banku je:

```text
8 + 8 + 8 + 8 = 32 Kc
```

Tento bank se rozdeluje ve Vykladani.

## Kolo 5: Vykladani

Ve Vykladani se neberou stychy. Hráči se snazi co nejrychleji zbavit karet.

Pravidla:

- zacina se libovolnym Spodkem
- Spodek zaklada radu dane barvy
- na radu se priklada vzdy karta stejne barvy o jednu hodnotu nizsi nebo vyssi
- hrac muze ve svem tahu vylozit vzdy pouze jednu kartu
- hrac musi hrat, pokud ma alespon jednu platnou kartu
- pokud hrac nema zadnou platnou kartu, stoji
- hrac, ktery stal, muze v dalsim svem tahu opet hrat, pokud uz ma platny tah
- pokud hrac muze prilozit vice karet, nemusi hned vylozit dalsiho Spodka, pokud ma jinou platnou kartu
- jakmile se hrac zbavi vsech karet, zapise se do poradi
- jakmile jsou urcena prvni tri mista, posledni hrac je ctvrty automaticky

Vyplata z banku:

```text
1. misto = 16 Kc
2. misto = 10 Kc
3. misto = 6 Kc
4. misto = 0 Kc
```

Aktualni UI Vykladani:

- zobrazuji se 4 rady pod sebou
- v kazde rade jsou pevne sloty:

```text
7 8 9 10 | spodek | svrsek kral eso
```

- Spodek je uprostred rady
- hodnoty 7 az 10 jsou vlevo od Spodka
- hodnoty Svrsek, Kral, Eso jsou vpravo od Spodka
- nejsou zobrazene nazvy barev, barva je videt z grafiky karet
- prazdne sloty jsou jen jemne naznacene
- boti ve Vykladani nehrají okamzite vse najednou, ale postupne po jedne akci
- kdyz bot stoji nebo hraje, jeho panel kratce zlute problikne

Testovaci URL pro primy start Vykladani:

```text
http://localhost:5173/?round=vykladani
```

Na publikovanem webu:

```text
https://ludan-highlands.github.io/filky/?round=vykladani
```

## Aktualni bot logika

Boti dodrzuji pravidla, ale nejsou pokrocile strategicti.

Ve stychovych kolech:

- bot ziska legalni karty
- snazi se nehrat kartu s okamzitym trestem, pokud ma jinou moznost
- pokud nemusi brat, snazi se zahrat kartu, ktera aktualne nebere
- pokud ma bezpecne karty, voli podle jednoduche heuristiky

Ve Vykladani:

- bot najde legalni karty
- pokud ma legalni kartu, vylozi jednu
- pokud nema legalni kartu, stoji
- pokud muze, dava prednost nespodkove karte pred zakladanim nove rady Spodkem

Pro mobilni verzi se nema menit bot logika, pokud cil neni primo zlepsovat AI. Nejdriv zachovat pravidla a ovladatelnost.

## Soucasne desktop UI

Aktualni UI je desktopovy karetní stul.

Zasady, ktere vznikly pri navrhu:

- lidsky hrac ma ruku dole
- boti maji rubove karty a pocet karet
- akce botu jsou zpomalene, aby bylo videt, kdo co zahrál
- nehratelne karty v ruce jsou silne ztlumene
- hratelne karty zustavaji jasne
- tlacitka jsou vinova se zlatym okrajem, aby nesplyvala se stolem
- panel pokut neni samostatny; informace `Plati X Kc` je u hracu
- horní bot ma panel vlevo od svych karet, aby se setrila vyska stolu

## Pozadavky pro mobilni verzi

Mobilni verze by nemela byt pouze zmenseny desktopovy stul. Na telefonu je potreba preusporadat tok informaci.

Doporuceny cil:

- hra musi byt pohodlne hratelna na telefonu na vysku
- hlavni akce hrace musi byt dole u palce
- hracova ruka musi byt dobre posuvna vodorovne
- aktualni stav hry musi byt citelny bez zoomovani
- boti nemusi byt fyzicky rozmistení kolem stolu

Doporucena mobilni struktura obrazovky:

1. Horni kompaktni stavovy panel
   - nazev kola
   - bank
   - rozdavajici
   - kratka zprava, kdo je na tahu

2. Panel souperu
   - 3 male radky nebo karty hracu
   - jmeno
   - penize
   - pocet karet
   - aktualni pokuta nebo stav `Plati X Kc`
   - kratke probliknuti pri tahu nebo stani

3. Hlavni hraci plocha
   - ve stychovych kolech aktualni stych
   - ve Vykladani ctyri rady vykladani

4. Akcni oblast
   - tlacitko `Dalsi stych`, `Pokracovat na ...`, `Dalsi hra`
   - musi byt velke a snadno zasazitelne

5. Ruka hrace
   - dole
   - horizontalne scrollovatelna
   - hratelne karty jasne
   - nehratelne karty ztmavene nebo rozmazane

## Mobilni UI pro stychova kola

Na mobilu by aktualni stych mel byt hlavni vizualni centrum.

Doporuceni:

- zobrazit 4 pozice zahranych karet jako sloupec nebo kompaktní mrizku 2x2
- u kazde zahrane karty zobrazit jmeno hrace
- aktualne berouci kartu zvyraznit zlatym okrajem nebo svetlem
- pokud stych skoncil, zobrazit tlacitko `Dalsi stych`
- tlacitko neumistit prilis vysoko; idealne nad rukou hrace

Dulezite:

- po tahu cloveka nesmi boti doplnit cely stych okamzite
- kazdy bot ma pridat kartu po kratke pauze
- hrac musi videt, kdo co pridal

## Mobilni UI pro Vykladani

Vykladani je prostorove narocnejsi nez stych.

Doporuceni:

- zachovat 4 rady pod sebou
- kazda rada ma sloty:

```text
7 8 9 10 | spodek | svrsek kral eso
```

- na velmi uzkem displeji muze byt vykladaci plocha horizontalne posuvna
- alternativne lze zmensit karty ve vykladani, ale ruka hrace musi zustat dobre klikatelná
- neni nutne zobrazovat nazvy barev, pokud je barva karet dostatecne citelna
- akce botu musi byt postupna a vizualne patrna
- pokud hrac nema platny tah, je potreba jasne ukazat, ze stoji nebo ze hra pokracuje automaticky

## Interakce a rychlost hry

Aktualni desktop implementace pouziva zpozdeni tahu botu.

Toto zachovat i v mobilni verzi:

- po tahu hrace nechat kratkou pauzu
- bot zahraje nebo stoji
- hracuv panel nebo panel bota kratce problikne
- az potom pokracuje dalsi bot

Na mobilu je lepsi pomalejsi, ale citelna hra nez okamzite preskakovani.

## Testovaci URL a pomocne rezimy

Aktualni UI podporuje primy start Vykladani pres URL parametr:

```text
?round=vykladani
```

Pro mobilni vyvoj je vhodne pridat dalsi testovaci parametry, pokud budou potreba:

- primy start konkretniho kola
- pevny random seed pro opakovatelne rozlozeni karet
- testovaci ruce hracu pro konkretni situace

Zatim existuje pouze:

```text
http://localhost:5173/?round=vykladani
```

## Co nemenit bez duvodu

Pri stavbe mobilni verze nemenit pravidla hry, pokud to neni vyslovene cil.

Zachovat:

- 4 hrace
- 32 karet
- barvy `cervene`, `kule`, `zelene`, `zaludy`
- hodnoty `7`, `8`, `9`, `10`, `spodek`, `svrsek`, `kral`, `eso`
- poradi kol
- bodovani kol
- rozdeleni banku ve Vykladani
- povinnost ctit barvu ve stychovych kolech
- oddeleni herni logiky od UI
- testy herni logiky

Mobilni verze ma byt predevsim nove UI nad stejnou logikou.

## Co je vhodne zlepsit pozdeji

Mimo zakladni mobilni UI lze casem zlepsit:

- chytrost botu
- pamet odehranych karet
- ukonceni sezeni pri 0 Kc
- ulozeni stavu hry
- volbu jmen hracu
- zvuky a animace
- nastaveni rychlosti botu
- lepsi optimalizaci obrazku karet pro web

## Minimalni akceptacni kriteria mobilni verze

Mobilni verze je pouzitelna, pokud:

- lze odehrat vsech 5 kol od zacatku do konce
- jde pokracovat do dalsi hry
- hrac vzdy vidi, kdo je na tahu
- hrac vidi bank a svoje penize
- hrac vidi pocet karet botu
- hratelne a nehratelne karty jsou jasne odlisene
- po skonceni stychu jsou videt vsechny zahrane karty
- ve Vykladani jsou jasne videt rady a pozice karet
- boti nehrají neprehledne okamzite vse najednou
- `npm test` prochazi
- `npm run build` prochazi

## Doporuceny uvod pro dalsiho agenta

Pouzij tento text pri predani dalsimu agentovi:

```text
Jsme v projektu Filky. Precti si docs/zadani-pro-mobilni-verzi.md. Cilem je navrhnout a implementovat mobilni UI nad existujici logikou hry, bez zmen pravidel. Zachovej TypeScript/Vite projekt bez Reactu, pokud nebude dobry duvod menit stack. Pred zmenami si projdi src/game a aktualni src/main.ts + src/styles.css. Po kazde vetsi zmene spust npm test a npm run build.
```
