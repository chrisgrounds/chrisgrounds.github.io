---
layout: post
title: "Coding without implementation"
date: 2025-05-31
published: true
tags: ["fp", "types", "llms", "ai", "haskell"]
---

Ever since discovering the joy that is Haskell I have wondered how long it would be until we, as programmers and software engineers, would do away with hand-coded implementations. The Haskell type-system and general language design made it apparent to me that implementing functions by hand would one day become a relic of a bygone era. Instead, we would just think about _types_. Well, perhaps anyway. I think we've seen a glimpse of this future with the development of LLMs, where AI can generate most basic and trivial function definitions. However, I feel that most people are not taking advantage of the power here because they are using the wrong languages and type-systems. 

Let me give an example. 

## Hey Google, what is this function?

If I asked most software engineers what function the following type signature encodes, they probably wouldn't know. Most functional programmers, having been versed in this way of thinking about code probably would. And if I ask an LLM like gpt4.5, then it also knows the answer: 

```haskell
forall a. a -> a
```

Have a think about what this function could possibly encode. There is only one possibility and for those not versed in this type of syntax it says that this function takes any type of thing and returns that very same type of thing. Well, this is the identity function. There's really nothing else that can satisfy this type signature - as the LLM clearly states in its response:

```
id :: a -> a
id x = x

Because of its polymorphic type (forall a.), it cannot depend on any specifics 
of the argument—meaning it literally cannot do anything else other than 
return the argument itself.
```

The fact that the identity function is polymorphic is actually highly-constraining on it. Now what about: 

```haskell
forall a b. a -> b -> a
```

Once again the LLM comes to our rescue with the correct answer:

```
This function is known as const. Its definition is:

const :: a -> b -> a
const x _ = x

It takes two arguments of potentially different types, 
and returns the first one, completely ignoring the second.
```

So here we have given our LLM two type signatures and asked it to _derive_ the implementation. That's right - the implementations here are derived. In fact there is a long research history here going back to at least 1989 (and no doubt much before) looking at how we can derive implementation _and behaviour_ from types.[1] 

These, you might think, are not useful examples of "real" software problems. I would disagree but here's another more concrete example: what function implementation satisfies:

```haskell
User -> UserId
```

Who knows? And to be honest, who cares? We are done thinking about implementations here, let's delegate that job to the LLM:

```
If we define:

data User = User { userId :: UserId, ... }

then the function type:

User -> UserId

effectively constrains the implementation strongly enough that
it's essentially uniquely determined by the type, provided we 
assume no external context or computations:

getUserId :: User -> UserId
getUserId = userId
```

Perfect, now without turning this - what should be - short blog post into a deep lesson on advanced type-system design, let me conclude the lesson that I think we should take away. My view here is that there are two things going on: (1) as programmers and engineers we want to think about implementation as little as possible and instead elevate our thinking to the type level, and (b) LLMs are a powerful automation tool to write code. Combining these two points, I think, we should aiming to move as much of our thinking to the type-level as possible and then derive as much implementation as possible computationally (either through theorem-provers and the like or LLMs where we can't rely on more reliable automatic systems).

### References 

[1] https://people.mpi-sws.org/~dreyer/tor/papers/wadler.pdf
