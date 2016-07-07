'use strict'

var Pact = require('pact')
var Mocha = require('mocha')
var Test = require('mocha/lib/test')
var Suite = require('mocha/lib/suite')
var escapeRe = require('escape-string-regexp')
var wrapper = require('@pact-foundation/pact-node')
var Common = require('mocha/lib/interfaces/common')
var Promise = require('bluebird')

/**
 * BDD-style interface mixed with Pact:
 *
 *      describe('Array', function() {
 *        describe('#indexOf()', function() {
 *          it('should return -1 when not present', function() {
 *            // ...
 *          });
 *
 *          it('should return the index when present', function() {
 *            // ...
 *          });
 *        });
 *      });
 *
 *      Pact('Consumer', 'Provider', 'http://url', function() {
 *        add((interaction) => {
 *            interaction
 *              .given('a state')
 *              .uponReceiving('a request for...')
 *              .withRequest('METHOD', '/PATH', BODY, { 'HeaderName': 'HeaderValue' })
 *              .willRespondWith(STATUS, { 'HeaderName': 'HeaderValue' }, EXPECTED_BODY)
 *        });
 *
 *        verify('interaction', functionThatReturnsPromise, (result, done) => {
 *          expect(JSON.parse(result)).to.eql(EXPECTED_BODY)
 *          done()
 *        })
 *      });
 * @param {Suite} suite Root suite.
 */
module.exports = Mocha.interfaces['bdd'] = function (suite) {
  var suites = [suite]

  suite.on('pre-require', function (context, file, mocha) {
    var common = Common(suites, context)

    context.before = common.before
    context.after = common.after
    context.beforeEach = common.beforeEach
    context.afterEach = common.afterEach
    context.run = mocha.options.delay && common.runWithSuite(suite)

    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.describe = context.context = function (title, fn) {
      var suite = Suite.create(suites[0], title)
      suite.file = file
      suites.unshift(suite)
      fn.call(suite)
      suites.shift()
      return suite
    }

    /**
     * Pending describe.
     */

    context.xdescribe = context.xcontext = context.describe.skip = function (title, fn) {
      var suite = Suite.create(suites[0], title)
      suite.pending = true
      suites.unshift(suite)
      fn.call(suite)
      suites.shift()
    }

    /**
     * Top level function like describe above
     */

    context.PactConsumer = function (opts, fn) {
      var pactSuite = Suite.create(suites[0], opts.consumer + ' has pact with ' + opts.provider)
      pactSuite.file = file

      pactSuite.pactConsumer = opts.consumer
      pactSuite.pactProvider = opts.provider

      pactSuite.pact = Pact({ consumer: opts.consumer, provider: opts.provider, port: opts.providerPort })

      suites.unshift(pactSuite)
      fn.call(pactSuite, {})
      suites.shift()

      return pactSuite
    }

    context.PactProvider = function (opts, fn) {
      var pactSuite = Suite.create(suites[0], opts.consumer + ' has pact with ' + opts.provider)
      pactSuite.file = file

      pactSuite.pactConsumer = opts.consumer
      pactSuite.pactProvider = opts.provider

      suites.unshift(pactSuite)
      fn.call(pactSuite, {})
      suites.shift()

      return pactSuite
    }

    /**
     * Pending Pact.
     */

    context.xPact = context.xPactProvider = function (consumer, provider, fn) {
      var pactSuite = Suite.create(suites[0], consumer + ' has pact with ' + provider)
      pactSuite.pending = true
      suites.unshift(pactSuite)
      fn.call(pactSuite, {})
      suites.shift()
    }

    /**
     * Exclusive suite.
     */

    context.describe.only = function (title, fn) {
      var suite = context.describe(title, fn)
      mocha.grep(suite.fullTitle())
      return suite
    }

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    var it = context.it = context.specify = function (title, fn) {
      var suite = suites[0]
      if (suite.pending) {
        fn = null
      }
      var test = new Test(title, fn)
      test.file = file
      suite.addTest(test)
      return test
    }

    /**
     * Exclusive test-case.
     */

    context.it.only = function (title, fn) {
      var test = it(title, fn)
      var reString = '^' + escapeRe(test.fullTitle()) + '$'
      mocha.grep(new RegExp(reString))
      return test
    }

    context.addInteractions = function (interactions) {
      var pactSuite = suites[0]
      context.before(function (done) {
        var interactionsPromise = interactions.map(function (interaction) {
          return pactSuite.pact.addInteraction(interaction)
        })

        Promise.all(interactionsPromise).then(function () {
          done()
        })
      })
    }

    context.finalizePact = function () {
      var pactSuite = suites[0]
      context.after(function (done) {
        pactSuite.pact.finalize().then(function () {
          done()
        })
      })
    }

    /**
     * Verify works just like an it block but it starts the mock server
     * and runs the Pact verification promise chain.
     */

    context.verify = function (title, clientRequestFn, fn) {
      var pactSuite = suites[0]

      if (pactSuite.pending) {
        fn = null
      }

      var test = new Test(title, function (done) {
        clientRequestFn()
          .then(pactSuite.pact.verify)
          .then(function (data) {
            fn(data, done)
          })
          .catch(done)
      })

      test.file = file
      pactSuite.addTest(test)
      return test
    }

    context.honourPact = function (opts, fn) {
      var pactSuite = suites[0]

      if (pactSuite.pending) {
        fn = null
      }

      var test = new Test('should honour interactions', function (done) {
        wrapper.verifyPacts(opts)
          .then(function (data) {
            fn(data, done)
          })
          .catch(function (err) {
            done(err)
          })
      })

      test.file = file
      pactSuite.addTest(test)
      return test
    }

    /**
     * Pending verify.
     */

    context.xverify = context.verify.skip = function (title, fn) {
      context.verify(title)
    }

    /**
     * Pending test case.
     */

    context.xit = context.xspecify = context.it.skip = function (title) {
      context.it(title)
    }

    /**
     * Number of attempts to retry.
     */
    context.it.retries = function (n) {
      context.retries(n)
    }
  })
}
