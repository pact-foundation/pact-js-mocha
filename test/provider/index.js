var express = require('express')
var bodyParser = require('body-parser')

var server = express()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

server.get('/projects', function (req, res) {
  res.json({ reply: 'hello' })
})

server.get('/providerStates', function (req, res) {
  res.json({ 'PactUI' : ['i have a list of projects'] })
})

server.post('/providerStates', function (req, res) {
  res.sendStatus(201, {})
})

module.exports = server
