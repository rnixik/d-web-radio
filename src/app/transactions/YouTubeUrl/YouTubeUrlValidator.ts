import { SpecificValidator } from '@/types/SpecificValidator'
import { Transaction } from '@/models/Transaction'
import { YouTubeUrlTransactionType } from '@/app/transactions/YouTubeUrl/YouTubeUrlTransactionType'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'
import Plyr from 'plyr'

export class YouTubeUrlValidator implements SpecificValidator {
  public maxVideoDuration: number = 600 // seconds
  public youtubeValidationTimeout = 10000

  public async validate (storedTransactions: Transaction[], tx: Transaction): Promise<void> {
    const youTubeUrl = tx.model as YouTubeUrlModel
    if (!youTubeUrl.videoId) {
      throw new Error('Empty video ID')
    }
    if (youTubeUrl.videoId.length !== 11) {
      throw new Error('Incorrect video ID')
    }

    // Validate uniqueness
    for (const storedTx of storedTransactions) {
      if (storedTx.type !== YouTubeUrlTransactionType.t) {
        continue
      }
      const storedYouTubeUrl = storedTx.model as YouTubeUrlModel
      if (storedYouTubeUrl.videoId === youTubeUrl.videoId) {
        throw new Error('Url already posted')
      }
    }

    // Validate using YouTube

    if (typeof document === 'undefined') {
      return
    }

    const validatorPlayerElement = document.getElementById('validator-player-container')
    if (!validatorPlayerElement) {
      throw new Error('YouTube validator configured incorrectly')
    }

    const playerElement = document.createElement('div') as HTMLDivElement
    playerElement.setAttribute('data-plyr-provider', 'youtube')
    playerElement.setAttribute('data-plyr-embed-id', youTubeUrl.videoId)
    validatorPlayerElement.append(playerElement)

    const player = new Plyr(playerElement)
    setTimeout(() => {
      playerElement.remove()
      player.destroy()
    }, this.youtubeValidationTimeout)

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Validation with YouTube is timed out'))
      }, this.youtubeValidationTimeout)

      player.on('ready', () => {
        const playerAny = player as any
        if (playerAny && playerAny.embed) {
          youTubeUrl.title = playerAny.embed.getVideoData().title
        }
        youTubeUrl.duration = player.duration

        if (youTubeUrl.duration > this.maxVideoDuration) {
          reject(new Error('Video is too long'))
        }

        resolve()
      })
    })
  }
}
