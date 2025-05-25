const isDebug = process.env.IS_DEBUG === 'true';
const baseUrl = isDebug ? 'ws://localhost:5458/api/' : 'wss://doordashers.ru/api/';

export class WebSocketConnection {
  private socket: WebSocket | null = null;

  constructor(
    private url: string,
    private onMessageCallback: (event: MessageEvent) => void,
  ) {
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket(baseUrl + this.url);

    this.socket.onmessage = this.onMessageCallback;

    this.socket.onclose = this.reconnect;
    this.socket.onerror = (event) => {
      console.error(`Ошибка соединения:`, event);
    };
  }

  close() {
    this.socket.onclose = null;
    this.socket?.close();
    this.socket = null;
  }

  reconnect = () => {
    console.error('Соединение закрыто');
    this.close();
    this.connect();
  };

  onOpen(callback: (event: Event) => void) {
    if (this.socket) {
      this.socket.onopen = callback;
    }
  }

  onMessage(callback: (event: MessageEvent) => void) {
    if (this.socket) {
      this.socket.onmessage = callback;
    }
  }

  sendMessage(message: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    }
  }
}
