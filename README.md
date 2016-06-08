# Pact Mocha Interface
Mocha Interface for Pact

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
"pact": "pact-foundation/pact-js-mocha"
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
The interface "extends" the [Mocha BDD](https://mochajs.org/#bdd) so all hooks original methods still work as expected thus you don't have to mix and match your test runs.

Once the library is installed you have to tell Mocha to use it. To do that you can either create a `mocha.opts` file on your test folder and tell Mocha to use it, like this:

```
--require ./node_modules/pact-js-mocha/src/index.js
```

That's it. Then you can write your consumer test like below:
```javascript
var expect = require('chai').expect
var request = require('superagent-bluebird-promise')

var PROVIDER_URL = 'http://localhost:1234'

Pact('PactUI', 'Projects Provider', PROVIDER_URL, function () {

  var EXPECTED_BODY = [{
    id: 1,
    name: 'Project 1',
    due: '2016-02-11T09:46:56.023Z',
    tasks: [
      {id: 1, name: 'Do the laundry', 'done': true},
      {id: 2, name: 'Do the dishes', 'done': false},
      {id: 3, name: 'Do the backyard', 'done': false},
      {id: 4, name: 'Do nothing', 'done': false}
    ]
  }]

  add(function (interaction) {
    interaction
      .given('i have a list of projects')
      .uponReceiving('a request for projects')
      .withRequest('get', '/projects', null, { 'Accept': 'application/json' })
      .willRespondWith(200, { 'Content-Type': 'application/json; charset=utf-8' }, EXPECTED_BODY)
  })

  function requestProjects () {
    return request.get(PROVIDER_URL + '/projects').set({ 'Accept': 'application/json' })
  }

  verify('single interaction', requestProjects, function (result, done) {
    expect(JSON.parse(result)).to.eql(EXPECTED_BODY)
    done()
  })

})

```
And your provider test will look like this:

```javascript
var path = require('path')
var expect = require('chai').expect
var request = require('superagent-bluebird-promise')

var server = require('./provider')

PactProvider('Projects Consumer', 'Projects Provider', function () {
  var PORT = Math.floor(Math.random() * 999) + 9000
  var PROVIDER_URL = 'http://localhost:' + PORT

  before(function (done) {
    server.listen(PORT, done)
  })

  var pactOpts = {
    providerBaseUrl: PROVIDER_URL,
    pactUrls: [ path.resolve(process.cwd(), 'pacts', 'pactui-projects_provider.json') ],
    providerStatesUrl: PROVIDER_URL + '/providerStates',
    providerStatesSetupUrl: PROVIDER_URL + '/providerStates',
  }

  honourPact(pactOpts, function (result, done) {
    done()
  })

})
```
## Contact

* Twitter: [@pact_up](https://twitter.com/pact_up)
* Google users group: https://groups.google.com/forum/#!forum/pact-support
