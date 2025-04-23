# The Structure and Content of Computer Programs

Software is made up of data and operations on that data. Data is made up of structure like a list of things and content like someone's name. Let's denote content with lowercase letters like `a`, `b`, etc, and let's denote structure by wrapping content in a set of brackets `[]`. So for example, a list of strings would be denoted as [a]. Finally, operations on data are functions and we will denote a function as an arrow `->`, such that `a -> b` is a function which takes an `a` and returns a `b`. 

Let's look at how we can combine these three objects.

## Structure and content, `[a]` and `a`

The first way is to simple have content, or a value. For example, if we just have a username, email, or an age then we have pure content/value. This is not particularly interesting and every language can express this.

The second is to have structure with some content inside. This is somewhat more interesting as structure can represent various things. Maybe our structure represents a Future, some nondeterministic computation, or simply a list of things.

## Functions

Next we have functions and there are 4 possible ways of combining a function with structure and content:

- a -> a
- a -> [a]
- [a] -> a
- [a] -> [a]

## Structure and functions

For any given structure we can apply one of the above functions to it. 

### Structure and Content-Preserving, [a] -> [a]

The most obvious way of doing this is a function which takes structure and returns structure. 




structure-preserving
content-preserving
