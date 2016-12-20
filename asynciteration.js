"use strict"

function forasync(iterable, callback) {
 let iterator
 if(typeof(iterable[Symbol.asyncIterator]) == "function") {
  iterator = iterable[Symbol.asyncIterator]()
 } else if(typeof(iterable[Symbol.iterator]) == "function") {
  iterator = iterable[Symbol.iterator]()
 } else {
  throw(TypeError("(value)[Symbol.asyncIterator] is not a function"))
 }
 let results = [], stopped = false
 function proceed() {
  return(Promise.resolve(iterator.next()).then(function({ done, value }) {
   if(done || stopped) {
    return(results)
   } else {
    function stop(value) {
     stopped = true
     if(typeof(iterator.return) == "function") {
      iterator.return()
     }
     return(value)
    }
    return(Promise.resolve(callback(value, stop, results.length + 1, iterable)).then(function(result) {
     results.push(result)
     return(proceed())
 })) } })) }
 return(proceed())
}

function asyncgen(generator) {
 let orginalsource = generator.toString.bind(generator)
 let asyncgenerator = new Proxy(generator, {
  apply(target, that, inputs) {
   let iterator = Reflect.apply(target, that, inputs)
   function proceed(action = "next" || "throw" || "return", input) {
    try {
     let { done, value } = iterator[action](input)
     if(value && typeof(value.then) == "function") {
      return(value.then(function(result) {
       return(proceed("next", result))
      }).catch(function(error) {
       return(proceed("throw", error))
      }))
     } else {
      return(Promise.resolve({ done, value }))
     }
    } catch(error) {
     return(Promise.reject(error))
   } }
   return({
    next(value) {
     return(proceed("next", value))
    },
    return(value) {
     return(proceed("return", value))
    },
    throw(value) {
     return(proceed("throw", value))
    },
    [Symbol.asyncIterator]() {
     return(this)
    },
    [Symbol.toStringTag]: "AsyncGenerator"
 }) } })
 asyncgenerator.toString = function() {
  return(orginalsource().replace("function*", "async function*"))
 }
 return(asyncgenerator)
}

if(Symbol.asyncIterator == null) {
 Symbol.asyncIterator = Symbol("Symbol.asyncIterator")
}