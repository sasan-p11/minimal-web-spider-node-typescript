
import { spider } from './spider';
import { TaskQueue } from './TaskQueue';

const url = 'https://www.tarafdari.com';
const nesting = Number.parseInt(process.argv[3], 10) || 1;
const concurrency = Number.parseInt(process.argv[4], 10) || 2;


spider(url, nesting)
    .then(() => console.log('Download complete'))
    .catch(err => console.error(err));