"use strict"

test("forasync end promise", function() {
 let result = forasync([], function() { })
 if(typeof(result.then) != "function" || typeof(result.catch) != "function") {
  throw("result should be a promise but is " + result)
} })

test("forasync sync iterable", function(pass, fail) {
 let result1 = []
 forasync([ 0, 1, 2 ], function(result2) {
  result1.push(result2)
 }).then(function() {
  if(JSON.stringify(result1) == "[0,1,2]") {
   pass()
  } else {
   fail("result should be [ 0, 1, 2 ] but is " + result1)
} }) })

test("forasync async iterable", function(pass, fail) {
 let result1 = []
 let result2 = asyncgen(function*() {
  yield(0)
  yield(1)
  yield(2)
 })
 forasync(result2(), function(result3) {
  result1.push(result3)
 }).then(function() {
  if(JSON.stringify(result1) == "[0,1,2]") {
   pass()
  } else {
   fail("result should be [ 0, 1, 2 ] but is "+ result1)
} }) })

test("forasync current iteration parameter", function(pass, fail) {
 let result1 = []
 forasync([ 0, 1, 2 ], function(result2, stop, current) {
  result1.push(current)
 }).then(function() {
  if(JSON.stringify(result1) == "[1,2,3]") {
   pass()
  } else {
   fail("result should be [ 1, 2, 3 ] but is " + result1)
} }) })

test("forasync original reference parameter", function(pass, fail) {
 let result1 = [ 1, 2, 3 ], result2 = []
 forasync(result1, function(result3, stop, current, original) {
  result2.push(original)
 }).then(function() {
  if(result2[0] == result1 && result2[1] == result1) {
   pass()
  } else {
   fail("result should be [ [ 1, 2, 3 ], [ 1, 2, 3 ], [ 1, 2, 3 ] ] but is " + result2)
} }) })

test("forasync stopping iteration", function(pass, fail) {
 let result1 = []
 forasync([ 0, 1, 2, 3, 4 ], function(result2, stop) {
  if(result2 == 2) {
   let result3 = stop("value")
   if(result3 != "value") {
    fail("stop should return 'value' but returns " + result3)
  } }
  result1.push(result2)
 }).then(function() {
  if(JSON.stringify(result1) == "[0,1,2]") {
   pass()
  } else {
   fail("result should be [ 0, 1, 2 ] but is " + result1)
} }) })

test("forasync returned results promise", function(pass, fail) {
 forasync([ 0, 1, 2 ], function(result1) {
  return(result1 + 2)
 }).then(function(result2) {
  if(JSON.stringify(result2) == "[2,3,4]") {
   pass()
  } else {
   fail("result should be [ 2, 3, 4 ] but is " + result2)
} }) })

test("forasync callback sync error", function(pass, fail) {
 forasync([ 0, 1, 2 ], function() {
  throw("value")
 }).then(function(result) {
  fail("should reject but resolves with " + result)
 }).catch(function(error) {
  if(error == "value") {
   pass()
  } else {
   fail('error should be "value" but is ' + error)
} }) })

test("forasync callback async error", function(pass, fail) {
 forasync([ 0, 1, 2 ], function() {
  return(Promise.resolve().then(function() {
   return(Promise.reject("value"))
  }))
 }).then(function(result) {
  fail("should reject but resolves with " + result)
 }).catch(function(error) {
  if(error == "value") {
   pass()
  } else {
   fail('error should be "value" but is ' + error)
} }) })


test("asyncgen toString method", function() {
 let result1 = asyncgen(function*() { })
 let result2 = result1.toString()
 if(result2 != "async function* () { }") {
  throw('should return "async function* () { }" but returns ' + result2)
} })

test("asyncgen returns iterator", function() {
 let result1 = asyncgen(function*() { })
 let result2 = result1()
 if(typeof(result2.next) != "function") {
  throw('should return an iterator but returns ' + result2)
} })

test("asyncgen this value", function(pass, fail) {
 let result = asyncgen(function*() {
  if(this == "value") {
   pass()
  } else {
   fail('should be "value" but is ' + this)
 } })
 result.call("value").next()
})

test("asyncgen arguments", function(pass, fail) {
 let result = asyncgen(function*(value1, value2) {
  if(value1 == "value1" && value2 == "value2") {
   pass()
  } else {
   fail('should be "value1" and "value2" but is ' + [ value1, value2 ])
 } })
 result("value1", "value2").next()
})

test("asyncgen returning values ends iteration", function(pass, fail) {
 let result1 = asyncgen(function*() {
  return("value")
 })
 result1().next().then(function(result2) {
  if(result2.done && result2.value == "value") {
   pass()
  } else {
   fail('result should be { done: true, value: "value" } but is ' + result2)
} }) })

test("asyncgen throwing errors ends iteration", function(pass, fail) {
 let result = asyncgen(function*() {
  throw("value")
 })
 result().next().then(function(result) {
  fail('should reject but resolved with ' + result)
 }).catch(function(error) {
  if(error == "value") {
   pass()
  } else {
   fail('error should be "value" but is ' + error)
} }) })

test("asyncgen yield awaits promise", function(pass, fail) {
 let result1 = asyncgen(function*() {
  let result2 = yield(Promise.resolve("value"))
  if(result2 == "value") {
   pass()
  } else {
   fail('result should be "value" but is ' + result2)
 } })
 result1().next()
})

test("asyncgen yield passes values", function(pass, fail) {
 let result1 = asyncgen(function*() {
  let result2 = yield("value")
 })
 result1().next().then(function(result3) {
  if(result3.value == "value") {
   pass()
  } else {
   fail('result should be "value" but is' + result3.value)
} }) })

test("asyncgen multiple yield awaits", function(pass, fail) {
 let result1 = asyncgen(function*() {
  let result2 = yield(Promise.resolve("value1"))
  let result3 = yield(Promise.resolve("value2"))
  if(result2 == "value1" && result3 == "value2") {
   pass()
  } else {
   fail('results should be "value1" and "value2" but are ' + [ result2, result3 ])
 } })
 result1().next()
})

test("asyncgen multiple yield results", function(pass, fail) {
 let result1 = asyncgen(function*() {
  let result2 = yield("value1")
  let result3 = yield("value2")
  if(result2 == "value1" && result3 == "value2") {
   pass()
  } else {
   fail('results should be "value1" and "value2" but are ' + [ result2, result3 ])
 } })
 let result2 = result1()
 result2.next().then(function(result3) {
  return(result2.next(result3.value))
 }).then(function(result4) {
  return(result2.next(result4.value))
}) })

test("asyncgen yield result, await, and throw", function(pass, fail) {
 let result1 = asyncgen(function*() {
  let result2 = yield(Promise.resolve("value"))
  let result3 = yield(result2)
  throw(result3)
 })
 let result4 = result1()
 result4.next().then(function(result5) {
  return(result4.next(result5.value))
 }).then(function(result6) {
  fail('should reject but resolved with ' + result6)
 }).catch(function(error) {
  if(error == "value") {
   pass()
  } else {
   fail('error should be "value" but is ' + error)
} }) })

test("asyncgen try and catch", function(pass, fail) {
 let result1 = asyncgen(function*() {
  try {
   let result2 = yield(Promise.reject("value"))
   fail('should reject but resolved with ' + result2)
  } catch(error) {
   if(error == "value") {
    pass()
   } else {
    fail('error should be "value" but is ' + error)
 } } })
 let result2 = result1()
 result2.next().then(result2.next)
})

test("asyncgen nested yield", function(pass, fail) {
 let result1 = asyncgen(function*() {
  yield(yield(Promise.resolve("value")))
 })
 result1().next().then(function(result2) {
  if(result2.value == "value") {
   pass()
  } else {
   fail('result should be "value" but is ' + result2.value)
} }) })

test("asyncgen external throw", function(pass, fail) {
 let result1 = asyncgen(function*() {
  let result2 = yield("value")
  fail("should throw but returns with " + result2)
 })
 let result3 = result1()
 result3.next().then(function(result4) {
  return(result3.throw(result4.value))
 }).then(function(result5) {
  fail("should reject but resolve with " + result5)
 }).catch(function(error) {
  if(error == "value") {
   pass()
  } else {
   fail('error should be "value" but is ' + error)
} }) })

test("asyncgen external return", function(pass, fail) {
 let result2 = asyncgen(function*() {
  try {
   let result3 = yield("value1")
   fail("should return early but continues with " + result3)
  } finally {
   return("value2")
 } })
 let result4 = result2()
 result4.next().then(function(result5) {
  return(result4.return(result5.value))
 }).then(function(result6) {
  if(result6.value == "value2") {
   pass()
  } else {
   fail('result should be "value2" but is ' + result6.value)
} }) })