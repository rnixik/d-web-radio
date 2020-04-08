import nacl, { SignKeyPair } from 'tweetnacl'
import util from 'tweetnacl-util'
import { AuthenticatedUser } from '@/models/AuthenticatedUser'
import { TransactionPayload } from '@/types/TransactionPayload'
import { Transaction } from '@/models/Transaction'
import { Signature } from '@/models/Signature'

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

  public calculateTransactionHash (type: string, payload: TransactionPayload): string {
    const str = JSON.stringify([type, payload])
    const hash = nacl.hash(util.decodeUTF8(str))
    const shortHash = hash.slice(0, 16)

    return util.encodeBase64(shortHash)
  }

  public signTransaction (user: AuthenticatedUser, tx: Transaction): Transaction {
    const signatureData = nacl.sign.detached(util.decodeBase64(tx.hash), util.decodeBase64(user.privateKey))
    const signatureStr = util.encodeBase64(signatureData)
    const signature = new Signature(signatureStr, user.publicKey)

    tx.signatures.push(signature)

    return tx
  }

  public verifySignature (tx: Transaction, signature: Signature): boolean {
    return nacl.sign.detached.verify(
      util.decodeBase64(tx.hash),
      util.decodeBase64(signature.signature),
      util.decodeBase64(signature.publicKey)
    )
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
