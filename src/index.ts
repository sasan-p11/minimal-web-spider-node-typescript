
import { spider } from './spider';

const url = 'https://www.tarafdari.com';
const nesting = Number.parseInt(process.argv[3], 10) || 1;
const concurrency = Number.parseInt(process.argv[4], 10) || 2;


spider(url, nesting,concurrency)
    .then(() => console.log('Download complete'))
    .catch(err => console.error(err));