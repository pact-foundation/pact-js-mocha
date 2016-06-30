# Pact Mocha Interface
[![Build Status](https://travis-ci.org/pact-foundation/pact-js-mocha.svg?branch=master)](https://travis-ci.org/pact-foundation/pact-js-mocha)
[![Code Climate](https://codeclimate.com/github/pact-foundation/pact-js-mocha/badges/gpa.svg)](https://codeclimate.com/github/pact-foundation/pact-js-mocha)
[![Issue Count](https://codeclimate.com/github/pact-foundation/pact-js-mocha/badges/issue_count.svg)](https://codeclimate.com/github/pact-foundation/pact-js-mocha)
[![Coverage Status](https://coveralls.io/repos/github/pact-foundation/pact-js-mocha/badge.svg?branch=master)](https://coveralls.io/github/pact-foundation/pact-js-mocha?branch=master)
[![npm](https://img.shields.io/github/license/pact-foundation/pact-js-mocha.svg?maxAge=2592000)](https://github.com/pact-foundation/pact-js-mocha/blob/master/LICENSE)

Implementation of a Mocha Interface to be used with [pact-js](https://github.com/pact-foundation/pact-js).

From the [Pact website](http://docs.pact.io/):

>The Pact family of frameworks provide support for [Consumer Driven Contracts](http://martinfowler.com/articles/consumerDrivenContracts.html) testing.

>A Contract is a collection of agreements between a client (Consumer) and an API (Provider) that describes the interactions that can take place between them.

>Consumer Driven Contracts is a pattern that drives the development of the Provider from its Consumers point of view.

>Pact is a testing tool that guarantees those Contracts are satisfied.

Read [Getting started with Pact](http://dius.com.au/2016/02/03/microservices-pact/) for more information on
how to get going.

## How to use it
This package is not yet published to [NPM](https://www.npmjs.com/) so you will need to install it manually by modifying your `package.json`.

#### Installation
It's easy, simply add the line below to your `devDependencies` group...
```
"pact-js-mocha": "pact-foundation/pact-js-mocha"
```
... then run `npm install` and you are good to go.

#### What does this interface does
This Mocha interface abstracts some aspects of the usage of the DSL to make your test a bit cleaner and not having to worry about learning the [Pact JS DSL](https://github.com/pact-foundation/pact-js).

We thought it was useful due to the fact that there is some boilerplate code needed to get the DSL up and going so abstracting all this made sense.

In a nutshell:
- Provides two top level `Pact()` and `PactProvider()` block that works like a `describe()` block but with extra init functionality for Pact
- Starts up a Pact Mock Server for you
- Does the verification for you sending back the response of the request for your own assertions
- Clean up all state and shuts down the mock servers created

#### Usage
The interface "extends" the [Mocha BDD](https://mochajs.org/#bdd) so all the original hooks still work as expected thus you don't have to mix and match your test runs.

Once the library is installed you have to tell Mocha to use it. To do that you can either create a `mocha.opts` file on your test folder and tell Mocha to use it, like this:

```
--require ./node_modules/pact-js-mocha/src/index.js
```

##### For Consumers only
You also have to tell Mocha to start the Pact Mock Server. The management of the Mock Server is up to you: you can either manage within the test file itself or as part of your test suite.

The example below shows how you can do the latter. To manage within your test suite have a look at [this integration test](https://github.com/pact-foundation/pact-js/blob/master/test/dsl/integration.spec.js) on the [Pact JS library](https://github.com/pact-foundation/pact-js) itself.

To do that create a new file inside your test folder named `specHelper.js` and add the below to it:

```javascript
var path = require('path')
var wrapper = require('@pact-foundation/pact-node')

// create mock server to listen on port 1234
var mockServer = wrapper.createServer({
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'mockserver-ui.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: 2
})

// start the mock server
mockServer.start().then(function () {
  // runs Mocha's test suite
  run()
})
```

Finally you need to also tell Mocha to require `specHelper.js` and delay the execution. Your final set of arguments will look like this:

```
--require ./node_modules/pact-js-mocha/src/index.js
--require ./test/specHelper.js
--delay
```

That's it. Then you can write your consumer test like below:
```javascript
var expect = require('chai').expect
var request = require('superagent')

var PactOpts = {
  consumer: 'PactUI',             // the name of your consumer
  provider: 'Projects Provider',  // the name of your Provider
  providerPort: 1234              // the port on which the provider runs
}

PactConsumer(PactOpts, function () {

  // this is wrapped in a beforeEach block
  // thus it runs before all your verify's
  addInteraction({
    state: 'i have a list of projects',
    uponReceiving: 'a request for projects',
    withRequest: {
      method: 'get',
      path: '/projects',
      headers: { 'Accept': 'application/json' }
    },
    willRespondWith: {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: { reply: 'hello' }
    }
  })

  function requestProjects () {
    return request.get('http://localhost:' + PactOpts.providerPort + '/projects').set({ 'Accept': 'application/json' })
  }

  // this is your 'it' block
  verify('a list of projects is returned', requestProjects, function (result, done) {
    expect(JSON.parse(result)).to.eql({ reply: 'hello' })
    done()
  })

  // this is wrapped in a after block
  // thus it runs after all your verify's
  // it writes the pact and clear all interactions
  finalizePact()

})
```
And your provider test will look like this (there's no need to tell Mocha about the Mock Server):

```javascript
var expect = require('chai').expect

PactProvider({consumer: 'Projects Consumer', provider: 'Projects Provider'}, function () {

  var pactOpts = {
    providerBaseUrl: 'http://my.provider.com',
    pactUrls: '/path/to/pact_file.json',
    providerStatesUrl: 'http://my.provider.com/providerStates',
    providerStatesSetupUrl: 'http://my.provider.com/setupProviderStates',
  }

  honourPact(pactOpts, function (result, done) {
    done()
  })

})
```
## Contact

* Twitter: [@pact_up](https://twitter.com/pact_up)
* Google users group: https://groups.google.com/forum/#!forum/pact-support
