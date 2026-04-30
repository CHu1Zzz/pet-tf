type EventCallback = (data?: any) => void;

interface EventMap {
  [key: string]: EventCallback[];
}

class EventBusClass {
  private listeners: EventMap = {};

  on(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) return;
    const index = this.listeners[event].indexOf(callback);
    if (index !== -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  emit(event: string, data?: any): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }

  clear(): void {
    this.listeners = {};
  }
}

export const EventBus = new EventBusClass();
