---
title: Data Constructors Are Functions
date: 27 Sep 2018
published: true
---

Thanks to <a href="https://twitter.com/Iceland_jack/status/1041409114029674500">Iceland Jack</a> for this one. This post is me turning Iceland Jack's thread into a blog post.
To define an Algebraic Data Type (ADT) in Haskell we use the <code>data</code> keyword. Data declarations consist of two constructors, a type constructor and a data, or value, constructor.

```Haskell
data MyType        =   Something
       ^                     ^
type constructor      data constructor
```

Both constructors may have zero or more arguments. The example above has zero arguments, and so is called a nullary constructor. The Bool type is an example of a nullary datatype:

```Haskell
data Bool = True | False
```

Here is the syntax for a non-nullary data type.

```Haskell
data MyType a b c       =     Something a b c
              ^                           ^
      constructor args            constructor args
```

It is the same as the nullary one, except that the type- and data constructors have parameters following them. An example of a non-nullary datatype would be the Maybe type. The type constructor <code>Maybe</code> has one argument <code>a</code>, and the <code>Just</code> data constructor has one argument also.

```Haskell
data Maybe a        =  Nothing | Just a
           ^                          ^
       arg to Maybe               arg to Just
```

Now what is not apparent from this syntax is what exactly a non-nullary data constructor is: what exactly is <code>Just</code> and how does it work?

The answer is that <code>Just</code> is a function. In fact, all data constructors are functions. This means we can pass them into other functions, pattern match on them, return them, and so on.

Now the unfortunate thing about ADTs is that it is not obvious to see that we are dealing with functions. Fortunately, if we use the syntax from Generalised Algebraic Data Types (GADT), it does become apparent. Let's rewrite `Maybe` in the syntax of GADTs.

```Haskell
data Maybe  :: Type -> Type where
    Nothing :: Maybe a
    Just :: a -> Maybe a
```

This says that the type `Maybe` is also a function from a Type to a Type, which makes sense because `Maybe` is polymorphic on some type <code>a</code>. The <code>Nothing</code> constructor straightforwardly returns a `Maybe a`. And `Just` is a function from `a` to `Maybe a`.
