---
layout: post
title: "Impossible Tests"
date: 2026-06-08
published: true
tags: ["fp", "types", "tests", "haskell"]
---

The best test is the one you can't write. It's not one which checks some invariant or ensures behaviour works as expected, it's one which is literally impossible to write. 

Suppose for some blogging software we have a requirement that a blog must have _one or more_ authors. That makes sense, a blog can't spontaneously come into existence, it must have an `author` and sometimes it may have more than one. We could represent a blog's authors as a list or vector and then write a test to ensure it's never empty. Maybe downstream code has to occasionally check the list of authors is never empty and if it is handles it appropriately. Maybe we panic, maybe we throw, whatever we do we have to handle it - and our tests have to care about this. If we are good functional programmers, we might even represent authors as a newtype `Authors(Vec<Author>)` with a smart-constructor that checks at construction-time that the list is not empty. That way we only ever have to check in one place that the list is not empty. This is good encapsulation and we only need write one set of tests to verify the desired behaviour.

But we are still writing tests. And the tests we are writing are really a reflection of the fact we haven't properly encoded the invariant. There is a better way that involves moving the invariant into the type-system. Instead of a list of `author` or a newtype-wrapper around that list, we can encode the fact that the list cannot be empty into the _type_ itself. This is the `Nonempty` type, and here's one way we can construct it in Haskell and Rust:

```haskell
data Nonempty a = Nonempty {
  head :: a,
  rest :: [a]
}
```

```rust
struct Nonempty<T> {
  head: T,
  rest: Vec<T>
}
```

In order to create a `Nonempty Author` we literally cannot give it an empty list. Encoded in the very definition of this type is the fact we must pass an instantiated value to `head`. By virtue of this fact, we have proven that we do not (and cannot) have an empty list of authors.

Our tests are not only redundant, but impossible to construct in the first place - impossible because it really is impossible to create the negative, red test-case. And these are the best kinds of tests, in my view. You can't write them because the thing to test is impossible to construct. Now, to be clear this is not to say we don't need tests. Not everything can be encoded in this way. But I would argue this is the default way we should be trying to program, safe in the knowledge that we can always fallback to a test if our type-system is not expressive enough.
