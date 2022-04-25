import { EventEmitter } from "events";

export class TaskQueue extends EventEmitter {
    private concurrency: number;
    private running: number;
    private queue: Array<Function>;


    constructor(concurrency: number) {
        super();
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }
    
    next() {
        while (this.running < this.concurrency && this.queue.length > 0) {
            const task = this.queue.shift();
            task!().finally(() => {
                this.running--;
                this.next();
            });
            this.running++;
        }
    }

    runTask(task: Function) {
        return new Promise((resolve, reject) => {
            this.queue.push(() => {
                return task().then(resolve).catch(reject);
            })
            process.nextTick(this.next.bind(this));
        });
    }
}