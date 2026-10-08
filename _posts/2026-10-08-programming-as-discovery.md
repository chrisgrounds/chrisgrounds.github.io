---
layout: post
title: Programming as Discovery
date: 2026-10-08
published: true
tags: ["programming", "software engineering", "ai"]
---

I want to talk about two views on the purpose of programming. I'll call them _programming-as-discovery_ and _programming-as-output_. These are not exhaustive views but they are two views that have been on my mind a lot lately, especially with the rise of LLM-assisted and vibe-coding.

_programming-as-discovery_ is the view that the purpose of programming is not necessarily to produce code as an output. Rather, the desired end of programming is the building of understanding, a shared language, a coherent mental model, intuition about a system (which leads to ability to debug, insight into performance, etc), hypothesis formation, new techniques and insights to doing things better, amongst many other similar ends. And yes, code often is a vital end in the task of the programmer. Code is the proof to our thinking, validates our understanding, and provides many goods to real users (if done well). I take this to be what engineers like Ryan Fleury, Casey Muratori, and others think, along with what I take to be the real meaning of the original agile manifesto.

_programming-as-output_ is the view that the purpose of programming is that of producing code-artefacts to, ideally, satisfy some user need. Although more commonly I have seen the code-artefact itself appear to be the end goal. I wouldn't necessarily say there are any specific proponents of this view, but I see it becoming a more common implicit view recently due to the advances in LLM models and harnesses, which have allowed engineers to jump straight to the sole end goal of producing code.

I don't want to say that either view is correct. They are both useful views depending on what our purposes are. Practicing _programming-as-output_ can be very useful when used _as part_ of a hypothesis-formation/testing flow; for example when creating throw-away prototype code, we don't care about building understanding during this specific activity of programming, we just want to test a theory and then throw it away. Another example can be found in the recent Bun rewrite into Rust. It was completely an LLM-generated rewrite into Rust from Zig. Based on what I've read I think it's fair to say that during the course of this rewrite there was minimal development of understanding, shared language, clear intuition and mental models, etc. The end sole end goal was simply to replace Zig with Rust for an already well-understood domain. And it must be said that LLMs are remarkably good at porting from one language to another.

But I do worry that we, as an industry, are forgetting the value in _programming-as-discovery_, and I am worried that even if we proclaim to still care about those particular ends associated with _programming-as-discovery_ we will in practice jettison them in the name of "productivity".

So I do want to argue that the increasing use of and reliance on LLMs in coding makes _programming-as-discovery_ very hard to do. I think LLMs, especially as used indiscriminately today, are incredibly harmful to _programming-as-discovery_. In my experience, they lead to railroaded solutions which are not deeply thought through, a lack of shared understanding, a lack of a coherent and complete mental model, a loss of familarity with the code and domain, and a general de-skilling of otherwise talented engineers. I have had conversations with incredible engineers who now feel like they are becoming much more stupid. There is certainly an argument to be made around human-flourishing and excellence, but that's not in scope here.

And so as far as I can see this just cannot be a good thing to lose. We mustn't mistake one end of programming - namely, code - to be the whole end of it. I hope it's not too late for us to rediscover that programming is as much about discovery as it is about code output.
