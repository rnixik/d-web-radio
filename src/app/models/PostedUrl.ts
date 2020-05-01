import { YouTubeUrlVoteModel } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteModel'
import { User } from 'd-web-core/lib/models/User'
import { YouTubeUrlModel } from '@/app/transactions/YouTubeUrl/YouTubeUrlModel'

export class PostedUrl {
  public urlModel: YouTubeUrlModel
  public storedAt: Date
  public votes: YouTubeUrlVoteModel[]

  constructor (urlModel: YouTubeUrlModel, storedAt: Date, votes: YouTubeUrlVoteModel[] = []) {
    this.urlModel = urlModel
    this.storedAt = storedAt
    this.votes = votes
  }

  public addVote (vote: YouTubeUrlVoteModel): void {
    this.votes.push(vote)
  }

  public getPositiveVotes (): YouTubeUrlVoteModel[] {
    return this.votes.filter((voteModel) => voteModel.isPositive)
  }

  public getNegativeVotes (): YouTubeUrlVoteModel[] {
    return this.votes.filter((voteModel) => !voteModel.isPositive)
  }

  public hasUserVotedPositively (user: User): boolean {
    return this.getPositiveVotes()
      .filter(
        (voteModel) => voteModel.user.publicKey === user.publicKey
      ).length > 0
  }

  public hasUserVotedNegatively (user: User): boolean {
    return this.getNegativeVotes()
      .filter(
        (voteModel) => voteModel.user.publicKey === user.publicKey
      ).length > 0
  }

  public hasUserVoted (user: User): boolean {
    return this.hasUserVotedNegatively(user) || this.hasUserVotedPositively(user)
  }

  public getScore (): number {
    return this.getPositiveVotes().length - this.getNegativeVotes().length
  }
}
