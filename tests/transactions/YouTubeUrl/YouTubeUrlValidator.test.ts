import { YouTubeUrlValidator } from '@/app/transactions/YouTubeUrl/YouTubeUrlValidator'
import { Transaction } from '@/models/Transaction'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'
import { YouTubeUrlPayload } from '@/app/transactions/YouTubeUrl/YouTubeUrlPayload'

const validator = new YouTubeUrlValidator()

const payload = new YouTubeUrlPayload('9sTQ0QdkN3Q')
const tx = new Transaction('somePk', YouTubeUrlTransactionType.t, payload, 'someHash')

const storedPayload = new YouTubeUrlPayload('9sTQ0QdkN3Q')
const storedTransaction = new Transaction('someOtherPk', YouTubeUrlTransactionType.t, storedPayload, 'someOtherHash')

describe('YouTube video id validator', () => {
  test.each([
    ['', 'Empty video ID'],
    ['UCNCYBBI44YViXw7vBrqCZcg', 'Incorrect video ID'],
    ['9sTQ0QdkN3Q', 'Url already posted']
  ])('Throws error when video id is incorrect: %s', (videoId, errorString) => {
    expect(() => {
      (tx.payload as YouTubeUrlPayload).videoId = videoId
      validator.validate([ storedTransaction ], tx)
    }).toThrow(errorString)
  })

  test('Transaction is Valid', () => {
    expect(() => {
      (tx.payload as YouTubeUrlPayload).videoId = 'dQw4w9WgXcQ'
      validator.validate([ storedTransaction ], tx)
    }).not.toThrow()
  })
})
