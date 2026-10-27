# By 
Name: M Huzaifa Qureshi  
Roll ID: 231975  
Section: BSSE-7A  

Collaborator added on: Friday (23 October, 2026)  
**Live demo (static page only):** https://HuzaifaQureshi143.github.io/t20-predictor/

# T20 Performance Predictor

A small full stack machine learning project built for a DevOps lab. XGBoost models predict a T20 cricket player's **runs scored** (batting) or **runs conceded** (bowling). Flask serves the models, Angular provides the web page, and GitHub Actions handles CI and CD.

The live page is a static Angular build on GitHub Pages. The Flask backend is not hosted, so predictions work only when you run the project locally.

## Tech stack

| Layer | Tools |
| --- | --- |
| Models | Python, pandas, XGBoost (trained in `notebooks/Lab02_Devops_Final_Version.ipynb`) |
| Backend | Flask |
| Frontend | Angular, TypeScript, CSS design tokens |
| Tooling | pnpm, pytest |
| CI and CD | GitHub Actions, GitHub Pages |

## Project structure

```text
t20-predictor/
├── .github/workflows/
│   ├── ci.yml              # backend tests and Angular build
│   └── deploy.yml          # publishes the Angular build to GitHub Pages
├── backend/
│   ├── app.py              # Flask API
│   ├── requirements.txt
│   ├── models/             # batting_model.json, bowling_model.json
│   └── tests/test_api.py
├── frontend/               # Angular app
├── notebooks/              # model training notebook
├── .gitignore
└── README.md
```

## Requirements

* Python 3.14
* Node.js 24 and pnpm 11
* Git
* Windows PowerShell (commands below use PowerShell syntax)

## Run locally

Use two terminals, both opened in the project root.

### Terminal 1: backend

```powershell
git clone https://github.com/YOUR_USERNAME/t20-predictor.git
cd t20-predictor
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
python backend\app.py
```

Flask runs at http://127.0.0.1:5000. Open http://127.0.0.1:5000/health to confirm it is up. Leave this terminal running.

### Terminal 2: frontend

```powershell
cd frontend
pnpm install
pnpm start
```

Angular runs at http://localhost:4200. It forwards every `/api/...` request to Flask on port 5000 through `frontend/proxy.conf.json`.

If `pnpm install` stops with `ERR_PNPM_IGNORED_BUILDS`, run `pnpm approve-builds`, then `pnpm install` again.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Returns `{"status": "ok", ...}` |
| POST | `/predict/batting` | Predicts runs scored |
| POST | `/predict/bowling` | Predicts runs conceded |

Batting request body (all values numbers):

```json
{ "balls": 20, "fours": 3, "sixes": 2, "strike_rate": 150 }
```

Bowling request body:

```json
{ "fours": 3, "sixes": 1, "balls": 24, "economy": 8 }
```

Response:

```json
{ "model": "batting", "target": "Runs", "prediction": 30.0 }
```

Missing, extra, non numeric or out of range fields return HTTP 400 with an `error` message. An unknown model name returns 404.

Example call from PowerShell:

```powershell
$body = @{ balls = 20; fours = 3; sixes = 2; strike_rate = 150 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/predict/batting -ContentType "application/json" -Body $body
```

## Run the tests

```powershell
python -m pytest -q backend\tests
cd frontend
pnpm build
```

The backend command should end with `6 passed`. The build output is written to `frontend/dist/frontend/browser`.

## CI and CD

* `ci.yml` runs on every push and pull request to `main`.
  * Backend job: set up Python, install `backend/requirements.txt`, check syntax, run pytest.
  * Frontend job: set up Node and pnpm, install from the lock file, build Angular.
* `deploy.yml` runs after CI succeeds on `main`. It builds Angular for production with the repository name as the base path and publishes it to GitHub Pages.

One time setup: in the repository open Settings, then Pages, and set Source to **GitHub Actions**.

To see CD working, change any visible text in `frontend/src/app/app.html`, push to `main`, and watch CI and then Deploy to GitHub Pages in the Actions tab. The live page updates when both finish.

## Retrain or replace the models

Run the export cell at the end of `notebooks/Lab02_Devops_Final_Version.ipynb`, then copy the two JSON files into `backend/models/`. Keep the feature order the same as `SPECS` in `backend/app.py`:

* Batting: Balls, Fours, Sixes, Strike Rate (target: Runs)
* Bowling: Fours, Sixers, Balls, Economy (target: Conceded)

## Notes

* Strike Rate and Economy are calculated from the value being predicted, so the very high R² scores (about 0.999) are expected. This is prototype and serves only for understanding devops
* Only the Angular page is deployed. The backend is committed to the repository and tested in CI, but never hosted.
