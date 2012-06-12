/*
 * Author: Oliver Steele
 * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
 * License: MIT License
 * Homepage: http://osteele.com/javascripts/sequentially
 * Version: 1.0preview2
 */


Function.K = function(x){return function(){return x}};

/// An `MVar` is an asynchronous channel that synchronizes
/// readers and writers.  `MVar` implements (most of) the
/// Haskell `MVar` interface, but using funargs instead of
/// the `IO` monad.
function MVar() {
    var value,
        readers = [],
        writers = [],
        takers = [];
    this.__proto__ = {
        // put if empty, else wait in line
        writer: function(writer) {
            value
                ? writers.push(writer)
                : put(writer());
            return this;
        },
        // apply `reader` to the value if full, else wait in line
        reader: function(reader) {
            value
                ? reader(value[0])
                : readers.push(reader);
            return this;
        },
        // take the value if full, else wait in line
        taker: function(taker) {
            if (!value)
                return takers.push(taker);
            var x = value[0];
            value = null;
            taker(x);
            runNextWriter();
            return this;
        },
        // put a value if empty, else wait in line with the writers
        put: put,
        // `put` and return true if empty, else return false
        tryPut: function(x) {
            value ? false : (put(x), true);
        },
        // return false if empty, else take the value and returns it
        // in a list
        tryTake: function() {
            var was = value;
            value = null;
            runNextWriter();
            return was;
        },
        modifier: function(modifier) {
            this.reader(function(value) {
                put(modifier(value));
            });
        },
        isEmpty: function() {return !value}
    }
    function put(x) {
        if (value)
            return writers.push(Function.K(x));
        while (readers.length)
            readers.shift().call(null, x);
        if (takers.length) {
            var taker = takers.shift();
            taker(x);
            runNextWriter();
        } else
            value = [x];
    }
    function runNextWriter() {
        if (!value && writers.length) {
            var writer = writers.shift();
            put(writer());
        }
    }
}
