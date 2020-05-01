import { SpecificValidator } from 'd-web-core/lib/types/SpecificValidator'
import { Transaction } from 'd-web-core/lib/models/Transaction'
import { YouTubeUrlVoteTransactionType } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteTransactionType'
import { YouTubeUrlVoteModel } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteModel'

export class YouTubeUrlVoteValidator implements SpecificValidator {
  public async validate (storedTransactions: Transaction[], tx: Transaction): Promise<void> {
    const youTubeUrlVote = tx.model as YouTubeUrlVoteModel
    if (!youTubeUrlVote.videoId) {
      throw new Error('Empty video ID')
    }
    if (youTubeUrlVote.videoId.length !== 11) {
      throw new Error('Incorrect video ID')
    }

    // Validate uniqueness
    for (const storedTx of storedTransactions) {
      if (storedTx.type !== YouTubeUrlVoteTransactionType.t) {
        continue
      }
      const storedYouTubeUrl = storedTx.model as YouTubeUrlVoteModel
      if (storedYouTubeUrl.videoId === youTubeUrlVote.videoId &&
        storedYouTubeUrl.user.publicKey === youTubeUrlVote.user.publicKey
      ) {
        throw new Error('Vote for this video has been already saved')
      }
    }
  }
}
