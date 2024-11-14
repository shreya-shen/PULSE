class Queue {
    constructor() {
        this.items = [];
    }
    enqueue(element) {
        this.items.push(element);
    }
    dequeue() {
        return this.items.shift();
    }
    isEmpty() {
        return this.items.length === 0;
    }
}

class PriorityQueue {
    constructor() {
        this.items = [];
    }
    enqueue(element) {
        this.items.push(element);
        this.items.sort((a, b) => b.urgent - a.urgent);
    }
    dequeue() {
        return this.items.shift();
    }
    isEmpty() {
        return this.items.length === 0;
    }
}

module.exports = { Queue, PriorityQueue };
