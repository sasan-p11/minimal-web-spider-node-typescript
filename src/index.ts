
import { spider } from './spider';
import { TaskQueue } from './TaskQueue';

const url = 'https://www.tarafdari.com';
const nesting = Number.parseInt(process.argv[3], 10) || 1;
const concurrency = Number.parseInt(process.argv[4], 10) || 2;

const spiderQueue = new TaskQueue(concurrency);
spiderQueue.on('error', console.error);
spiderQueue.on('empty', () => console.log('Download complete'));

spider(url, nesting, spiderQueue);