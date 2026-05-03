type EventCallback = (data?: any) => void;

interface Listener {
  callback: EventCallback;
  thisArg?: any;
}

interface EventMap {
  [key: string]: Listener[];
}

class EventBusClass {
  private listeners: EventMap = {};

  on(event: string, callback: EventCallback, thisArg?: any): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push({ callback, thisArg });
  }

  off(event: string, callback: EventCallback, thisArg?: any): void {
    if (!this.listeners[event]) return;
    const index = this.listeners[event].findIndex(
      (l) => l.callback === callback && l.thisArg === thisArg
    );
    if (index !== -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  emit(event: string, data?: any): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((l) => l.callback.call(l.thisArg, data));
  }

  clear(): void {
    this.listeners = {};
  }
}

export const EventBus = new EventBusClass();
