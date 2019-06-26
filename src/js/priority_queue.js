/*
* From
* https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
*/

class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
        this._top = 0; // constant;
        this.parent = i => ((i + 1) >>> 1) - 1;
        this.left = i => (i << 1) + 1;
        this.right = i => (i + 1) << 1;
    }
    static parent(i) {
        return ((i + 1) >>> 1) - 1;
    }
    static left(i) {
        return (i << 1) + 1;
    }
    static right(i) {
        return (i + 1) << 1;
    }
    get size() {
        return this._heap.length;
    }
    isEmpty() {
        return this.size === 0;
    }
    peek() {
        return this._heap[this._top];
    }
    push(value) {
        this._heap.push(value);
        this._siftUp();
        return this.size;
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size - 1;
        if (bottom > this._top) {
            this._swap(this._top, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }
    replace(value) {
        const replacedValue = this.peek();
        this._heap[this._top] = value;
        this._siftDown();
        return replacedValue;
    }
    _greater(i, j) {
        return this._comparator(this._heap[i], this._heap[j]);
    }
    _swap(i, j) {
        const temp = this._heap[i];
        this._heap[i] = this._heap[j];
        this._heap[j] = temp;
    }
    _siftUp() {
        let node = this.size - 1;
        while (node > this._top && this._greater(node, PriorityQueue.parent(node))) {
            this._swap(node, PriorityQueue.parent(node));
            node = PriorityQueue.parent(node);
        }
    }
    _siftDown() {
        let node = this._top;
        while (
            (PriorityQueue.left(node) < this.size && this._greater(PriorityQueue.left(node), node)) ||
            (PriorityQueue.right(node) < this.size && this._greater(PriorityQueue.right(node), node))
        ) {
            let maxChild = ((PriorityQueue.right(node) < this.size && this._greater(PriorityQueue.right(node), PriorityQueue.left(node))) ?
                            PriorityQueue.right(node) : PriorityQueue.left(node));
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}