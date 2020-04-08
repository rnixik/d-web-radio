import { Transaction } from '@/models/Transaction'
import { WebRtcConnectionsPool } from 'webrtc-connection'
import { TransactionSerializer } from '@/services/TransactionSerializer'

export class Transport {
  private connectionPool: WebRtcConnectionsPool
  private transactionSerializer: TransactionSerializer
  private onIncomingTransactionsCallbacks: ((transactions: Transaction[]) => void)[] = []

  constructor (connectionPool: WebRtcConnectionsPool, transactionSerializer: TransactionSerializer) {
    this.connectionPool = connectionPool
    this.transactionSerializer = transactionSerializer

    this.connectionPool.addOnMessageCallback((message: string, peerId: string) => {
      try {
        const data = JSON.parse(message)
        if (!data || !data.type) {
          return
        }
        if (data.type === 'txs' && data.txsData && data.txsData.length) {
          const transactions = []
          for (const txData of data.txsData) {
            transactions.push(this.transactionSerializer.dataToTransaction(txData, false))
          }

          if (transactions.length) {
            for (const callback of this.onIncomingTransactionsCallbacks) {
              callback(transactions)
            }
          }
        }
      } catch (e) {
        console.log('Cannot parse message from ' + peerId + ': ' + e.toString())
      }
    })
  }

  public send (transaction: Transaction) {
    const message = JSON.stringify({
      type: 'txs',
      txsData: [ this.transactionSerializer.transactionToData(transaction, false) ]
    })
    this.connectionPool.sendMessage(message)
  }

  public addOnIncomingTransactionsCallback (callback: (transactions: Transaction[]) => void): void {
    this.onIncomingTransactionsCallbacks.push(callback)
  }
}
