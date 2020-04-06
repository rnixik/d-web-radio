import { Transaction } from '@/models/Transaction'
import { WebRtcConnectionsPool } from 'webrtc-connection'
import { TransactionSerializer } from '@/services/TransactionSerializer'
import { User } from '@/models/User'

export class Transport {
  private connectionPool: WebRtcConnectionsPool
  private transactionSerializer: TransactionSerializer
  private onIncomingTransactionsCallbacks: ((sender: User, transactions: Transaction[]) => void)[] = []

  constructor (connectionPool: WebRtcConnectionsPool, transactionSerializer: TransactionSerializer) {
    this.connectionPool = connectionPool
    this.transactionSerializer = transactionSerializer

    this.connectionPool.addOnMessageCallback((message: string, peerId: string) => {
      try {
        const data = JSON.parse(message)
        if (!data || !data.type || !data.sender) {
          return
        }
        if (data.type === 'txs') {
          const sender = new User(data.login, data.publicKey)
          const transactions = []
          for (const txData of data.txsData) {
            transactions.push(this.transactionSerializer.dataToTransaction(txData))
          }

          if (transactions.length) {
            for (const callback of this.onIncomingTransactionsCallbacks) {
              callback(sender, transactions)
            }
          }
        }
      } catch (e) {
        console.log(e)
      }
    })
  }

  public send (sender: User, transaction: Transaction) {
    const message = JSON.stringify({
      type: 'txs',
      sender: {
        login: sender.login,
        publicKey: sender.publicKey
      },
      txsData: [ this.transactionSerializer.transactionToData(transaction) ]
    })
    this.connectionPool.sendMessage(message)
  }

  public addOnIncomingTransactionsCallback (callback: (sender: User, transactions: Transaction[]) => void): void {
    this.onIncomingTransactionsCallbacks.push(callback)
  }
}
