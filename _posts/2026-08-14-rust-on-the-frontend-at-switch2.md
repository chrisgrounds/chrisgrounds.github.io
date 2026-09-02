---
layout: post
title: "Rust on the Frontend at Switch2"
date: 2026-08-14
published: true
tags: ["rust", "frontend", "leptos"]
---

It’s probably fair to say that when people think of Rust they typically think of it as a systems or backend programming language, and this perception has not been entirely without merit. The Rust web offering has certainly been the least well-known and least mature part of the ecosystem. However, that’s not to say it is a poor part of the ecosystem. [Leptos](https://leptos.dev/) and [Dioxus](https://dioxuslabs.com/), for example, are two very well-developed web frameworks. Dioxus, which this blog is built with, is a fully-fledged cross-platform framework that can target web, desktop, and apps from a single codebase. Leptos is a very solid and, by now mature, web framework that has similar ergonomics to JS frameworks like Solid.js. We have built - and are in active development of - three major enterprise-grade web applications, both customer and internal facing, with Leptos and found very few teething issues. Instead, the API is stable and has supported everything we’ve wanted and needed to do, with good performance and good developer ergonomics.

In this blog, I’d like to explain how we ended up with Rust on the frontend and what our process was. But before jumping there, a little history. Switch2, around 4 years ago, was mainly using JavaScript (JS) isomorphically - Node.js on the backend and JS React on the frontend. We soon pivoted all new code to be written in TypeScript (TS). Compared to untyped JS, TS improved safety considerably, but we found it remained quite a poor language for domain modelling and creating performant software. We benchmarked Rust and TS on an AWS Lambda function and found the Rust equivalent to be quicker and use significantly less RAM, which gave us not only a performance increase on our backend processing but also a cost-reduction - as AWS Lambda is billed by compute time *and* memory usage. We soon found Rust also provided excellent support for domain modelling via its native support for sum-types and product-types, something which TS somewhat makes ergonomically difficult, and we decided to write all new backend software in Rust.

We then started to build out a couple of small, new applications using TS + Next.js and found one major point of friction around type-maintenance. The problem comes down to using two typed-languages across a serialization-boundary. On the backend we might have a type like,

```rust
struct AccountBalance {
  balance: Money,
}
```

which we want to send over a TCP connection, and so on the frontend we need to duplicate the type in some way. Since TypeScript doesn’t natively support newtype constructs due to its structural typing, the best we can do is a half-hearted attempt at duplicating it,

```typescript
interface AccountBalance {
  balance: number
}
```

Note that not only are we having to duplicate our types - and so increase maintenance effort - we are also losing information as we deserialize into a weaker and less expressive language.

Initially, in order to reduce the maintenance effort of having to duplicate types, we built a tool called `binding`, which translated Rust types into TS types via the [ts-rs](https://github.com/aleph-alpha/ts-rs) Rust library. This approach worked well in saving us from having to create matching TS types by hand, but still left us with duplicate type information in the codebase - and more importantly, left us dealing with a less expressive type-system on the frontend.

It was at this point we decided to investigate using Leptos for our web applications. At this point we had already started building a new web platform in TS/Next.js, and so decided to rewrite it into Leptos. The mechanical processing power of LLMs was a great advantage here as it translated Next.js concepts and syntax over to Leptos. Within around a day we had a fully-functioning feature-parity website. Obviously, the Leptos codebase had far fewer types as it could make use of the domain types in Rust. The only changes to those types that we needed were to make them `serde::Serialize` and `serde::Deserialize` so we could send them over a TCP connection. We considered this experiment to be a success and decided to do all future web-development in Rust.

In terms of web performance, we have trivially managed to score 100/100 on the Google Lighthouse score for the Leptos web applications and have found Rust-produced wasm to be more than fast enough for our use-cases. The worry with wasm DOM manipulations is that the wasm code incurs a small cost every manipulation. However, Leptos is a signal-based reactive model which leads to only very small islands of interactivity being modified in the DOM. The main issue, performance-wise, we had was around wasm bundle load sizes. We dramatically lowered load sizes by compressing and optimizing the wasm bundle. In any case, that Leptos performs well shouldn’t be a huge surprise given that Leptos [scores higher](https://krausest.github.io/js-framework-benchmark/current.html) than many JS frameworks like Vue and Reflex.

Additionally, we no longer have to write so much defensive code to protect against `null` or `undefined`, which is of course one of the pitfalls of JS/TS, and we can leverage the power of a more expressive type-system, thereby bringing our frontend code up to the same standards we hold our backend code in. Moreover, we’ve also found LLM models to be more than equipped to write Leptos code and we’ve not found the up-skilling journey for our engineers to be too difficult or onerous. The framework is familiar to anyone coming from a React background, as all of us were.

However, it hasn’t been completely smooth sailing as there have been a couple of gotchas that we’ve had to learn about; for example, in deeply nested views we’ve sometimes needed to use type-erasure to ensure the compiler doesn’t hit the recursion limit, similar to JS SSR-frameworks we’ve encountered hydration errors, and in order to lazy load routes we’ve had a couple of small issues with wasm-split in relation to hot-reloading and some caching behaviour.

In conclusion, this has been a very interesting and successful experiment. We’ve managed to reduce duplication at the type-level, provide a more consistent developer experience, and ensure the same type-level guarantees across frontend and backend - without any change to the user experience.
