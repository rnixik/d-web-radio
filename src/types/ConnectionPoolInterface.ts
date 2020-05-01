export interface ConnectionPoolInterface {
  addOnMessageCallback(callback: (message: string, peerId: string) => void): void;
  sendMessage(message: string): void;
}
