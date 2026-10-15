#!/bin/bash
# usage: check.sh <base-url>   compares against https://myirishtax.com
B=$1; P=https://myirishtax.com; cb="cb=$RANDOM"
row(){ printf "%-44s | %-28s | %-28s\n" "$1" "$2" "$3"; }
row "check" "$B" "production"
for p in / /contractor-calculator /redundancy-calculator /marginal-tax-rate-ireland /rental-calculator /sitemap.xml /robots.txt /og-image.png /nope-404; do
  a=$(curl -s -o /tmp/ca.html -w '%{http_code}' "$B$p?$cb"); b=$(curl -s -o /tmp/cb.html -w '%{http_code}' "$P$p?$cb")
  row "GET $p status" "$a" "$b"
  case $p in
    /contractor-calculator|/redundancy-calculator|/marginal-tax-rate-ireland)
      row "  og:title" "$(grep -o 'property="og:title" content="[^"]*' /tmp/ca.html | cut -c29-60)" "$(grep -o 'property="og:title" content="[^"]*' /tmp/cb.html | cut -c29-60)"
      row "  og:url" "$(grep -o 'property="og:url" content="[^"]*' /tmp/ca.html | cut -c27-)" "$(grep -o 'property="og:url" content="[^"]*' /tmp/cb.html | cut -c27-)";;
    /rental-calculator) row "  robots meta" "$(grep -o 'name="robots" content="[^"]*' /tmp/ca.html | cut -c25-)" "$(grep -o 'name="robots" content="[^"]*' /tmp/cb.html | cut -c25-)";;
    /sitemap.xml) row "  <url> count" "$(grep -o '<url>' /tmp/ca.html | wc -l)" "$(grep -o '<url>' /tmp/cb.html | wc -l)";;
    /marginal-tax-rate-ireland) ;;
  esac
done
for r in /methodology.html /guides/bik.html; do
  row "redirect $r" "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$B$r" | sed "s#$B##")" "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$P$r" | sed "s#$P##")"
done
J='{"income":50000,"period":"annual","maritalStatus":"single","taxYear":2026}'
f(){ curl -s -X POST "$1/api/calc" -H 'content-type: application/json' -d "$J" | python3 -c "import json,sys
try:
 b=json.load(sys.stdin)['breakdown'];print(b['netAnnual'],b['uscTotal'],b['prsi'])
except Exception as e: print('ERR',e)"; }
row "POST /api/calc €50k (net usc prsi)" "$(f $B)" "$(f $P)"
C='{"grossIncome":60000,"expenses":0,"taxYear":2026,"maritalStatus":"single"}'
row "POST /api/calc/contractor status" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/calc/contractor -H 'content-type: application/json' -d "$C")" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $P/api/calc/contractor -H 'content-type: application/json' -d "$C")"
row "GET /api/auth/providers" "$(curl -s -o /dev/null -w '%{http_code}' $B/api/auth/providers)" "$(curl -s -o /dev/null -w '%{http_code}' $P/api/auth/providers)"
row "GET /api/auth/session" "$(curl -s $B/api/auth/session | head -c 30)" "$(curl -s $P/api/auth/session | head -c 30)"
row "home 'Estimate only' count" "$(curl -s "$B/?$cb" | grep -o 'Estimate only' | wc -l)" "$(curl -s "$P/?$cb" | grep -o 'Estimate only' | wc -l)"
row "home vercel analytics script" "$(curl -s "$B/?$cb" | grep -c '_vercel/insights\|va.vercel-scripts')" "$(curl -s "$P/?$cb" | grep -c '_vercel/insights\|va.vercel-scripts')"
row "/_vercel/insights/script.js" "$(curl -s -o /dev/null -w '%{http_code}' $B/_vercel/insights/script.js)" "$(curl -s -o /dev/null -w '%{http_code}' $P/_vercel/insights/script.js)"
