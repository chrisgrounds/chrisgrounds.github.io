---
layout: post
title: "Impossible Tests"
date: 2026-06-08
published: true
tags: ["fp", "types", "tests", "haskell"]
---

The best test is the one you can't write. It's not one which checks some invariant or ensures behaviour works as expected, it's one which is literally impossible to write. 

Suppose for some blogging software we have a requirement that a blog must have _one or more_ authors. That makes sense, a blog can't spontaneously come into existence, it must have an `author` and sometimes it may have more than one. We could represent a blog's authors as a list or vector and then write a test to ensure it's never empty. Maybe downstream code has to occasionally check the list of authors is never empty and if it is handles it appropriately. Maybe we panic, maybe we throw, whatever we do we have to handle it - and our tests have to care about this. We might even represent authors as a newtype `Authors(Vec<Author>)` with a smart-constructor that checks at construction-time that the list is not empty - now we only ever have to check in one place the list is not empty. This is good encapsulation and we only need write one set of tests to check the invariant.

But we are still writing tests. And the tests we are writing are really a reflection of the fact we haven't properly encoded the invariant in the _type_-system. Fortunately, in this instance, we can leverage the power of types. Instead of a list of `author` or a newtype-wrapper around that list, we can encode the fact that the list cannot be empty into the _type_ itself. We might call this the `Nonempty` type, and here's one way we can define and construct it in Haskell and Rust:

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

In order to create a `Nonempty Author` we literally cannot give it an empty list, as encoded in the very definition of this type is the fact we must pass an instantiated value to `head`. By virtue of this fact, we have proven that we do not (and cannot) have an empty list of authors. Even if we pass an empty list to `rest`, refusing to supply a value to `head` will produce a type-error.

Any tests here are not only redundant, they are impossible to construct in the first place - impossible because it really is impossible to create the negative, red test-case. And these are the best kinds of tests, in my view. You can't write them because the thing to test is impossible to construct. Now, to be clear this is not to say we don't need tests. Not everything can be encoded in this way. But I would argue the default way to program should not be to write tests, but to write code that doesn't need tests, safe in the knowledge we can always fallback to tests if our type-system is not expressive enough.
