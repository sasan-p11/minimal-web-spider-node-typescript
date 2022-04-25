import fs, { promises as fsPromise } from 'fs'
import path from 'path'
import superagent, { Response } from 'superagent';
import { urlToFilename, getPageLinks } from './utils'
import { promisify } from "util";
import { TaskQueue } from './TaskQueue';
import mkdirp from 'mkdirp'

const mkdirpPromises = promisify(mkdirp);

function download(url: string, filename: string) {
    console.log(`Downloading "${url}"`);
    let content: string;
    return superagent.get(url)
        .then((res: Response) => {
            content = res.text;
            return fsPromise.mkdir(path.dirname(filename), { mode: 0o755 });
        })
        .then(() => {
            console.log("sasan");
            fsPromise.writeFile(filename, content);
        })
        .then(() => {
            console.log(`Downloaded and saved: ${url}`)
            return content;
        });
}

const spidering = new Set()
function spiderTask(url: string, nesting: number, queue: TaskQueue) {
    if (spidering.has(url)) {
        return Promise.resolve()
    }
    spidering.add(url);

    const filename = urlToFilename(url)

    return queue
        .runTask(() => {
            return fsPromise.readFile(filename, 'utf8')
                .catch((err) => {
                    if (err.code !== 'ENOENT') {
                       
                        throw err
                    }
                    
                    // The file doesn't exist, so let’s download it
                    return download(url, filename)
                })
        })
        .then(content => {
            spiderLinks(url, content, nesting, queue);
        });
}

function spiderLinks(currentUrl: string, content : any , nesting: number, queue: TaskQueue) {
    if (nesting === 0)
        return Promise.resolve();

    const links = getPageLinks(currentUrl, content);

    const promises: any = links.map(link => spiderTask(link, nesting - 1, queue))

    return Promise.all(promises)
}

export function spider(url: string, nesting: number, concurrency: number) {
    const queue = new TaskQueue(concurrency)
    return spiderTask(url, nesting, queue)
}