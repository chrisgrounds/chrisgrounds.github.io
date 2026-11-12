---
title: "English Is Not An Abstraction"
date: 2026-11-11
status: published
tags: []
---

Something I've seen a lot lately is the idea that prompting LLMs is another layer of abstraction, in the same way we have abstracted over binary to create assembly, and then abstracted over assembly to create C, etc. I think this completely misses the point of abstraction and what's going on when we abstract over something. Without pulling out the Oxford English Dictionary, I want to show what I mean with a few examples.

Say you've got the equations,

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

Or to put this more concisely,

```
n + n + ... + n = n * n = n^2
```

where *n* on the left-hand side is occurring *n*-times. 

Without this level of abstraction, our examples would soon become unwieldy. For example, writing out *16^2* with addition would take up the entire width of the page - *16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16*.

So abstraction is doing a very important job for us. When we abstract we are taking an idea, removing the specifics of it, and generalising it in a way that keeps the core idea intact across a whole domain.[1]

But this is precisely what happens when we use English to prompt LLMs. Natural language by its nature is ambiguous and generally not a good tool for abstraction. This is why mathematics and formalism is used so extensively in mathematics, physics, and programming, as they provide better tools for expressing and articulating abstractions.

## Footnotes 

[1] Abstractions come in different kinds. Mathematical abstractions are often precise and sound, whereas software-engineering abstractions can often be "leaky".
