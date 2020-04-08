import { Transaction } from '@/models/Transaction'
import { WebRtcConnectionsPool } from 'webrtc-connection'
import { TransportServiceInterface } from '@/types/TransportServiceInterface'
import { TransactionSerializerInterface } from '@/types/TransactionSerializerInterface'

export class TransportService implements TransportServiceInterface {
  private connectionPool: WebRtcConnectionsPool
  private transactionSerializer: TransactionSerializerInterface
  private onIncomingTransactionsCallbacks: ((transactions: Transaction[]) => void)[] = []

  constructor (connectionPool: WebRtcConnectionsPool, transactionSerializer: TransactionSerializerInterface) {
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

  public send (transaction: Transaction): void {
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
