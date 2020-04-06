import nacl, { SignKeyPair } from 'tweetnacl'
import util from 'tweetnacl-util'
import { AuthenticatedUser } from '@/models/AuthenticatedUser'

export class CryptoService {
  public getUserByLoginAndPassword (login: string, password: string): AuthenticatedUser {
    let seed = password + login
    const pair = CryptoService.getPairBySeed(seed)

    return new AuthenticatedUser(
      login,
      util.encodeBase64(pair.publicKey),
      util.encodeBase64(pair.secretKey)
    )
  }

  public hash (message: string): string {
    const hash = nacl.hash(util.decodeUTF8(message))

    const shortHash = hash.slice(0, 32)

    return util.encodeBase64(shortHash)
  }

  private static getPairBySeed (seed: string): SignKeyPair {
    const seedArray = util.decodeUTF8(seed)

    // Padding to length of 32
    const seedArray32 = new Uint8Array(32)
    for (let i = 0; i < 32; i++) {
      if (i + 1 <= seedArray.length) {
        seedArray32[i] = seedArray[i]
      } else {
        seedArray32[i] = 1
      }
    }

    return nacl.sign.keyPair.fromSeed(seedArray32)
  }
}
