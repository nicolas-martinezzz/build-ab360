#!/usr/bin/env bash
# init.sh — Environment validation for Harness Engineering agents
# Exit code 0 = ready, non-zero = environment not ready
# Agents MUST run this before starting any task.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

pass() { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; ERRORS=$((ERRORS + 1)); }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo ""
echo "═══════════════════════════════════════════"
echo "  AB360 V3 — Harness Environment Check"
echo "═══════════════════════════════════════════"
echo ""

# ── 1. Node.js ───────────────────────────────────
if command -v node &>/dev/null; then
  NODE_VER=$(node --version)
  MAJOR=$(echo "$NODE_VER" | sed 's/v\([0-9]*\).*/\1/')
  if [ "$MAJOR" -ge 20 ]; then
    pass "Node.js $NODE_VER"
  else
    fail "Node.js $NODE_VER — se requiere v20+"
  fi
else
  fail "Node.js no encontrado"
fi

# ── 2. npm ───────────────────────────────────────
if command -v npm &>/dev/null; then
  pass "npm $(npm --version)"
else
  fail "npm no encontrado"
fi

# ── 3. node_modules instalados ───────────────────
if [ -d "node_modules" ] && [ -f "node_modules/.package-lock.json" -o -f "node_modules/.modules.yaml" ]; then
  pass "node_modules presente"
elif [ -d "node_modules" ]; then
  pass "node_modules presente"
else
  fail "node_modules ausente — ejecutar: npm install"
fi

# ── 4. Archivos de sistema presentes ─────────────
REQUIRED_FILES=("agents.md" "features.json" "conventions.md" "history.md")
for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "$f" ]; then
    pass "Archivo de sistema: $f"
  else
    fail "Archivo de sistema faltante: $f"
  fi
done

# ── 5. Carpeta /progress existe ───────────────────
if [ -d "progress" ]; then
  pass "Carpeta progress/ existe"
else
  warn "Carpeta progress/ no existe — creando..."
  mkdir -p progress
  pass "Carpeta progress/ creada"
fi

# ── 6. Carpeta .claude/agents existe ─────────────
if [ -d ".claude/agents" ]; then
  pass "Carpeta .claude/agents/ existe"
else
  fail "Carpeta .claude/agents/ faltante — roles de agente no configurados"
fi

# ── 7. Lint ───────────────────────────────────────
echo ""
echo "── Verificando lint..."
if npm run lint --silent 2>/dev/null; then
  pass "ESLint sin errores"
else
  fail "ESLint reporta errores — revisar antes de continuar"
fi

# ── 8. Paridad i18n ───────────────────────────────
echo ""
echo "── Verificando paridad i18n..."
if npm run check:i18n-parity --silent 2>&1; then
  pass "Paridad i18n OK"
else
  fail "Paridad i18n FALLA — claves desincronizadas entre locales"
fi

# ── 9. Tests ─────────────────────────────────────
echo ""
echo "── Ejecutando tests..."
if npm run test --silent 2>&1; then
  pass "Tests pasan"
else
  fail "Tests FALLAN — los agentes no deben empezar"
fi

# ── 10. features.json válido ─────────────────────
echo ""
echo "── Verificando features.json..."
if node -e "JSON.parse(require('fs').readFileSync('features.json','utf8'))" 2>&1; then
  PENDING=$(node -e "const f=JSON.parse(require('fs').readFileSync('features.json','utf8')); console.log(f.features.filter(x=>x.status==='pending').length)")
  IN_PROGRESS=$(node -e "const f=JSON.parse(require('fs').readFileSync('features.json','utf8')); console.log(f.features.filter(x=>x.status==='in-progress').length)")
  pass "features.json válido — pending: $PENDING, in-progress: $IN_PROGRESS"
else
  fail "features.json inválido — JSON malformado"
fi

# ── Resultado final ───────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Environment ready — los agentes pueden empezar${NC}"
  echo "═══════════════════════════════════════════"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Environment NOT ready — $ERRORS error(s) encontrado(s)${NC}"
  echo "   Resolver todos los errores antes de lanzar agentes."
  echo "═══════════════════════════════════════════"
  echo ""
  exit 1
fi
