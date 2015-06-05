'use strict';


var zeroTimeout = require('../../lib/util/zero_timeout')
    , assert = require('assert');


describe.only('util.zeroTimeout', function() {
    it('should schedule a delayed execution', function (done) {
        var executed;
        function execute() { executed = true; }
        zeroTimeout(execute);
        setTimeout(function() {
            assert(executed);
            done();
        }, 10)
    });


    it('should schedule multiple delayed executions', function (done) {
        var executed1, executed2;
        function execute1() { executed1 = true; }
        function execute2() { executed2 = true; }
        zeroTimeout(execute1);
        zeroTimeout(execute2);
        setTimeout(function() {
            assert(executed1);
            assert(executed2);
            done();
        }, 10)
    });


    it('should clear delayed executions', function (done) {
        var executed1, executed2;
        function execute1() { executed1 = true; }
        function execute2() { executed2 = true; }
        var id = zeroTimeout(execute1);
        zeroTimeout(execute2);
        zeroTimeout.clear(id)
        setTimeout(function() {
            assert(!executed1);
            assert(executed2);
            done();
        }, 10)
    });
});