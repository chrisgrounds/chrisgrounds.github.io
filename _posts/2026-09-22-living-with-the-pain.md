---
layout: post
title: Living with the Pain
date: 2026-09-14
published: false
tags: ["writing", "llms"]
---


```rust
async fn handler(
  (WithHttpAnalytics(_tracing), WithHttpPayload(maybe_payload)): (
    WithHttpAnalytics,
    WithHttpPayload<CreateAgentActionForPropertyRequest>,
  ),
  env: Env,
) -> sprelude_io::io::Result<Response<Body>> {
```


/// The `HandlerParam` trait allows us to do "type-driven dependency-injection"
/// for lack of a better phrase. The idea is that each type
/// that implements `HandlerParam` can be "run" in the `run_handler` function
/// allowing the user of the `run_lambda!` macros to simply specify
/// the data they want at the type-level in the type-signature
/// and have that data injected into their handler.
///
/// Because we also implement `HandlerParam` for various tuple types
/// the user can specify multiple parameters in any order
/// and `run_handler` will call `HandlerParam::fetch` on the tuples
/// unrolling them and injecting the requested dependencies
pub trait HandlerParam<E> {
  fn fetch(ctx: &Context<E>) -> Self
  where
    Self: Sized;
}

impl<T: DeserializeOwned + std::fmt::Debug + serde::Serialize> HandlerParam<LambdaEvent<SqsEvent>>
  for WithEbWrappedSqsPayload<T>
{
  fn fetch(ctx: &Context<LambdaEvent<SqsEvent>>) -> Self {
    Self(crate::sqs::convert_eb_wrapped_sqs_event_to::<T>(
      ctx.event.payload.clone(),
    ))
  }
}

impl<T: DeserializeOwned + std::fmt::Debug + serde::Serialize> HandlerParam<LambdaEvent<SqsEvent>>
  for WithFullSqsWrappedEbPayload<T>
{
  fn fetch(ctx: &Context<LambdaEvent<SqsEvent>>) -> Self {
    Self(crate::sqs::convert_eb_wrapped_full_sqs_event_to::<T>(
      ctx.event.payload.clone(),
    ))
  }
}

impl<T: DeserializeOwned + std::fmt::Debug> HandlerParam<LambdaEvent<SqsEvent>>
  for WithPollerSqsPayload<T>
{
  fn fetch(ctx: &Context<LambdaEvent<SqsEvent>>) -> Self {
    Self(crate::sqs::convert_poller_sqs_event_to::<T>(
      ctx.event.payload.clone(),
    ))
  }
}


pub async fn run_handler<E, P, F, Fut, T>(event: E, handler: F) -> crate::io::Result<T>
where
  P: HandlerParam<E>,
  F: Fn(P) -> Fut,
  Fut: Future<Output = crate::io::Result<T>>,
{
  handler(P::fetch(&Context { event })).await
}
