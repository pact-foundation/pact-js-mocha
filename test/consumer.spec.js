var expect = require('chai').expect
var request = require('superagent')

var PactOpts = {
  consumer: 'PactUI',
  provider: 'Projects Provider',
  providerPort: 1234
}

PactConsumer(PactOpts, function () {

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

  verify('a list of projects is returned', requestProjects, function (result, done) {
    expect(JSON.parse(result)).to.eql({ reply: 'hello' })
    done()
  })

  finalizePact()

})
