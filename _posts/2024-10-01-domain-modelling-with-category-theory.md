---
layout: post
title: "Domain Modelling with Category Theory"
date: 2024-10-01
published: true
tags: ["category theory", "domain modelling", "fp", "rust"]
---

Gandalf finds himself sitting at his computer one rainy Wednesday and in a moment of procrastination loads up his favourite online staff shop. He finds the latest newly released staff, that all his wizarding friends have been raving about, and loads the product page. His mouse tantalizingly hovers over the “add to basket” button until his impulsiveness gets the better of him and… he clicks.

Gandalf doesn’t need a new staff. His old one is more than up to the task, having helped defeat <spoiler>. And as fun as this story is you’re a software engineer, and you’d much rather know how to model this user journey than find out whether Gandalf went through and bought the new staff.

So how can we model this process and how can we use Category Theory to help?

In OO-land, we might create a Basket class along with an addItem(Item item) method. But we can think about this interaction differently. Rather than thinking about the user adding an item to a basket, we can think about the user adding a basket to a basket. Let’s forget about items for the minute, and just think about how this would work if we constrain ourselves to baskets?

To begin with, the user adds a basket containing something to an already existing basket. This already existing basket must be empty because it’s the first item to be added (so this first basket functions as a no-op). Then any additional items are additional baskets being added to the previous basket.

Another crucial feature of our basket model is that the order in which baskets are added together doesn’t matter. That is, if I add my wine_basket with my cheese_basket, and add that basket with my bread_basket, then that’s going to give me the same final basket as adding my cheese_basket with my bread_basket, and then adding that to my wine_basket. In the end I end up with wine, cheese, and bread. In other words, our baskets are associative.

(wine + cheese) + bread = wine + (cheese + bread)
In the language of category theory, our basket model forms a semigroup as we‘ve defined a binary associative operator on it, and it forms a monoid because additionally we’ve given it an identity value — the empty basket. Let’s call our binary associative operator “append” and we can see how we might think about semigroups and monoids pictorially.

A categorical image of semigroups and monoids, expressing the arrows with their relevant type-signature. You can read “::” as “has type”.
A common example of a semigroup is the positive natural numbers (1..) where the binary associative operator is addition, and an example of a monoid is the natural numbers (0..) where the identity value is 0. Naturally, 0 is the identity value as n + 0 = n. Incidentally, in OOP, we can think of the Builder pattern as a monoid. The initial Builder construction is the identity value, and withX methods are binary associative operations from Builder to Builder.

```rust
// identity value
new CarBuilder()
  // binary associative function withWheels
  // takes a CarBuilder and returns a CarBuilder
  .withHeadlights()
  .withEngine()
  .withWheels(4)
  .build();
```

In Rust, we can define two traits, Semigroup and Monoid, to represent these categorical concepts. Semigroup contains a binary function, which we’ve called sappend to differentiate it from the monoidal definition. Monoid contains mappend (essentially Semigroup’s sappend) and an mempty value to represent identity. We give the functions such strange names because append is generally used in languages for List-type structures (“sappend”: semigroup-append, and “mappend”: monoid-append), and we call the identity value mempty because it generally represents an empty variant of a type and id would either be confusing or reserved.

```rust
trait Semigroup {
    fn sappend(self, b: Self) -> Self;
}

trait Monoid: Semigroup {
    fn mempty() -> Self;
    fn mappend(self, b: Self) -> Self;
}
```

Let’s define our Basket type. And for the sake of brevity, we’ll just assume Bucket stores items in a Vector and we won’t care about the Item type itself.

```rust
struct Basket {
    items: Vec<Item>
}
```

With this, we can define how we add two Basket’s together,

```rust
impl Semigroup for Basket {
    fn sappend(self, b: Basket) -> Basket {
        Basket { items: self.items.into_iter().chain(b.items).collect() }
    }
}
```

And to define our Basket as a monoid, we can piggyback on our Semigroup definition and simply provide an identity value,

```rust
impl Monoid for Basket {
    fn mempty() -> Basket {
        Basket { items: vec![] }
    }
    
    fn mappend(self, b: Basket) -> Basket {
        self.sappend(b)
    }
}
With this in place we can construct our basket by first creating an empty basket and then adding additional baskets.

```rust
let basket1 = Basket { items: vec![Item("apple".to_string())] };
let basket2 = Basket { items: vec![Item("orange".to_string())] };

Basket::mempty()
  .mappend(basket1)
  .mappend(basket2);

// Result: Basket { items: [Item("apple"), Item("orange")] }
```

Now whenever the user clicks “add to basket”, we simply mappend another basket to the current basket.

Let’s extend the requirements here: suppose we want the user to be able to see a history of their basket and revert to a certain point. This is actually fairly simple with our monoidal structure.

But first, let’s consider our OO-Basket class. In order to go back in time we’d have to create a removeItem method, keep track of when addItem was called, with what, and with how much, and then call removeItem on any items that were added after a certain point. This would work, but it feels messy.

With the monoidal approach, all we need is to keep track of what Basket’s existed and when. Once the user selects a time to revert their basket to, the monoidal nature of the Basket type means we simply append all the previous versions together — and because of the associative nature of monoids, the order of application doesn’t matter. (And this works because fundamentally adding things to a basket is associative — the order of adding things doesn’t matter. You can try this out in a supermarket!)

So if we store our Baskets in a Vector or List type along with a timestamp (representing when they were created), we can fold over the Vec/List (itself a monoid) and rebuild our Basket to the desired point in time. To do this we filter our stored baskets to include only those before our desired time and then fold over the result, calling mappend on each iteration to build up our new Basket. The initial value is the identity value (Basket::mempty) so if there is nothing to fold over, we always have at least an empty Basket.

```rust
struct BasketHistory {
    saved_states: Vec<(SystemTime, Basket)>
}

impl BasketHistory {
    fn recover_to_time(&self, target_time: SystemTime) -> Basket {
        self.saved_states
            .iter()
            .filter(|(time, _)| time <= &target_time)
            .map(|(_, basket)| basket.clone())
            .fold(Basket::mempty(), |acc, basket| acc.mappend(basket))
    }
}
```

This suddenly feels very much like a lightweight version of event-sourcing, which we’re almost getting for free. The difference is we’re not explicitly creating events and we don’t care about processing sequentially. This all comes down to the fact our core computation is a binary associative operator, which gives us a branching structure. (Incidentally, this branching structure — think of how (1+(2+(3+4))+(4+(3+(2+1)))) is also branching — actually gives us thread-safe code that could be parallelized.)


It’s Baskets all the way down
Before going down too much of a rabbit-hole, let’s take stock. With just two concepts from category theory, we’ve been able to rigorously and iteratively model a very common process. We’ve done this just by thinking about how we compose base elements together in a way that respects relatively straightforward rules (namely, associativity and identity). This is just touching on the surface of what category theory has to offer us when it comes to domain modelling and building robust software. But for now, I think Gandalf would be happy knowing his Basket is a proper monoidal object.
