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
