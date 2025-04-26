---
layout: post
title: "Two Types of TDD"
date: 2025-04-24
published: true
tags: ["tdd", "testing"]
---

Test Driven Development has gotten a large amount of attention over the years, probably too much attention. I think there is a better way of developing software, and it funnily enough has the same acronym. Let's look at both types of software-development practice.

## TDD

The flow of Test Driven Development is very well understood at this point. You start by writing the most basic test you can, which will of course fail because you've written no code yet. Then you write the most basic code you can to pass the test. You continue adding tests and writing code to pass them until your requirements are satisfied.

This works well as a design method because it forces you to think about your code's API and how other people will interface with it, and it naturally leads to a full test suite that gives you confidence in your code. 

## The second TDD, aka TyDD

The second type of TDD is Type Driven Development, which I will abbreviate as "TyDD". The flow here is similar to TDD in some respects and different in others. You start by defining types to represent your domain model. Similar to Domain Driven Design, this is where you need to sit down with the domain expert and gain a thorough understanding of the domain. You'll generally represent the domain through Algebraic Data Types (Sum, Product, Union, Discriminated Union, Record, etc) and define any appropriate categorical concepts (*this* thing is a functor, or *that* thing is a monoid, etc). As you go through this collaborative process all you are doing is defining the core data types of your application.

In one of the earliest articles on TyDD I can find, Tomas Petricek<sup>[1]</sup> noted after doing this for a real example,

> What have we achieved so far? We described the domain model for the Journey log application with less than 20 lines of code. When writing the code for the first time, I typed a few type declarations, explained them to my friend and he gave me feedback saying what was wrong with my first design. This means that the process was quite collaborative and iterative.

The next step is to translate your business logic into functions that only have type-signatures. You won't implement the functions, you will simply assert through the type system that they take and return the expected data types. 

```haskell
```haskell
calculateEbitda :: IncomeStream -> ExpensesStream -> Ebitda
calculateEbitda = undefined
```

Then once the code is compiling you can begin to implement your functions, adding tests where appropriate. Providing the code continues to compile and any tests you add pass, you should have very high confidence that the code will do what you expect and that you have met your user requirements and correctly modelled your domain.

Of course, throughout the development process and after you will constantly be asking of each other - *is this the right kind of abstraction*, *do we really need this to be a monad?*, etc. TyDD is and should be incredibly collaborative.

### Types are tests

On the subject of tests, you can think of types as being exhaustive test-cases, or of tests as being specific instances of types. Generally, more type-heavy language communities like to focus more of their attention to property-based testing than less-expressive languages. This is because property-based testing lets us focus on testing properties rather than specific examples, which should be handled by the type-system as much as possible.

## Appendix

[1] https://tomasp.net/blog/type-first-development.aspx

