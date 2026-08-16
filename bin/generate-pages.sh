#!/bin/sh
set -eu
pages_dir="app/views/pages"
out_file="config/pages.js"
mkdir -p "$(dirname "$out_file")"
names=""
if [ -d "$pages_dir" ]; then
  first=1
  for file in $(find "$pages_dir" -type f -name '*.jsx' | sort); do
    name=${file#"$pages_dir"/}
    name=${name%.jsx}
    name=$(printf '%s' "$name" | tr "'" "_")
    if [ "$first" -eq 1 ]; then
      names="'$name'"
      first=0
    else
      names="$names, '$name'"
    fi
  done
fi
tmp_file=$(mktemp)
{
  printf 'const VIEWS = [%s];\n\n' "$names"
  printf 'export { VIEWS };\n'
} > "$tmp_file"
if [ ! -f "$out_file" ] || ! cmp -s "$tmp_file" "$out_file"; then
  mv "$tmp_file" "$out_file"
  count=$(find "$pages_dir" -type f -name '*.jsx' 2>/dev/null | wc -l | tr -d ' ')
  printf 'pages.js -> %s pages\n' "$count"
else
  rm "$tmp_file"
fi
