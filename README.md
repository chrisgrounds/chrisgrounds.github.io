# chrisgrounds.github.io

The source for [chrisgrounds.github.io](https://chrisgrounds.github.io), built
with [Hakyll](https://jaspervdj.be/hakyll/).

## Prerequisites

- GHC 9.6 or newer
- Cabal 3.10 or newer

The easiest way to install both is [GHCup](https://www.haskell.org/ghcup/).

## Development

Install dependencies and build the site:

```sh
cabal update
cabal build -j2
cabal run site -- build
```

The generated site is written to `_site/`.

Run the development server with file watching:

```sh
cabal run site -- watch
```

Then open [http://localhost:8000](http://localhost:8000).

Other useful commands:

```sh
cabal run site -- clean
cabal run site -- rebuild
```

## Content

Posts live in `_posts/` and use YAML front matter:

```md
---
title: "A post title"
date: 2026-06-20
published: true
tags: ["haskell", "types"]
---
```

Post filenames must follow `YYYY-MM-DD-slug.md`. Their published URLs retain
the existing Jekyll-compatible shape: `/YYYY/MM/DD/slug.html`.

Set `published: false` to keep a draft out of the site, tag archives, and RSS
feed.

## Deployment

Pushes to `master` trigger the GitHub Actions workflow in
`.github/workflows/hakyll.yml`. It builds the site and deploys `_site/` to
GitHub Pages.
