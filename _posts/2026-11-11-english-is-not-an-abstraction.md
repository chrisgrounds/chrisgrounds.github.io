---
title: "English Is Not An Abstraction"
date: 2026-11-11
status: published
pangram_url: https://www.pangram.com/history/63765513-dd0a-46c7-b678-2dccddacbe2c?ucc=z4e6u5vg1aN&utm_source=pangram_share&utm_medium=copy_link
tags: []
---

Something I've seen a lot lately is the idea that prompting LLMs is another layer of abstraction, in the same way we have abstracted over binary to create assembly, and then abstracted over assembly to create C, etc. I think this misses the point of abstraction and what's going on when we abstract over something. To abstract is to ["pull/draw away from"](https://www.etymonline.com/word/abstract) and generalise. When we prompt an LLM with English (and other natural languages) we are delegating rather than abstracting. An easy way to see this is to ask whether outsourcing in the past was considered an abstraction. It obviously wasn't.

But let's consider an example to see what abstraction is acutally doing. Say you've got the equations,

```
2 + 2 = 4
3 + 3 + 3 = 9
4 + 4 + 4 + 4 = 16
etc
```

And you want to abstract this idea of squaring numbers. You might start by renaming the constants with variables,

```
n + n = n * 2
n + n + n = n * 3
n + n + n + n = n * 4
etc
```

Then you notice a pattern. The number of *n*s on the left corresponds to the number on the right. 5 *n*s and you'll multiply *n* by 5. 7 *n*s you'll multiply *n* by 7. And n *n*s and you'll multiply *n* by *n*. You might express this more formally as,

```
n + n + ... + n = n * n
```

where *n* on the left-hand side is occurring *n*-times. You know that _n * n_ is the same as raising *n* to the power of 2, so you can then express the formula as follows,

```
n * n = n^2
```

This is much more *concise* and *general* than the initial examples. And without this level of abstraction, our examples would soon become unwieldy. For example, writing out *32^2* with nothing but addition would take up a lot of space - *32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 32*.

So abstraction is doing a very important job for us. When we abstract we are taking an idea, removing the specifics of it, and generalising it in a way that keeps the core idea intact across a whole domain.[1]

English, and other natural languages, do a bad job of this. Natural language by its nature is ambiguous and generally not a good tool for abstraction. This is why mathematics and formalism is used so extensively in mathematics, physics, biology, chemistry, engineering, programming, etc, as they provide better tools for expressing and articulating abstractions. And consequently why I think prompting LLMs with natural langauge is not some new level of abstraction we've discovered, rather it is delegation.

## Footnotes 

[1] Abstractions come in different kinds. Mathematical abstractions are often precise and sound, whereas software-engineering abstractions can often be "leaky" - that is, until you start writing Haskell.
