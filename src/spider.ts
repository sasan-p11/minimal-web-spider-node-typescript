import fs, { promises as fsPromise } from 'fs'
import path from 'path'
import superagent, { Response } from 'superagent';
import { urlToFilename, getPageLinks } from './utils'
import { TaskQueue } from './TaskQueue';
import mkdirp from 'mkdirp'
import { ErrorRequestHandler } from 'express';


async function download(url: string, filename: string) {
    console.log(`Downloading "${url}"`);
    const { text: content } = await superagent.get(url);
    await fsPromise.writeFile(filename, content);
    await fsPromise.writeFile(filename, content);
    console.log(`Downloaded and saved: ${url}`);
    return content;
}

const spidering = new Set()
async function spiderTask(url: string, nesting: number) {
    const filename = urlToFilename(url)
    let content: string;
    try {
        content = await fsPromise.readFile(filename, 'utf8');
    } catch (error : any) {
        if (error.code !== 'ENOENT') {
            throw error
        }
        content = await download(url, filename)
    }
    return spiderLinks(url, content, nesting);
}

async function spiderLinks(currentUrl: string, content: any, nesting: number) {
    if (nesting === 0)
        return Promise.resolve();

    const links = getPageLinks(currentUrl, content);
    const promises : any = links.map(link => spiderTask(link, nesting - 1))

    return await Promise.all(promises);
}

export function spider(url: string, nesting: number, concurrency: number) {
    const queue = new TaskQueue(concurrency)
    return spiderTask(url, nesting)
}