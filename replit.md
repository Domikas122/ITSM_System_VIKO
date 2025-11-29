# Incidentų valdymo sistema

## Apžvalga
Žiniatinklio pagrindu sukurta IT ir kibernetinių incidentų valdymo sistema, leidžianti darbuotojams registruoti incidentus, o specialistams – juos valdyti, peržiūrėti jų istoriją ir gauti dirbtinio intelekto rekomendacijas. Sukurta naudojant modernią pilno steko „JavaScript“ / „TypeScript“ architektūrą.

## Technologijų paketas
- **Priekinė dalis**: „React“ su „TypeScript“, „Tailwind CSS“, „Shadcn“ UI komponentais
- **Galinė dalis**: „Express.js“ su „TypeScript“
- **Būsenos valdymas**: „TanStack“ užklausa („React“ užklausa)
- **DI integracija**: „OpenAI GPT-5“ incidentų analizei
- **Maršruto parinkimas**: „Wouter“
- **Saugykla**: Atmintyje (MemStorage) – paruošta „PostgreSQL“ perkėlimui

## Projekto struktūra
```
├── klientas/ # Priekinė „React“ programa
│ ├── src/
│ │ ├── komponentai/ # Daugkartinio naudojimo UI komponentai
│ │ ├── puslapiai/ # Puslapio komponentai
│ │ ├── lib/ # Įrankiai ir kontekstai
│ │ └── kabliukai/ # Pasirinktiniai „React“ kabliukai
├── serveris/ # „Backend Express“ serveris
│ ├── route's.ts # API galiniai taškai
│ ├── storage.ts # Duomenų saugojimo sluoksnis
│ └── openai.ts # „OpenAI“ integracija
└── bendrinami/ # Bendrinami tipai ir schemos
└── schema.ts # Duomenų modeliai ir patvirtinimas
```

## Pagrindinės funkcijos
1. **Incidentų registracija** – forma su pavadinimu, aprašymu, kategorija (IT/kibernetinis), svarba, paveiktomis sistemomis
2. **Valdymo skydas** – statistikos kortelės, filtravimas, incidentų sąrašas specialistams
3. **Vaidmenimis pagrįsti rodiniai** – darbuotojo rodinys (savo incidentai) ir specialisto rodinys (visi incidentai)
4. **Būsenos darbo eiga** – naujas → priskirtas → vykdomas → išspręstas → uždarytas
5. **DI analizė** – „OpenAI“ pagrįsta incidentų analizė ir žymų pasiūlymai
6. **Panašūs incidentai** – Randa susijusius ankstesnius incidentus nuorodai
7. **Istorijos laiko juosta** – Seka visus būsenos pakeitimus ir atnaujinimus

## API galiniai taškai
- `GET /api/incidents` – Pateikia incidentų sąrašą su pasirinktiniais filtrais
- `GET /api/incidents/stats` – Prietaisų skydelio statistika
- `GET /api/incidents/:id` – Gauti incidentą su išsamia informacija
- `POST /api/incidents` – Sukurti naują incidentą
- `PATCH /api/incidents/:id/status` – Atnaujinti incidento būseną
- `PATCH /api/incidents/:id/assign` – Priskirti incidentą specialistui
- `POST /api/incidents/:id/analyze` – Vykdyti DI analizę

## Aplinkos kintamieji
- `OPENAI_API_KEY` – Būtinas DI analizei (neprivaloma – veikia su bandomąja analize, jei nenustatyta)

## Programos paleidimas
The Programa veikia per 5000 prievadą su „npm run dev“.

## Vartotojo nuostatos
- Švarus, profesionalus dizainas, atitinkantis „Linear“ / „ServiceNow“ šablonus
- Informacijos kupina, bet lengvai skenuojama sąsaja
- Tamsaus režimo palaikymas
- Adaptyvus išdėstymas su šonine navigacijos juosta

## Naujausi pakeitimai
- Pradinis MVP įdiegimas su visomis pagrindinėmis funkcijomis
- Pridėtas tamsaus režimo palaikymas su temos perjungimu
- Įdiegtas vaidmenų perjungiklis darbuotojų / specialistų rodinių testavimui
- Sukurtas dirbtinio intelekto analizės skydelis su „OpenAI“ integracija