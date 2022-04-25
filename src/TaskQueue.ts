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

    async runTask(task: Function) {
        await this.queue.push(async()=>{
            await task();
        });
        process.nextTick(this.next.bind(this));
    }
}