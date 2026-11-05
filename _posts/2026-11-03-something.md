---
title: "Something to do with types?"
date: 2026-11-03
status: draft
tags: ["programming", "fp", "software design", "types", "tdd", "type-driven-development"]
---

<tldr>
1. State machines are very useful ways of representing business logic and requirements
2. If your business logic is expressible in a logic, then it can be encoded in types, by the Curry-Howard isomorphism
3. Type-level state machines (aka typestate) are a very good way of proving correctness of business logic and requirements
</tldr>

The first few sections give an introduction to Curry-Howard and state machines, so feel free to skip if you're already familiar with them.

## Introduction

Formal verification (FV) has been gaining a lot of traction lately, mainly driven by the desire to add more correctness and confidence in the output of more hands-off agentic engineering practices. I think FV has a lot of value, but one of the risks with it is the risk of drift. At least when using tools like TLA+, for example, where the domain is formally expressed in a language that is not the language of implementation. The risk quickly becomes that the formally-verified spec "drifts" away from the actual coding implementation - in the same way that comments drift from implementation.

The other approach taken has been to write code in proof-assistant languages like Lean 4. This solves the drift risk because the code that is proven is the implementation code. Anthropic have [written quite a bit about their forays into Lean4 formally-verified code](https://www.anthropic.com/research/provable-inference).

But there is actually a very simple way of proving your code is correct without having to write formal specs or formal proofs. But first we need to understand two ideas: Curry-Howard & State Machines.

## Constructivism and Propositions as Types

The idea is based on the Curry-Howard isomorphism, or as Philip Wadler named his paper _Propositions as Types_. Every logical proposition corresponds to a type, and, as it turns out, programs - which are collections of types and functions - correspond to proofs.

For example, if the proposition `A` is true, then that is the same as constructing the type `A`. Likewise, if the proposition `B` is true, then that's the same as constructing the type `B`. And if we combine these together, then the proposition that `A & B` is true is the same as constructing the pair type of `(A, B)`. To give an example of this, suppose we have the proposition that _this wall is made of brick and is painted red_. That would correspond to a program in which we have a type containing brick and a type containing red, and then we construct the pair of `(Brick, Red)`.

// NOTE: is this right, or would we need the brick and red to be elevated to the type level?

What's really fascinating about the Curry-Howard isomorphism is that this applies to all logical connectives (i.e. logical `AND` is a pair, logical `OR` is a disjunct union, logical `if-then` is a function, etc). And because of this fact we can map back and forth between logic and programming. Now, relevant to this discussion is the subject of intuitionistic logic, which is a type of constructivist mathematics. we don't need to go into the details here, but the relevant point here is that in intuitionistic logic you have to _construct_ the proof you are trying to proof. What this means in practice is that you cannot say something like "it's raining or it's not raining", which would be true in classical logic. Instead, in intuitionistic logic, you have to construct/prove of one of the operands - i.e. proof that it is raining or proof that it is not raining. Only when you have a proof for it raining (or not) can you say that "it's raining or it's not raining" is true.

And because of the Curry-Howard isomorphism, this also applies to programming. All we need to do to prove a proposition is to construct it in the type system. And in fact, as Wadler notes,

> for each way to simplify a proof there is a corresponding way to evaluate a program

That is to say that the act of evaluating a program is equivalent to simplifying a proof.

I've most definitely not done the idea justice, but I'm not attempting to here. For a more detailed look at the Curry-Howard isomorphism, definitely check out Wadler's paper.

## State Machines

The second idea that we need is going to be much more familiar to programmers, and it's the idea of a state machine. But to recap, a state machine is a system which has a finite number of states and transitions between those states. For example, a door might have the states of `Locked` and `Unlocked`, and it might have transitions between those two states of `lock the door` and `unlock the door`.

What's important about state machines is that although they are very simple they are sufficient to perform any computation (providing they have unbounded memory, which is when they become Turing machines. (With bounded memory they can describe simpler models of computation, such as regular languages (i.e. regex))).

## Typestate (aka. Type-Level State Machines)

Going back to the initial opening paragraphs on TLA+, thinking about software engineering and how a big part of the challenge is around turning requirements into formal specification, it seems to me that we can leverage Curry-Howard and state machines to take requirements and turn them into both executable code and a proof of that executable code. The first step is to turn our requirements into a state machine, and I think firstly that a large part of software can be represented as a state machine. Secondly, that requirements and business logic are usually just transitions between different states.

In order to leverage the Curry-Howard isomorphism, what we need to be doing is not just creating state machines, but creating state machines at the type-level. Once we create them at the type level, then we get our proof of correctness.

(There are a couple caveats that need to be made. The first is that there are different levels to which we can do this depending on what we are quantifying over (more on that later), and the second is that there is a minimum level of expressiveness that we need. So this is just not going to work in unsound languages like TypeScript and - for obvious reasons - dynamic languages like JS, Python, etc.)





"Propositions as Types was first formulated for intuitionistic logic. It is a perfect fit, because in the intuitionist interpretation the formula A∨B is provable exactly when one exhibits either a proof of Aor a proof of B, so the type corresponding to disjunction is a disjoint sum"

second-order quantification over polymorphism

first-order quantification requires dependent types, as we are quantifying over _values_.





All we have needed for this is a type-system that supports algebraic data types and functions.
