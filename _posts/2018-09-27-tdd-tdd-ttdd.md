---
layout: post
title: TDD + TDD = TTDD
date: 2018-09-27
published: true
---

The mantra of Test Driven Development is *Red, Green, Refactor*.

The mantra of Type Driven Development is *Type, Define, Refine*.

How do we interleave and combine these two approaches?

You write your types first with absolutely no implementation (i.e. set everything to be undefined) - so you only create datatypes and write function type signatures. You get it to a state where it compiles. You then start writing tests. Since you know it compiles you dont have to write all of the test cases you would normally write. You then run the tests and see them fail. Then you write the implementation and see if it compiles. If it does, you then run the tests again. If they pass and everything compiles, you go through the process again... refining the types, and writing more tests.

*Type, Red, Define, Green, Refine, Refactor*
