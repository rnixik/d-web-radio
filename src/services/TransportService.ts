import { Transaction } from '@/models/Transaction'
import { TransportServiceInterface } from '@/types/TransportServiceInterface'
import { TransactionSerializerInterface } from '@/types/TransactionSerializerInterface'
import { ConnectionPoolInterface } from '@/types/ConnectionPoolInterface'

export class TransportService implements TransportServiceInterface {
  private connectionPool: ConnectionPoolInterface
  private transactionSerializer: TransactionSerializerInterface
  private onIncomingTransactionsCallbacks: ((transactions: Transaction[]) => void)[] = []

  constructor (connectionPool: ConnectionPoolInterface, transactionSerializer: TransactionSerializerInterface) {
    this.connectionPool = connectionPool
    this.transactionSerializer = transactionSerializer

    this.connectionPool.addOnMessageCallback((message: string, peerId: string) => {
      console.log('Incoming message', new Blob([message]).size, peerId)
      try {
        const data = JSON.parse(message)
        if (!data || !data.type) {
          throw new Error('Cannot parse message')
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

  public send (transactions: Transaction[]): void {
    const serializedTransactions = []
    for (const tx of transactions) {
      serializedTransactions.push(this.transactionSerializer.transactionToData(tx, false))
    }

    const message = JSON.stringify({
      type: 'txs',
      txsData: serializedTransactions
    })
    this.connectionPool.sendMessage(message)
  }

  public addOnIncomingTransactionsCallback (callback: (transactions: Transaction[]) => void): void {
    this.onIncomingTransactionsCallbacks.push(callback)
  }
}
