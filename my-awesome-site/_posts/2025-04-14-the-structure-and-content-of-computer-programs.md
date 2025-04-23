---
layout: post
title: "The Structure and Content of Computer Programs"
date: 2025-04-23
published: true
tags: ["types", "domain modelling", "fp"]
---

One way of thinking about software is to imagine that programs are made up of structure, content, and transformations. Content is stuff like strings, numbers, and just general values of things. You can think of content as domain objects. Structure is non-valueful stuff that contains content - for example things like lists, arrays, futures, streams, results, etc. And transformations are functions.

In what follows, let's denote content with lowercase letters like `a`, `b`, etc, and as the list is the canonical example of structure, so let's steal its syntax to denote structure. So we will denote structure by wrapping content in a set of brackets `[]`. (For example, a list of strings would be denoted as `[a]`.) Finally, we will denote functions with arrows `->`, such that `a -> b` is a function which takes an `a` and returns a `b`. 

Now let's look at some interesting patterns for composing these three objects.

## Lifting into structure, aka why functors are banal

Suppose you have some structure, say a list of strings (`[string]`) and the function `string -> string` (i.e. take a string and returns a string, something like `get_first_character` or `reverse`), then you have the problem of how to use your function. You can't pass your function the list of strings because the function doesn't accept a list, it only accepts _content_, not structure. 

To put it differently, if we think of structure like a box then we need to "lift" our function into that box so that it can work on the stuff inside. Viewing this through a mathematical lens, what we are wanting to do is "map" from one set to another set. In fact, `map` is often what this operation is called in programming langauges.

```js
["hello", "world"].map(toUppercase)
// ["HELLO", "WORLD"]
```

Now `map` generally exists for only list/array-type structures in most languages, but actually that limitation is arbitrary. Instead, we want to talk more generally about lifting/mapping for _any_ arbitrary type of structure. Rust extends the use of `map` to `Result` and `Option` types, so that you can take a function and lift it into an `Result`/`Option` like so:

```rust
Ok(1).map(double)
// Ok(2)
```

Generalising this beyond lists and arrays to any arbitrary structure is what is called a functor.

## Lifting structure-adding functions into structure, aka why monads are equally banal

But what if your function now takes some content and returns that content wrapped up in structure - for example, `a -> [a]` or `string -> [string]`. When you lift this function into your structure, you will end up with structure inside structure containing the actual content you want, when you only wanted the original structure with the modified content. For example,

```rust
Ok("hello world").map(|x| { Ok(to_uppercase(x)) })
// Ok(Ok("HELLO WORLD"))
```

This is no longer structure-preserving, so you need to collapse the additional structure created by this new function and to do that you need a function called `join` or `flatten`. When you compose `map` and `join` together you get a function called `bind` or `and_then`. Let's briefly consider what `join` is actually doing by considering its type signature:

`join = [[a]] -> [a]`

In other words, join (or flatten) the structure inside the structure into a single structure. So composing `map` and `join` together gives us something which lifts a function into our box (where this function creates a new box inside the original box) and then flattens the two boxes together leaving a single box. As an example, imagine we wrap a http_response inside a rust `Result` and want to lift the function `add_to_database` into the `Result`, which itself returns another `Result`, we can just use `and_then` to compose them together and not have to worry about preserving the structure. 

```rust
Ok(http_response).and_then(add_to_database)
```

We could of course do this more explicitly with `map` and `join`:

```
Ok(http_response).map(add_to_database).join()
```

Which is also know as `flatMap` in Scala and various other languages:

```
[a].flatMap(doThingAndReturnStructure)
```

These structures are monads. In fact, if your structure is a functor then all you need to do to make it a monad is define `join` for it, because you then get `bind`/`and_then` for free by composing `map` and `join` together!

## xx





I’m sure most languages have some sort of monadic structure just because they are so useful.

Fun fact: if your function itself is wrapped up inside some structure then you’re dealing with an applicative!




## Addendum: Functors and monads are (almost) everywhere you look

In JS, promises are monads if you squint a little/lot. In Promise(1), 1 is the content and Promise is the structure. When you use then() you’re using the equivalent of bind. However, something I’ve crucially not mentioned: monads are lawful. And without turning this into an essay, take my word that JS promises do not satisfy the monad laws. But from the point of view of their signatures they come close. 
