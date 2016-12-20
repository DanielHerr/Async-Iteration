# Async-Iteration
Asynchronous Generators, Iterators, and Iteration Function

Polyfill for async generators and iterators, with yield functioning as await when called on promises, and forasync() replacing forawait of.

Usage:

```
var test = asyncgen(function*() {
 yield(Promise.resolve())
 yield(2)
 yield(4)
 yield(6)
})

var asynciterator = test()
asynciterator.next().then(function({ done, value }) {
 console.log(done, value) // false, 2
})

forasync(test(), async function(value, stop, iteration = 1, original) {
 console.log(value, iteration) // 2, 1 // 4, 2
 if(value == 4 && iteration == 2) {
  return(stop(value))
} }).then(function(results = []) {
 console.log(results) // [ undefined, 4 ]
})
```

<a href="https://danielherr.github.io/Async-Iteration/tests.html">Run Tests</a>
