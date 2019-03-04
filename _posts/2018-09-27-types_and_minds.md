---
title: TDD + TDD = TTDD
date: 27 Sep 2018
published: true
---

<p>Various philosophers (see Chomsky, Fodor, McGinn) have expressed the view that science and human knowledge are limited because human minds/brains are limited. There will just always be things that we cannot know because of the species we are. This view has received some criticism, notably from the philosopher Daniel Dennett. Recapping the logic if this position, Dennett says:</p>

<blockquote><p>"our brains are just finite brains; just as the fish cannot understand democracy and the dog cannot understand quantum mechanics so there must be all these realms that we cannot understand because afterall we're just mammals with mammalian brains."</p></blockquote>

<p>Dennett goes on to express why he does not like this argument, referring to it as "the bad pseudobiological argument for the limits of science."</p>

<blockquote><p>“So what's wrong with that argument... is that the dog, the fish, the monkey, they cannot even understand the questions. We got language; we can understand the questions. What makes you think that there are questions that we can understand that the answers to which are not available at any cost, at any price?"[1]</p></blockquote>

<p>In my view, Dennett's argument really makes a question-begging assumption, which is that because we have language we can undestand the entirety of the domain of possible questions. Yes, we can understand  questions about democracy and quantum mechanics, but the very fact is that if there were questions that we could not understand, then <em>ipso facto</em> we would not know about them! They would not be accessible to us&mdash;and because of this, we would not know that we did not know about them. This assumption totally unravels Dennett's argument.</p>

<p>But I would also like to approach this from a programming perspective, in terms of typeclasses and how different typeclasses limit and expand the range of possible options.</p> 

<p>Consider the type signature of a function that takes an element and returns that same element:</p>

```
f :: a → a
```

<p>This parametric type signature says that the function takes something, it does not matter what it is, from the set of those things, and returns something from that set. This is really just to say that this function takes <em>anything</em> and returns <em>anything</em>. What can we do with such a function? Not much. For this function to work, it cannot do anything. For example, suppose f is given the integer 10, and that f multiples this input by 20. Of course, the result would be 200, but this would error if the input was a list&mdash;you cannot multiply a list by 20. Therefore, this function cannot multiply its inputs by 20.</p>

<p>In fact, we are left in the situation where f does virtually nothing. We can make f more useful by <em>constraining</em> its input&mdash;also known as providing an ad hoc polymorphism for the function. What this means is to say that instead of allowing literally anything as input and output, we constrain the input and output to be of a certain (delimited) type. For example,</p>

```
f' :: Num a => a → a
```

<p>Here we are saying that f takes any a from the set of Nums. In Haskell’s terms, f accepts anything that is an instance of the Num typeclass. The Num typeclass is a class that has certain operations defined for it, such as addition, subtraction, multiplication, etc. Now, passing a list into f is not allowed as lists do not support those operations.</p>

<p>In this way we have reduced what f' knows, so to speak&mdash;that is, the domain that f' operates over – but in doing so we have increased what f' can do. Another example of this comes from the following:</p>

```
f'' :: Semigroup a => a → a
```

<p>That is, f takes something that is a semigroup&mdash;basically, anything that has a binary, associative operation defined for it (the set of integers under addition form a semigroup for instance, as addition is binary and associative). This means that f’’ cannot divide things, for example, and thus is weaker than f’. This is because division is not associative. Again, however, we see that the domain of f’’ is larger than f’, because a list can be a semigroup. The moral is that f’’ is less constrained than f’, but we can do less with it.</p>

<p>Again, if we constrain f’’, like we did with f, then we can do more. </p>

```
f''' :: Monoid a => a → a
```

<p>A monoid is a semigroup that has an identity value. Fewer things satisfy this constraint (addition with an identity value of 5 does not work here because 5 is not a valid identity value), yet we gain more operations: namely the operation called <em>mconcat</em>, which takes a list of a-things and reduces them to a single value.</p>

<p>So to recap, we have seen that if we move from the taking anything as input to only taking Nums, we lose the ability to work with everything that is not a Num but we gain the ability to do many more things. Likewise, if we move from semigroups to monoids, we lose the ability to work with integers <em>tort court</em> and instead have to work with integers and some valid identity value, yet we gain more power from enhanced operations.</p>

<p>The lesson to draw from this is, perhaps, that we should expect there to be limits to what we can know, understand, and reason about. This comes from the fact that if we can know everything, then there is very little we can do. Human science is limited because human minds are limited. A different mind may yield a different science, just as different typeclasses yield different functions.</p>

#### References
* https://www.youtube.com/watch?v=zc-AX4C7KRg</li>
