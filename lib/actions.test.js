const { expect } = require('chai')

const { countVote, closeVote } = require('./actions')

describe('actions', () => {
  describe('countVote', () => {
    it('adds a vote for the given option by the given user', () => {
      const updatedStory = countVote({ votes: {} }, '1', {
        user: { id: 'U123' }
      })
      expect(updatedStory.votes['U123']).to.equal('1')
    })

    it('changes the vote of a user if they vote again', () => {
      const updatedStory = countVote({ votes: { U123: '1' } }, '2', {
        user: { id: 'U123' }
      })

      expect(updatedStory.votes['U123']).to.equal('2')
      expect(Object.keys(updatedStory.votes).length).to.equal(1)
    })

    it('removes the vote if they select the same option', () => {
      const updatedStory = countVote({ votes: { U123: '1' } }, '1', {
        user: { id: 'U123' }
      })

      expect(updatedStory.votes).not.to.have.key('U123')
    })
  })

  describe('closeVote', () => {
    it('marks the story as closed', () => {
      expect(closeVote({}).closed).to.equal(true)
    })
  })
})
