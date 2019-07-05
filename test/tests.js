const nock = require('nock')
const chai = require('chai')
const chaiHttp = require('chai-http')

chai.use(chaiHttp)
const { expect } = chai

const app = require('../index')
const snapshots = require('./snapshots/index')

before(() => {
  nock.disableNetConnect()
  nock.enableNetConnect('127.0.0.1')
})

after(() => app.stop())

describe('Starting a vote', () => {
  it('returns an ok response', async () => {
    const scope = nock('http://fakeslack')
      .post('/response')
      .reply(200)

    const response = await chai
      .request(app)
      .post('/start')
      .type('form')
      .send({
        response_url: `http://fakeslack/response`
      })

    expect(response).to.have.status(200)

    scope.done()
  })

  it('sends a message to Slack including the given story name', async () => {
    const scope = nock('http://fakeslack')
      .post('/response', request =>
        request.blocks.some(
          block => block.text && block.text.text.includes('STORY')
        )
      )
      .reply(200)

    await chai
      .request(app)
      .post('/start')
      .type('form')
      .send({
        response_url: `http://fakeslack/response`,
        text: 'STORY  '
      })

    scope.done()
  })

  describe('snapshots', () => {
    it('sends the right message to Slack for a new vote', async () => {
      const scope = nock('http://fakeslack')
        .post('/response', snapshots.newVote('STORY'))
        .reply(200)

      await chai
        .request(app)
        .post('/start')
        .type('form')
        .send({
          response_url: `http://fakeslack/response`,
          text: 'STORY'
        })

      scope.done()
    })

    describe('with an existing vote', () => {
      let voteId

      beforeEach(async () => {
        const scope = nock('http://fakeslack')
          .post('/response', response => {
            // Take the voteId from one of the actions
            voteId = response.blocks
              .find(block => block.type === 'actions')
              .elements[0].value.split('.')[1]

            return true
          })
          .once()
          .reply(200)

        await chai
          .request(app)
          .post('/start')
          .type('form')
          .send({
            response_url: `http://fakeslack/response`,
            text: 'STORY'
          })

        scope.done()
      })

      it('sends the right message to Slack for voting', async () => {
        const scope = nock('http://fakeslack')
          .post('/response', snapshots.castVote('STORY', 'U123'))
          .reply(200)

        await chai
          .request(app)
          .post('/vote')
          .type('form')
          .send({
            payload: JSON.stringify({
              actions: [{ value: `0.${voteId}` }],
              user: { id: 'U123' },
              response_url: `http://fakeslack/response`
            })
          })

        scope.done()
      })
    })
  })
})
