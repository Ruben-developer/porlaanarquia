#!/usr/bin/env bash
# Publica el portal en un solo paso.
#
#   scripts/publicar.sh "mensaje del commit"
#   scripts/publicar.sh --solo-pr "mensaje"     # abre el PR y se detiene
#
# Qué hace: valida los datos y el código, commitea en develop, sube, abre el
# PR a main, espera el CI, mergea, espera el deploy de Cloudflare Workers y
# comprueba que develop vuelva a contener main (lo sincroniza el Action
# "Sincronizar main en develop"). Si algo falla, se detiene sin mergear.

set -euo pipefail

raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$raiz"

solo_pr=false
if [[ "${1:-}" == "--solo-pr" ]]; then
  solo_pr=true
  shift
fi

mensaje="${*:-}"
if [[ -z "$mensaje" ]]; then
  echo "Uso: scripts/publicar.sh [--solo-pr] \"mensaje del commit\"" >&2
  exit 1
fi

titulo="$(printf '%s' "$mensaje" | head -n 1)"
cuerpo="$(printf '%s' "$mensaje" | tail -n +2)"

paso() { printf '\n\033[1m%s\033[0m\n' "$*"; }
aviso() { printf '  %s\n' "$*"; }
morir() { printf '\n\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

for bin in git gh node npx; do
  command -v "$bin" >/dev/null || morir "falta $bin en el PATH"
done

rama="$(git branch --show-current)"
[[ "$rama" == "develop" ]] || morir "estás en '$rama'; cambia a develop antes de publicar"

repo="$(gh repo view --json nameWithOwner -q .nameWithOwner)"

paso "1/6 · Validando"
node scripts/validar.mjs
node --check app.js
node --check markdown.js
npx --yes html-validate@9 index.html
aviso "datos, JavaScript y HTML en orden"

paso "2/6 · Preparando el commit"
git add -A
if git diff --cached --quiet; then
  aviso "no hay cambios sin commitear"
else
  git commit -q -m "$mensaje"
  aviso "commit $(git rev-parse --short HEAD) en develop"
fi

if git status --short | grep -q .; then
  morir "quedaron cambios sin commitear (revisa .gitignore)"
fi

paso "3/6 · Subiendo develop"
git push -q origin develop
aviso "develop al día"

paso "4/6 · Abriendo el PR"
pr="$(gh pr list --base main --head develop --state open --json number -q '.[0].number' || true)"
if [[ -z "$pr" || "$pr" == "null" ]]; then
  args=(--base main --head develop --title "$titulo")
  if [[ -n "$cuerpo" ]]; then
    args+=(--body "$cuerpo")
  else
    args+=(--fill)
  fi
  pr_url="$(gh pr create "${args[@]}")"
  pr="${pr_url##*/}"
  aviso "PR #$pr creado"
else
  aviso "PR #$pr ya estaba abierto; se reutiliza"
fi

paso "5/6 · Esperando el CI"
for _ in $(seq 1 30); do
  [[ -n "$(gh pr checks "$pr" 2>/dev/null || true)" ]] && break
  sleep 4
done
if ! gh pr checks "$pr" --watch --interval 10; then
  morir "el CI falló; el PR #$pr queda abierto para revisarlo"
fi

if [[ "$solo_pr" == true ]]; then
  aviso "PR #$pr listo y validado; no se mergeó (--solo-pr)"
  gh pr view "$pr" --json url -q .url
  exit 0
fi

paso "6/6 · Mergeando y publicando"
gh pr merge "$pr" --merge --delete-branch=false >/dev/null
merge_sha="$(gh pr view "$pr" --json mergeCommit -q .mergeCommit.oid)"
aviso "merge $merge_sha"

# El workflow "Deploy prod (Cloudflare Workers)" despliega al mergear en main.
deploy=""
for _ in $(seq 1 60); do
  deploy="$(gh run list -R "$repo" --workflow deploy-workers.yml --branch main --limit 1 \
    --json headSha,status,conclusion \
    -q '.[0] | "\(.status) \(.conclusion // "-") \(.headSha)"' 2>/dev/null || true)"
  [[ "$deploy" == "completed success $merge_sha" ]] && break
  sleep 8
done
if [[ "$deploy" == "completed success $merge_sha" ]]; then
  aviso "Workers desplegado"
else
  aviso "aviso: el deploy de Workers aún no reporta $merge_sha (revisa en un minuto)"
fi

# El Action de sincronización devuelve main a develop; se espera un momento.
for _ in $(seq 1 60); do
  git fetch -q origin main develop
  if git merge-base --is-ancestor origin/main origin/develop; then
    aviso "develop sincronizada con main"
    break
  fi
  sleep 5
done

url="https://porlaanarquia.antarquia.cl/"
printf '\n\033[32m✓ Publicado\033[0m  %s\n' "$url"
