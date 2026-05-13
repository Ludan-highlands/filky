# Filky

Webova verze mistni karetni hry Filky.

## Cil projektu

Cilem je vytvorit jednoduchou online karetní hru a pri tom se naucit zakladni praci s Gitem, GitHubem a GitHub Pages.

Projekt bude zatim staticky web bez serveru:

- HTML
- CSS
- JavaScript

Pozdeji je mozne rozhodnout, jestli zustat u jednoduche varianty, nebo prejit na React/Vite podle narocnosti hry.

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

## Stav projektu

Zatim je pripraven cisty adresar projektu a zakladni dokumentace. Herni kod jeste neni vytvoren.

## Jak zacit v nove konverzaci

Pokud tento projekt otevira AI/Codex v nove konverzaci, nejdrive si ma precist:

- `README.md`
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

1. Nejdrive rozhodnout technologii projektu.
2. Pro jednoduchy zacatek lze pouzit HTML, CSS a JavaScript.
3. Pokud bude hra slozitejsi na stav a UI, je mozne pouzit React/Vite.
4. Pri implementaci vychazet primarne z pravidel v `docs/pravidla.md`.
5. `../Puvodni` pouzivat jen jako pomocnou referenci, ne jako zdroj pravdy.
