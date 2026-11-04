#!/usr/bin/env bash
# Bandeja de prensa local: escribe el resumen del día en la bóveda, sin pasar
# por GitHub y sin publicar nada.
#
#   scripts/bandeja-diaria.sh
#   BANDEJA_DESTINO=~/otra/carpeta scripts/bandeja-diaria.sh
#
# Para ejecutarlo cada mañana, agrega a `crontab -e`:
#   17 8 * * * cd ~/Repositorios/porlaanarquia && scripts/bandeja-diaria.sh

set -euo pipefail

raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$raiz"

destino="${BANDEJA_DESTINO:-$HOME/Documentos/Antarquia/PorLaAnarquia/Bandeja}"
mkdir -p "$destino"

fecha="$(date +%F)"
archivo="$destino/$fecha.md"

python3 scripts/bandeja.py --salida "$archivo"
cp "$archivo" "$destino/Última bandeja.md"

printf 'Bandeja del %s: %s\n' "$fecha" "$archivo"
