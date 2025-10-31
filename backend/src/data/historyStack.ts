import { History } from "../types/general-interfaces";

class HistoryStack {
  private events: History[] = [];
  private eventsLimit: number;

  public constructor(eventsLimit: number) {
    this.eventsLimit = eventsLimit;
  }

  private isEmpty() {
    return this.events.length === 0;
  }

  public addOneEvent(element: History) {
    if (this.events.length >= this.eventsLimit) {
      this.events.shift();
    }

    return this.events.push(element);
  }

  public removeOneEvent() {
    if (this.isEmpty()) {
      return "History stack is empty.";
    }

    return this.events.pop();
  }

  public getLastStacked() {
    if (this.isEmpty()) {
      return "History stack is empty.";
    }

    return this.events[this.events.length - 1];
  }

  public getAllEvents() {
    if (this.isEmpty()) {
      return "History stack is empty.";
    }

    return this.events;
  }

  public stackSize() {
    return this.events.length;
  }
}

export default HistoryStack;
