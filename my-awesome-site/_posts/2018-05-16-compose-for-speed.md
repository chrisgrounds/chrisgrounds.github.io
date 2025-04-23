---
layout: post
title: "Compose for Speed"
date: 2018-05-16
published: true
tags: ["fp", "javascript"]
---

A common functional pattern, for lack of a better word, is to compose various functions together. This is often seen as an elegant way of combining multiple operations on a single data structure. But another advantage of composition is that it allows us to write faster, more efficient code.

We’ll look briefly what composition is, some properties of map, and then consider some (contrived) examples in JavaScript along with their performances.

## Composition: What it is

Very simply, composition is an operation that takes a function from a to b, and a function from b to c, and returns a function from a to c.

The arrows are functions, f and g, and the circles are types. Here composition allows us to construct a new arrow starting at the first circle, a, ending at the last circle, c. What’s interesting here is that we don’t care about the arrows, nor do we care about the circles — so long as the end of one arrow matches with the beginning of another, we can compose the arrows.

## Chaining maps in JavaScript

For the sake of argument, suppose we have an array with 100,000 numbers in it, called nums. And suppose we are interested in performing some elementary operations over each element in the array.

```javascript
const double = num => num * 2;
const triple = num => num * 3;
const quad = num => num * 4;
const exp = num => num * num;
```

One way we might apply these functions to each element of the array would be to chain a series of maps together,

```javascript
nums
 .map(double)
 .map(triple)
 .map(quad)
 .map(exp);
```

This maps double over nums, creating a new array, to which we map triple over, creating a new array, to which we map quad over… and so on. What’s important to notice here is that we are performing four mapping operations, which means we are building up three intermediate representations before returning our fourth array.

## An Important Property of map

Now, this is not ideal since the total number of maps, or passes over the array, is determined by the number of operations we want to perform, or O(n). A better solution would be one in which the number of passes over the array is just 1, or O(1). This can be achieved with function composition.

To see how we can achieve this with composition, consider the follow property of map:

```javascript
map f . map g = map (f . g)
```

The dot (.) here is the composition operator, and f and g are functions. In English, this says,

if you map f after mapping g, then that is the same as mapping a function which applies f after g.
In other words, a composition of maps is equal to a map of compositions. Therefore, map is distributive over function composition. This is easy to verify (and a more rigorous proof of this can be found in Graham Hutton’s Fold paper).

```javascript
Ex 1. (map (+10) . map (*2)) [1, 2, 3]
[12, 14, 16]
Ex 2. map ((+10) . (*2)) [1, 2, 3]
[12, 14, 16]
(map (+10) . map (*2)) [1, 2, 3] == map ((+10) . (*2)) [1, 2, 3]
True
```

Or the equivalent code in JavaScript, assuming we have a compose function,

```javascript
Ex 1. [1, 2, 3].map(n => n * 2).map(n => n + 10)
[12, 14, 16]
Ex 2. [1, 2, 3].map(compose(n => n + 10, n => n * 2))
[12, 14, 16]
```

Despite returning the same values, the difference between Ex 1 and Ex 2 is the evaluation: the first example involves two passes (maps) over the array (once for the function (*2) and once for the function (+10)) — causing an intermediate representation to be created — whereas the second involves only one pass over the array —creating no intermediate representation.

## Performance in JavaScript: Some Examples

So it follows that if we are able to compose our functions, we then can get away with performing only one map, which should be faster than multiple maps. In fact, this is something that the Haskell GHC compiler does as an optimisation, known as fusion. Of course, we do not have that luxury in JavaScript, therefore we will have to handcode the optimisation ourselves.

What happens in JavaScript in practice? In the following examples, we will use the compose function from the underscore library, along with the console.time and console.timeEnd functions to record time taken. We will compare what happens when you map a composed function with a series of chained maps.

In a file add the following (you’ll need to have installed underscore),

```javascript
const compose = require(‘underscore’).compose;
let nums = [];
for (let i = 0; i < 100000; i++)
 nums.push(i);
const double = num => num * 2;
const triple = num => num * 3;
const quad = num => num * 4;
const exp = num => num * num;
const composedFunction = compose(double, triple, quad, exp);
console.time("composed function");
nums.map(composedFunction);
console.timeEnd("composed function");
console.time("uncomposed function");
nums
 .map(double)
 .map(triple)
 .map(quad)
 .map(exp);
console.timeEnd("uncomposed function");
```

The output of this (with a 2.9GHz i7 processor, using node 8), averaged over 10 runs[1]:

```bash
$ node numberstest.js
composed function: 37.54ms
uncomposed function: 103.93ms
```

That is, the version involving function composition is almost 3 times faster in this specific case. What about if we start mapping over arrays of objects? In another file add,

```javascript
const compose = require(‘underscore’).compose;
const doubleO = obj => ({ key: obj.key * 2 });
const tripleO = obj => ({ key: obj.key * 3 });
const quadO = obj => ({ key: obj.key * 4 });
const expO = obj => ({ key: obj.key * obj.key });
let os = [];
for (let i = 0; i < 100000; i++)
    os.push({key: i})
const composedFunctionO = compose(doubleO, tripleO, quadO, expO);
console.time('composed function over objects');
os.map(composedFunctionO);
console.timeEnd('composed function over objects');
console.time('uncomposed function over objects');
os
 .map(doubleO)
 .map(tripleO)
 .map(quadO)
 .map(expO);
console.timeEnd('uncomposed function over objects');
```

The output of this, averaged over 10 runs[2]:

```bash
$ node objecttest.js
composed function over objects: 83.47ms
uncomposed function over objects: 176.50ms
```

Again, composition wins by quite the mile. As a final example, consider the identity function,

```javascript
const id = x => x;
```

This is probably one of the simplest functions writable — take an input and give it straight back without modification. Let’s look at what happens when we apply id to our array 10 times, just to be absurd.

```javascript
const compose = require('underscore').compose;
const id = obj => obj;
let os = [];
for (let i = 0; i < 100000; i++)
    os.push({key: i})
const composedFunction = compose(id, id, id, id, id, id, id, id, id, id);
console.time('composed function of id');
const r = os.map(composedFunction);
console.timeEnd('composed function of id');
console.time('uncomposed function of id');
os
 .map(id)
 .map(id)
 .map(id)
 .map(id)
 .map(id)
 .map(id)
 .map(id)
 .map(id)
 .map(id)
 .map(id);
console.timeEnd('uncomposed function of id');
```

The output of this, averaged over 10 runs[3]:

```bash
$ node idtest.js
composed function of id: 40.57ms
uncomposed function of id: 261.12ms
```

Again, composition is vastly faster, here around 6 times faster.

Now for the caveats. These examples are simple and really don’t reflect what programmers do in their day to day work. Moreover, the data structures we have used are relatively large and simple. However, the simplicity in the code will hopefully help to demonstrate the point — composition does not create intermediate representations, allowing a single map to be used, meaning faster code.

In itself that is an interesting result, but what makes this all the more significant is the fact that we arrived at this result purely by considering the abstract properties of our code. Namely, that map is distributive over function composition — i.e. map f . map g = map (f . g). We did not start with the code examples; instead, the code examples came out of these known mathematical properties.

## Appendix

[1] Raw results for mapping over array of numbers:

```bash
composed function: 36.411ms
uncomposed function: 101.838ms
composed function: 40.195ms
uncomposed function: 105.363ms
composed function: 39.725ms
uncomposed function: 109.773ms
composed function: 34.599ms
uncomposed function: 102.457ms
composed function: 38.232ms
uncomposed function: 107.059ms
composed function: 39.724ms
uncomposed function: 99.361ms
composed function: 36.200ms
uncomposed function: 103.650ms
composed function: 34.055ms
uncomposed function: 102.804ms
composed function: 35.248ms
uncomposed function: 100.624ms
composed function: 41.013ms
uncomposed function: 106.361ms
```

[2] Raw results for mapping over array of simple objects:

```bash
composed function over objects: 81.930ms
uncomposed function over objects: 183.875ms
composed function over objects: 82.504ms
uncomposed function over objects: 181.905ms
composed function over objects: 83.793ms
uncomposed function over objects: 182.160ms
composed function over objects: 84.268ms
uncomposed function over objects: 163.915ms
composed function over objects: 83.933ms
uncomposed function over objects: 179.896ms
composed function over objects: 83.308ms
uncomposed function over objects: 182.458ms
composed function over objects: 82.534ms
uncomposed function over objects: 181.936ms
composed function over objects: 82.354ms
uncomposed function over objects: 180.052ms
composed function over objects: 84.272ms
uncomposed function over objects: 165.253ms
composed function over objects: 85.831ms
uncomposed function over objects: 163.557ms
```

[3] Raw results for mapping id over array of simple objects:

```bash
composed function of id: 44.540ms
uncomposed function of id: 278.322ms
composed function of id: 40.849ms
uncomposed function of id: 280.103ms
composed function of id: 39.567ms
uncomposed function of id: 250.024ms
composed function of id: 40.501ms
uncomposed function of id: 258.685ms
composed function of id: 39.398ms
uncomposed function of id: 254.510ms
composed function of id: 40.280ms
uncomposed function of id: 266.085ms
composed function of id: 39.970ms
uncomposed function of id: 255.288ms
composed function of id: 40.891ms
uncomposed function of id: 252.170ms
composed function of id: 39.483ms
uncomposed function of id: 262.167ms
composed function of id: 40.250ms
uncomposed function of id: 253.815ms
```
