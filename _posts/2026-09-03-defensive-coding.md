---
layout: post
title: "The Code Smell of LLM Defensive Coding"
date: 2026-09-03
published: true
tags: ["rust", "types"]
---

LLMs are renowned for writing defensive code. And often that defensive code is genuinely pointless, but there is a lot of it that, in my view, is a sign your types are not constraining enough. For example, suppose we want to store a 1-10 grade value on a student type, which is updatable. Asking GPT it created the following,

```rust
struct Student {
  grade: u8,
}

fn update_grade(student: &mut Student, new_grade: u8) -> Result<(), String> {
  if !(1..=10).contains(&new_grade) {
    return Err("Grade must be between 1 and 10".to_string());
  }

  student.grade = new_grade;
  Ok(())
}
```

Taken in isolation this is fairly sensible code, but the invariant of *between-1-and-10* is only enforced in the `update` function, so nowhere else in the code would know about it, and the defensive guard makes the function fallible - although nicely in Rust we turn that failure into a value in its own right rather than throw an exception. Nonetheless, defensive code takes what should be straight-forward code we can reason about and complicates it. And of course the annoying aspect of LLM-written defensive code is that it's often ubiqutous, where most functions across the codebase end up with some form of defensive code. Overall, it leads to far too much code being written and I think is an aspect of why LLMs write so much code overall.

So how do we do better? I think the core problem here is that the type is wrong. We're encoding the student's grade with 256 possible values in the `u8`. But we don't actually want 256 values, which is why the LLM has attempted to guard against the other 246 values we don't want. It's correctly trying to enforce our invariant because our types don't express it. 

There are a couple of different approaches we could take to fix that. The first is simply specify our possible values in a sum-type,

```rust
enum Grade {
  One,
  Two,
  ...,
  Ten,
}

fn update_grade(student: &mut Student, new_grade: Grade) {
  student.grade = new_grade;
}
```

Now there is no possible way we can accidentally give the student a grade of 200 because it doesn't exist as an option. There's just no defensive code to write.

The second option is to wrap the `u8` in a newtype smart-constructor,

```rust
struct Grade(u8);
struct OutOfBounds;

impl Grade {
  fn try_new(grade: u8) -> Result<Self, OutOfBounds> {
    if !(1..=10).contains(&new_grade) {
      return Err(OutOfBounds));
    }

    Ok(Self(grade))
  }
}
```

This forces our invariant into the constructor on the newtype and gives us a custom error value to clearly indicate what has gone wrong. With this knowledge an LLM would be more likely to resist the implementation of so much defensive code.

All in all, I think LLM-written defensive code is often a symptom of under-constrained types. We can do a better job and achieve better outcomes from LLM-written code by constraining our types to make sure we're encoding what we actually care about.
