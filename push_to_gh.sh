#!/usr/bin/env bash
# 用 GitHub Contents API 更新单个数据文件（无需 git push）
# 依赖：.ghtoken（token）、.ghrepo（owner/repo）
# 用法：bash push_to_gh.sh data/news.json
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
TOKEN="$(cat "$DIR/.ghtoken")"
REPO="$(cat "$DIR/.ghrepo")"
FILE="$1"
API="https://api.github.com/repos/$REPO/contents/$FILE"

SHA=$(curl -s -H "Authorization: Bearer $TOKEN" "$API" \
  | grep -o '"sha":"[^"]*"' | head -1 | sed 's/"sha":"//;s/"//')

CONTENT=$(base64 -w0 "$DIR/$FILE")

if [ -n "$SHA" ]; then
  PAYLOAD=$(printf '{"message":"auto: update %s","content":"%s","sha":"%s"}' "$FILE" "$CONTENT" "$SHA")
else
  PAYLOAD=$(printf '{"message":"auto: create %s","content":"%s"}' "$FILE" "$CONTENT")
fi

curl -s -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "$PAYLOAD" "$API" >/dev/null
echo "pushed $FILE -> $REPO"
