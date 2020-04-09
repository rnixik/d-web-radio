import { YouTubeIdExtractor } from '@/app/services/YouTubeIdExtractor'

test('Extracts video id from simple', () => {
  expect((new YouTubeIdExtractor())
    .extractVideoId('https://www.youtube.com/watch?v=9sTQ0QdkN3Q'))
    .toBe('9sTQ0QdkN3Q')
})

test('Extracts video id from share', () => {
  expect((new YouTubeIdExtractor())
    .extractVideoId('https://youtu.be/9sTQ0QdkN3Q'))
    .toBe('9sTQ0QdkN3Q')
})

test('Extracts video id from share with timestamp', () => {
  expect((new YouTubeIdExtractor())
    .extractVideoId('https://youtu.be/9sTQ0QdkN3Q?t=45'))
    .toBe('9sTQ0QdkN3Q')
})

test('Extracts video id from playlist', () => {
  expect((new YouTubeIdExtractor())
    .extractVideoId('https://www.youtube.com/watch?v=9sTQ0QdkN3Q&list=PLmmWbcMayTQVikz4c4W5gGqlFGDtTBSXZ'))
    .toBe('9sTQ0QdkN3Q')
})

test('Extracts video id from playlist with timestamp', () => {
  expect((new YouTubeIdExtractor())
    .extractVideoId('https://youtu.be/9sTQ0QdkN3Q?list=PLmmWbcMayTQVikz4c4W5gGqlFGDtTBSXZ&t=86'))
    .toBe('9sTQ0QdkN3Q')
})

test('Throws error on extracting video id from bad YouTube url', () => {
  expect(() => {
    (new YouTubeIdExtractor()).extractVideoId('https://www.youtube.com/channel/UCNCYBBI44YViXw7vBrqCZcg')
  }).toThrow('Invalid YouTube url')
})

test('Throws error on extracting video id from bad url', () => {
  expect(() => {
    (new YouTubeIdExtractor()).extractVideoId('bad-url')
  }).toThrow('Invalid YouTube url')
})
