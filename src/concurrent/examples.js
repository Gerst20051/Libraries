// ^ MVar

// An `MVar` is an asynchronous channel that synchronizes
// readers and writers.  `MVar` implements (most of) the
// Haskell `MVar` interface, but using funargs instead of
// the `IO` monad.

// multiple readers wait for a write:
var mv = new MVar();
mv.taker(outputter('mvar.take (before put) 1'));
mv.taker(outputter('mvar.take (before put) 2'));
mv.put(1);
mv.put(2);

// writes are queued for the next read:
var mv = new MVar();
mv.put(1);
mv.put(2);
mv.taker(outputter('mvar.take (after put) 1'));
mv.taker(outputter('mvar.take (after put) 2'));

// writers are also queued.  A writer isn't
// called until the MVar is empty.
var mv = new MVar();
mv.writer(function() {
    output('mvar.write 0');
    return 0;
});
mv.writer(function() {
    output('mvar.write 1');
    return 1;
});
mv.taker(outputter('mvar.taker 1'));
mv.taker(outputter('mvar.taker 2'));

// a reader receives the next value, but
// leaves it in place for the next taker
// (and other readers)
var mv = new MVar();
mv.reader(outputter('mvar.reader 1'));
mv.reader(outputter('mvar.reader 2'));
mv.taker(outputter('mvar.taker'));
mv.put(1);

// a modifier is a combined taker/writer
var mv = new MVar();
mv.taker(output);
mv.modifier(function(x) {return x+1})
mv.put(1);

// ^ Usage

// Use an mvar to wait for the result of a periodic asynchronous process.
// This uses the `sequentially` library to run a worker, but you could
// use `window.setTimeout`, wait for an Ajax result, or a user event.
var mv = new MVar();
mv.taker(output);
var accumulator = 1;
(function() {
    accumulator *= 2;
    if (accumulator > 1000) {
        mv.put(accumulator);
        return Sequentially.stop;
    }
}).periodically(100);

// Two functions are waiting for the same result.  Since these are readers
// (not takers), another reader that registers for the same variable after
// it's been put will receive the same value.  The last line schedules
// a function to listen after a second.
var mv = new MVar();
mv.reader(outputter('a'));
mv.reader(outputter('b'));
(function() {mv.put(1)}).eventually();
mv.reader.bind(mv, outputter('c')).eventually(2000);

// Notice the next time the mouse moves.
var mv = new MVar();
mv.reader(outputter('mouse moved'));
function f() {mv.put(1)}
$(window).mousemove(f);

// Two functions that are waiting on the result of an AJAX call.  The
// AJAX request is made only once.
var mv = new MVar();
mv.reader(function(text){output('received',
                                text.slice(0,10)+'...')});
mv.reader(function(text){output(text.length, 'bytes received')});
$.ajax({url:'examples.js',
        method:'GET',
        success:mv.put.bind(mv)});
