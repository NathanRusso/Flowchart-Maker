# Commands Used

This document is mostly for my own notes. It is not in the README for a reason.

## Virtual Environment & Requirements (Windows)

```bash
python -m venv .venv
```

```bash
.\.venv\Scripts\activate
```

```bash
pip install --ignore-installed -r requirements.txt
```

## Virtual Environment & Requirements (WSL - Ubuntu)

```bash
sudo apt update
```

```bash
sudo apt install -y libmariadb-dev build-essential python3-dev
```

```bash
python3 -m venv .venv
```

```bash
source .venv/bin/activate
```

```bash
pip install --ignore-installed -r requirements.txt
```

## Running Backend

```bash
gunicorn app:app
```

## Docker

### Build and Run

```bash
docker build -t flowchart-maker .
```

```bash
docker build --no-cache -t flowchart-maker .
```

```bash
docker run --name flowchart-test -p 8080:8080 --env-file .env flowchart-maker
```

### Stop and Remove

```bash
docker stop flowchart-test
```

```bash
docker rm flowchart-test
```

## Files

```bash
cp json/templates/*.json json/templates/2025-2026/
```

```bash
rm json/templates/*.json
```

```
for f in *2526*; do mv -- "$f" "${f//2526/2025_2026}"; done
```