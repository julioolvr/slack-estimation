const nock = require('nock')
const chai = require('chai')
const chaiHttp = require('chai-http')

chai.use(chaiHttp)
const { expect } = chai

const app = require('../index')

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
})
