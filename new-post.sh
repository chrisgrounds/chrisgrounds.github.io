#!/usr/bin/env bash
# Create a new draft post dated today.
# Usage: ./new-post.sh "My Post Title"
set -euo pipefail

if [ $# -lt 1 ] || [ -z "$1" ]; then
    echo "Usage: $0 \"Post Title\"" >&2
    exit 1
fi

title="$*"
date="$(date +%F)"
slug="$(printf '%s' "$title" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"

if [ -z "$slug" ]; then
    echo "Could not make a filename from title: $title" >&2
    exit 1
fi

dir="$(cd "$(dirname "$0")" && pwd)/_posts"
file="$dir/$date-$slug.md"

if [ -e "$file" ]; then
    echo "Already exists: $file" >&2
    exit 1
fi

escaped_title="${title//\\/\\\\}"
escaped_title="${escaped_title//\"/\\\"}"

cat > "$file" <<EOF
---
title: "$escaped_title"
date: $date
status: draft
tags: []
---

EOF

echo "$file"
