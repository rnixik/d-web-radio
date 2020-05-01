import { YouTubeUrlValidator } from '@/app/transactions/YouTubeUrl/YouTubeUrlValidator'
import { Transaction } from 'd-web-core/lib/models/Transaction'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'
import { User } from 'd-web-core/lib/models/User'

const validator = new YouTubeUrlValidator()
const someUser = new User('someLogin', 'someKey')

const model = new YouTubeUrlModel('9sTQ0QdkN3Q', someUser)
const tx = new Transaction(someUser, YouTubeUrlTransactionType.t, model, 'someHash')

const storedModel = new YouTubeUrlModel('9sTQ0QdkN3Q', someUser)
const storedTransaction = new Transaction(someUser, YouTubeUrlTransactionType.t, storedModel, 'someOtherHash')

describe('YouTube video id validator', () => {
  test.each([
    ['', 'Empty video ID'],
    ['UCNCYBBI44YViXw7vBrqCZcg', 'Incorrect video ID'],
    ['9sTQ0QdkN3Q', 'Url already posted']
  ])('Throws error when video id is incorrect: %s', (videoId, errorString) => {
    expect.assertions(1);

    (tx.model as YouTubeUrlModel).videoId = videoId

    return expect(validator.validate([ storedTransaction ], tx))
      .rejects
      .toThrow(errorString)
  })

  test('Transaction is Valid', () => {
    expect.assertions(1);

    (tx.model as YouTubeUrlModel).videoId = 'dQw4w9WgXcQ'

    return expect(validator.validate([ storedTransaction ], tx))
      .resolves
      .not.toThrow()
  })
})
