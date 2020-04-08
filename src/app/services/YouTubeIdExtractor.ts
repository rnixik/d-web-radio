export class YouTubeIdExtractor {
  public extractVideoId (url: string): string {
    if (!url) {
      throw new Error('Empty url')
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/
    const match = url.match(regExp)
    if (!match || match[2].length !== 11) {
      throw new Error('Invalid YouTube url')
    }

    return match[2]
  }
}
