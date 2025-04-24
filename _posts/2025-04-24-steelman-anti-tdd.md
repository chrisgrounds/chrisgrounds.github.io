---
layout: post
title: "A Steelman Anti-TDD Argument"
date: 2025-04-24
published: true
tags: ["tdd", "testing"]
---

I've seen lots of arguments, good and bad, for and against Test Driven Development. And this topic has recently come up again on LinkedIn after Jason Gorman<sub>[1]</sub> brought up a 2015 study<sub>[2]</sub> showing only 1.7% of developers actually practice TDD (I'm not surprised based on my anecdotal experience). In any case, both sides of the TDD divide love a good strawman. So I want here to present the best argument I can think of against TDD. And I do this as someone who loves writing tests, and thinks there is much value in a test-first approach to testing.

## The Argument

To begin with let's think about what the purpose of a test is. There are various reasons to write tests but one of the main pillars as far as TDD is concerned is to drive the design of software. I think as far as it drives good design, this is a very good and powerful reason to use TDD. Now another pillar is that the test-first approach leads to good bug-free software that meets user requirements. It's along this axis the steelman argument will proceed.

For take what a test is: a single execution environment that verifies behaviour non-exhaustively. This point is completely banal - you write one test, then another, then another, until you are satisfied you have captured the intent of the code. Writing numerous iterations of similar tests is required because single tests do not exhaustively verify behaviour. A test that checks that your function adds up two monetary amounts correctly will only ever check it for, let's say, two integers. Of course, this is where the red-green-refactor cycle comes in, and where TDD proponents will say you should write more tests. But unless your range of possible inputs is practically enumerable in some way, you will never be able to write enough tests. There will always be potential edge cases. If you wanted guarantees about your function, which takes two i64s and returns a new i64, for all cases then you would need to write 3.4 * 10^<sup>38</sup> unit tests.

Now you might say, we will limit the range of inputs or constrain our inputs in some way, so that we don't need to worry about enumerating a large number of tests to guarantee correctness. And here is the crux of the steelman argument: in doing this, you are already domain modelling and you are in fact removing both pillars in support of TDD. By constraining the range of inputs for your function under test, you are both modelling your domain via the type-system and guaranteeing correctness via the type-system. In fact, you are doing TDD - it's just that the "T" stands for "Type" not "Test".

So in order to guarantee correctness and bug-free software, you can't use TDD - instead you must use the type-system. But in doing so, you demolish the first pillar of TDD: i.e. you will design and model your code through the type-system, not the tests.

I think this points to an interesting observation. In languages with weak type-systems, where it is harder to model and guarantee correctness, you must use more and more tests (but never achieve full enumeration of all test cases). This tells us that tests are actually a representation of language weakness. The more tests you need, the weaker your language is in terms of its expressiveness and correctness.

## Appendix

[1] https://www.linkedin.com/posts/jasongorman_a-large-scale-study-of-dev-activity-in-the-activity-7321034693926137856-XiZc?utm_source=share&utm_medium=member_desktop&rcm=ACoAAB3lsLkBm67ca1ExADEE8ZduzUtGgEi_xak

[2] https://gousios.org/pub/developer-testing-in-IDE.pdf
