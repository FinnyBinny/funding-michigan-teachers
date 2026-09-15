#!/usr/bin/env bash
# Guards the impact figures against drift.
#
# These numbers were typed by hand in six files and fell out of step: one card
# read "1,000+ staff members" in its heading and "Educators reached" in the
# stat directly beneath it, and the teacher count appeared as both 200+ and
# 220+. src/data/impactStats.ts is now the single source of truth; this catches
# a stale or retyped figure before it reaches the site.
#
# Run locally with: bash scripts/check-consistency.sh
set -uo pipefail
cd "$(dirname "$0")/.."

INCLUDES=(--include=*.tsx --include=*.ts --include=*.html)
TARGETS=(src index.html)
fail=0

# "phrase|why it's wrong"
BANNED=(
  "1,000+ educators|the 1,000 figure counts all staff, not just teachers"
  "1000+ educators|the 1,000 figure counts all staff, not just teachers"
  "Educators reached|say 'Staff reached' — that count includes non-teaching staff"
  "200+ teachers|the teacher count is 220+"
  "350+ teachers|350+ is the STAFF count; teachers are 220+"
  "350 teachers|350 is the STAFF count; teachers are 220+"
  "across 9 schools|three are partner schools, the other six were one-time deliveries"
  "9 schools supported|three are partner schools, the other six were one-time deliveries"
  '$3,000+ value|the Chick-fil-A meal cards are roughly $5,000 FMV'
  "over \$3,000 in value|the Chick-fil-A meal cards are roughly \$5,000 FMV"
  "15,000|the documented figure is \$8,500+ in support"
  "100% of donations|overhead is 15-20%; say 'at least 80¢ of every dollar'"
  "100% of every donation|overhead is 15-20%; say 'at least 80¢ of every dollar'"
  "Zeffy|checkout has been Stripe since PR #14"
  "statewide reach|FMT works in Ingham County; statewide is the goal, not the present"
)

for entry in "${BANNED[@]}"; do
  phrase="${entry%%|*}"
  why="${entry#*|}"
  # Comment lines are excluded: several of these phrases appear in comments
  # that exist precisely to warn against using them.
  hits=$(grep -rniF "${INCLUDES[@]}" -e "$phrase" "${TARGETS[@]}" 2>/dev/null \
         | grep -vE '^[^:]+:[0-9]+: *(//|\*|/\*|--)' || true)
  if [ -n "$hits" ]; then
    echo "::error::\"$phrase\" — $why"
    echo "$hits" | head -5 | sed 's/^/    /'
    fail=1
  fi
done

if [ "$fail" -eq 0 ]; then
  echo "Impact figures consistent."
else
  echo
  echo "Canonical figures live in src/data/impactStats.ts — import from there."
fi
exit "$fail"
