import { User } from '@/models/User'
import { ModelSerializer } from '@/types/ModelSerializer'
import { YouTubeUrlSerializer } from '@/app/transactions/YouTubeUrl/YouTubeUrlSerializer'
import { TransactionModel } from '@/types/TransactionModel'
import { YouTubeUrlVoteModel } from '@/app/transactions/YouTubeUrlVote/YouTubeUrlVoteModel'

export class YouTubeUrlModel implements TransactionModel {
  public videoId: string;
  public user: User
  private votes: YouTubeUrlVoteModel[] = []

  constructor (videoId: string, user: User) {
    this.videoId = videoId
    this.user = user
  }

  getSerializer (): ModelSerializer {
    return new YouTubeUrlSerializer()
  }

  public getYouTubeUrl (): string {
    return 'https://www.youtube.com/embed/' + this.videoId + '?autoplay=0'
  }

  public addVote (vote: YouTubeUrlVoteModel): void {
    this.votes.push(vote)
  }

  public getPositiveVotes (): YouTubeUrlVoteModel[] {
    return this.votes.filter((voteModel) => voteModel.isPositive)
  }

  public geNegativeVotes (): YouTubeUrlVoteModel[] {
    return this.votes.filter((voteModel) => !voteModel.isPositive)
  }

  public hasUserVotedPositively (user: User): boolean {
    return this.getPositiveVotes()
      .filter(
        (voteModel) => voteModel.user.publicKey === user.publicKey
      ).length > 0
  }

  public hasUserVotedNegatively (user: User): boolean {
    return this.geNegativeVotes()
      .filter(
        (voteModel) => voteModel.user.publicKey === user.publicKey
      ).length > 0
  }

  public hasUserVoted (user: User): boolean {
    return this.hasUserVotedNegatively(user) || this.hasUserVotedPositively(user)
  }
}
