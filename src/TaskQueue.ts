import {EventEmitter} from "events";

export class TaskQueue extends EventEmitter {
    private concurrency: number;
    private running: number;
    private queue: Array<Function>;
  

    constructor (concurrency : any ) {
        super();
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    push (task: Function) {
        this.queue.push(task);
        process.nextTick(this.next.bind(this));
        return this;
    }

    next () {
        if(this.running === 0 && this.queue.length === 0) {
            return this.emit("empty");
        }
        while(this.running < this.concurrency && this.queue.length > 0) {
            const task = this.queue.shift();
            task!((err : Error)=>{
                if(err) {
                    this.emit("error", err);
                }
                this.running--;
                process.nextTick(this.next.bind(this));
            });
            this.running++;
        }
    }
}