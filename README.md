# chrisgrounds.github.io

The source for [chrisgrounds.github.io](https://chrisgrounds.github.io), built
with [Hakyll](https://jaspervdj.be/hakyll/).

## Prerequisites

- GHC 9.6 or newer
- Cabal 3.10 or newer

Either run `nix develop` to get the same toolchain as CI (GHC 9.6.7), or install
both with [GHCup](https://www.haskell.org/ghcup/).

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
status: published
tags: ["haskell", "types"]
---
```

Post filenames must follow `YYYY-MM-DD-slug.md`, and posts are served at
`/YYYY/MM/DD/slug.html`.

`status` is required and must be `published` or `draft`. Drafts are built at
their URL but are not listed on the home page, archive, tag pages, or RSS feed.
Posts with any other `status`, or none, are not built at all.

To open a post with a summary box, wrap Markdown in `<tldr>` tags, each on its
own line:

```md
<tldr>
1. The first point
2. The second point
</tldr>
```

## Deployment

Pushes to `master` trigger the GitHub Actions workflow in
`.github/workflows/hakyll.yml`. It builds the site and deploys `_site/` to
GitHub Pages.
