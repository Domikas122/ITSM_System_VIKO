# Incidentų valdymo sistema – projektavimo gairės

## Projektavimo metodas
**Sisteminis metodas**: remiantis „Linear“ švaraus efektyvumo ir moderniomis įmonės ataskaitų suvestinėmis („ServiceNow“, „Jira Service Desk“ modeliais). Dėmesys aiškumui, efektyviems darbo eigoms ir lengvai nuskaitomam informacijos tankiui.

**Pagrindiniai principai**:
- Informacijos aiškumas, o ne dekoravimas
- Efektyvūs užduočių atlikimo srautai
- Aiški vizualinė būsenos ir prioritetų hierarchija
- Minimali kognityvinė apkrova specialistams, patiriantiems spaudimą

---

## Tipografija

**Šriftų rinkinys**: „Inter“ („Google Fonts“)
- Antraštės / Puslapių pavadinimai: 24–32 pikseliai, pusiau paryškinti (600)
- Skyrių antraštės: 18–20 pikselių, vidutiniai (500)
- Pagrindinis / Lentelės turinys: 14–16 pikselių, įprastas (400)
- Etiketės / Metaduomenys: 12–14 pikselių, vidutiniai (500)
- Būsenos ženkleliai: 12 pikselių, vidutiniai (500), didžiosios raidės

---

## Išdėstymo sistema

**Tarpų vienetai**: „Tailwind“ primityvai - 2, 4, 6, 8, 12, 16
- Komponentų užpildymas: nuo p-4 iki p-6
- Skyrių tarpai: nuo mb-8 iki mb-12
- Tarpai tarp kortelių: gap-4
- Formos lauko tarpai: space-y-4

**Tinklelio struktūra**:
- Prietaisų skydelis: Šoninė juosta (fiksuota 240 pikselių) + Pagrindinis turinio sritis
- Incidentų sąrašai: Viso pločio lentelės su fiksuotomis antraštėmis
- Išsamūs rodiniai: 2 stulpelių išdėstymas (pagrindinis turinys 60 % + metaduomenų šoninė juosta 40 %)

---

## Komponentų biblioteka

### Navigacija ir išdėstymas
- **Viršutinė juosta**: Fiksuota antraštė su sistemos pavadinimu, vaidmens indikatoriumi, vartotojo profiliu (h-16, border-b)
- **Šoninė juosta**: Fiksuota navigacija su piktogramomis + etiketėmis, aktyvios būsenos paryškinimu, vaidmenimis pagrįstais meniu elementais
- **Turinio konteineris**: max-w-7xl mx-auto, px-6 py-8

### Duomenų rodymas
- **Incidentų kortelės**: Kompaktiškos kortelės su pavadinimu, ID, būsenos ženkleliu, svarbos indikatoriumi, laiko žyma (suapvalintas-ilgas kraštas)
- **Duomenų lentelės**: Kintantys eilučių fonai, rūšiuojami stulpeliai, fiksuota antraštė, eilutės užvedimo būsenos
- **Būsena Ženkleliai**: Tabletės formos su skirtingais veiksmais pagal būseną (suapvalinta – pilnas px-3 py-1)

- Nauja: Subtilus fonas
- Priskirta: Vidutinio ryškumo
- Vykdoma: Paryškinta, didelio kontrasto
- Išspręsta/Uždaryta: Nutildytas veiksmas
- **Svarbumo indikatoriai**: Maži apskriti taškai arba vertikalios juostos (Kritinis/Aukštas/Vidutinis/Žemas)
- **Laiko juosta**: Vertikali linija su įvykių mazgais, rodanti incidentų istoriją

### Formos ir įvestis
- **Įvesties laukai**: Aiškios etiketės virš įvesčių, pastovus aukštis (h-10), kraštinė su fokusavimo būsenomis
- **Teksto sritys**: Incidentų aprašymams (min-h-32)
- **Išskleidžiamieji meniu**: Natyvaus stiliaus pasirinkimai arba pasirinktiniai išskleidžiamieji meniu kategorijai, svarbai, priskyrimui
- **Pateikimo mygtukai**: Pagrindiniai veiksmų mygtukai (px-6 py-2,5)

### Dirbtinio intelekto funkcijos
- **Panašių incidentų skydelis**: Kortelių pagrindu pateiktas sąrašas, kuriame rodomi dirbtinio intelekto suderinti incidentai su panašumo balu
- **DI Rekomendacijos**: Paryškintas langelis su siūlomomis žymėmis / kategorijomis (border-l-4 akcentas, bg-subtle, p-4)

### Perdangos
- **Įvykio detalės modalinis langas**: Didelis modalinis langas (max-w-4xl) su antrašte, slenkančiu turiniu, veiksmų porašte
- **Patvirtinimo dialogo langai**: Maži centruoti modaliniai langai (max-w-sm) trynimo / uždarymo veiksmams

---

## Konkretūs ekrano išdėstymai

### Prietaisų skydelis (specialisto rodinys)
- Statistikos eilutė: 4 stulpelių tinklelis, kuriame rodomas incidentų skaičius pagal būseną (grid-cols-4 space-4)
- Filtro juosta: Horizontalūs filtrai būsenai, kategorijai, svarbai, datų diapazonui
- Incidentų lentelė: Visas plotis su stulpeliais: ID, Pavadinimas, Kategorija, Svarba, Būsena, Priskirta, Sukūrimo data, Veiksmai

### Incidento registracijos forma (darbuotojo rodinys)
- Vieno stulpelio centruota forma (max-w-2xl)
- Laukai: Pavadinimas, Aprašymas (teksto sritis), Kategorija (išskleidžiamasis meniu), Svoris (radijo mygtukai), Paveiktos sistemos (keli pasirinkimai)
- Pateikimo mygtukas yra gerai matomoje vietoje

### Incidento išsamios informacijos rodinys
- Kairysis turinys (60 %): pavadinimas, aprašymas, dirbtinio intelekto analizė, laiko juostos istorija
- Dešinė šoninė juosta (40 %): būsena, svarba, metaduomenys (sukurta, atnaujinta, priskirtas specialistas), panašių incidentų skydelis

---

## Vaizdai
Nereikia jokių pagrindinių vaizdų. Tai yra paslaugų valdymo skydas – dėmesys funkciniam aiškumui. Naudokite piktogramas visame įrenginyje (Heroicons per CDN):
- Būsenos indikatoriams
- Svarbos lygiams
- Naršymo meniu elementams
- Veiksmų mygtukams (redaguoti, ištrinti, priskirti)
- Tuščioms būsenoms, kai „nėra incidentų“

---

## Animacijos
**Tik minimaliai naudojama**:
- Sklandūs perėjimai keičiant būsenos ženklelį (150 ms)
- Subtilūs užvedimo būsenos eilutėse / kortelėse
- Modalinis išryškinimas (200 ms)
- Nėra įkėlimo suktukų, nebent duomenų gavimas trunka ilgiau nei 1 sekundę

---

## Pagrindinės dizaino detalės
- **Tankis**: Informacijos gausa, bet ne per daug – balansas tarp duomenų rodymo ir skaitomumo
- **Nuskaitomumas**: Aiškus vizualinis incidentų eilučių atskyrimas, stiprūs būsenos indikatoriai
- **Nuoseklumas**: Pasikartojantys kortelių, lentelių, formų modeliai visuose rodiniuose
- **Pritaikymas neįgaliesiems**: Didelis būsenos indikatorių kontrastas, klaviatūros naršymo palaikymas, aiškios fokusavimo būsenos