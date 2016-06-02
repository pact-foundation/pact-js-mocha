var express = require('express')
var bodyParser = require('body-parser')

var server = express()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

server.get('/projects', function (req, res) {
  res.json([
    {
      id: 1,
      name: 'Project 1',
      due: '2016-02-11T09:46:56.023Z',
      tasks: [
        {id: 1, name: 'Do the laundry', 'done': true},
        {id: 2, name: 'Do the dishes', 'done': false},
        {id: 3, name: 'Do the backyard', 'done': false},
        {id: 4, name: 'Do nothing', 'done': false}
      ]
    }
  ])
})

server.get('/providerStates', function (req, res) {
  res.json({ 'PactUI' : ['i have a list of projects'] })
})

server.post('/providerStates', function (req, res) {
  res.sendStatus(201, {})
})

module.exports = server
