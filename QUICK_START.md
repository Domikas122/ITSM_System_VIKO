# Greito paleidimo vadovas — IncidentPilot

## Būtinos sąlygos
- Įdiegta „Node.js“ (v20+) ir „npm“
- macOS
- „Microsoft Edge“ naršyklė

## Sąranka

### 1. Įdiegti priklausomybes
```bash
cd /Users/domikas122/Downloads/IncidentPilot
npm install
```

### 2. Paleisti su VS Code (rekomenduojama)
- Atidaryti projektą VS Code
- Eiti į **Vykdyti ir derinti** (kairėje šoninėje juostoje)
- Pasirinkite **„Paleisti serverį + paleisti Edge“**
- Spustelėkite žalią mygtuką **Paleisti**
- Tai:
- Sukurs klientą
- Paleis kūrėjų serverį `http://localhost:8080`
- Automatiškai atidarys „Microsoft Edge“

### 3. Rankinis paleidimas (terminalas)
```bash
npm run dev
```
Tada naršyklėje atidarykite `http://localhost:8080`.

## Galimi npm scenarijai
- `npm run dev` — Paleisti kūrimo serverį
- `npm run build:client` — Sukurti klientą (Vite)
- `npm run build` — Pilnas kūrimas
- `npm run start` — Paleisti gamybos serverį
- `npm check` — Tipo patikrinimas

## Derinimo konfigūracijos
- **"Paleisti serverį + paleisti Edge"** — Serverio + kliento kūrimas + Edge paleidimas (rekomenduojama)
- **"Paleisti Edge (macOS)"** — Atviras Edge, nukreiptas į `localhost:8080`
- **"Paleisti Edge (Vite 5173)"** — Alt: Jei Vite veikia atskirai per 5173 prievadą
- **"Paleisti serverį (npm dev)"** — Paleisti tik serverį
- **"Sukurti klientą (npm build)"** — Sukurti tik klientą

## Trikčių šalinimas

### Prievadas jau naudojamas
Jei 8080 prievadas naudojamas:
```bash
# Rasti procesą, naudojantį 8080 prievadą
lsof -i :8080
# Nutraukti
kill -9 <PID>
```

### Priklausomybės neįdiegtos
```bash
npm install
```

### Edge neatsidaro
Įsitikinkite, kad Edge įdiegtas, ir pabandykite:
```bash
open -a "Microsoft Edge" http://localhost:8080
```

## Projekto struktūra
- `/client` — React frontend (Vite)
- `/server` — Express backend (Node.js)
- `/shared` — Bendrinami tipai/schema
- `.vscode/` — VS Code konfigūracija (paleidimas/užduotys)

## Pastabos
- Serveris klausosi `localhost:8080` (ne 0.0.0.0 dėl suderinamumo)
- Edge profilis saugomas `.vscode/edge-profile/` (ignoruojamas git)
- Išvalyti git istoriją — `.vscode/edge-profile/` pašalintas iš pakeitimų