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

You then notice that you can also square things if you put the "*" on the left-hand side,

```
n * 2 = n * 2
n * 3 = n * 3
n * 4 = n * 4
etc
```

There is another commonality here which you can abstract over, which makes you indifferent to whether you're using addition or multiplication to express the squaring - namely,

```
n^2 = n^2
```

Without this level of abstraction, our examples would soon become unwieldy. For example, writing out *16^2* with addition would take up the entire width of the page - *16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16 + 16*.

So abstraction is doing a very important job for us. When we abstract we are taking an idea, removing the specifics of it, and generalising it in a way that holds true across the entire domain of examples. It's not the case that `n^n` is only sometimes true and if we look hard enough we'll find examples which don't fit this abstraction.[1]

But this is precisely what happens when we use English to prompt LLMs. Natural language by its nature is ambiguous and not a good tool for abstraction - which is why mathematics uses... mathematics and not English.

## Footnotes 

[1] This is why leaky abstractions are particularly ergregious, as they violate one of the main benefits of abstraction.
