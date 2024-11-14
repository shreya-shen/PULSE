class TransactionStack {
    constructor() {
        this.stack = [];
    }
    push(transaction) {
        this.stack.push(transaction);
    }
    pop() {
        return this.stack.pop();
    }
    getHistory() {
        return this.stack;
    }
}

module.exports = { TransactionStack };