#!/bin/bash
# usage: fullcheck.sh <base>  -> every sitemap page (status + not-advice line + og:url + robots), 16 redirects, /api/calc
B=${1:-https://myirishtax.com}; cb="cb=$(date +%s)$RANDOM"; fail=0
urls=$(curl -s --retry 3 --retry-all-errors --max-time 40 "$B/sitemap.xml?$cb" | grep -o '<loc>[^<]*' | cut -c6- | sed 's#https://myirishtax.com##')
for p in $urls /rental-calculator; do
  h=$(curl -s --retry 3 --retry-all-errors --max-time 40 -w '\n%{http_code}' "$B${p:-/}?$cb"); code=$(echo "$h" | tail -1)
  na=$(echo "$h" | grep -o 'Estimate only, not financial or tax advice' | wc -l)
  og=$(echo "$h" | grep -o 'property="og:url" content="[^"]*' | cut -c27- | sed 's#https://myirishtax.com##')
  ot=$(echo "$h" | grep -o 'property="og:title" content="[^"]*' | cut -c29- | md5sum | cut -c1-6)
  rb=$(echo "$h" | grep -o 'name="robots" content="[^"]*' | cut -c24-)
  echo "PAGE ${p:-/} $code notadvice=$na og:url=${og:-NONE} ogt=$ot robots=${rb:-index}"
  [ "$code" = 200 ] && [ "$na" -ge 1 ] || fail=1
done
for s in $(grep -o "source: '[^']*'" "$(dirname "$0")/../../next.config.mjs" | cut -d"'" -f2); do
  r=$(curl -s --retry 3 --retry-all-errors --max-time 40 -o /dev/null -w '%{http_code} %{redirect_url}' "$B$s"); echo "REDIR $s $r" | sed "s#$B##"
  echo "$r" | grep -q "^308 " || fail=1
done
J='{"income":50000,"period":"annual","maritalStatus":"single","taxYear":2026}'
echo "CALC $(curl -s --retry 3 --retry-all-errors --max-time 40 -X POST "$B/api/calc" -H 'content-type: application/json' -d "$J" | python3 -c "import json,sys;b=json.load(sys.stdin)['breakdown'];print(b['netAnnual'],b['payeAfterCredits'],b['uscTotal'],b['prsi'])")"
echo "FAIL=$fail"
