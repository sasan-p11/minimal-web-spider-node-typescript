import fs, { NoParamCallback } from 'fs'
import path from 'path'
import superagent, { Response } from 'superagent';
import { urlToFilename, getPageLinks } from './utils'
import { TaskQueue } from './TaskQueue'
import mkdirp from 'mkdirp'


function saveFile(fileName: string, contents: string, cb: NoParamCallback) {
    fs.mkdir(path.dirname(fileName), (err) => {
        if (err && err.code !== 'EEXIST') 
            return cb(err);

        fs.writeFile(fileName, contents, cb);
    });
}

function download(url: string, filename: string, cb: Function) {
    console.log(`Downloading "${url}"`);
    superagent.get(url).end((err: Error, res: Response) => {
        if (err)
            return cb(err);

        saveFile(filename, res.text, err => {
            if (err)
                return cb(err);

            console.log(`Downloaded and saved: ${url}`)
            cb(null, res.text)
        });
    });
}

function spiderLinks(currentUrl: string, body: any, nesting: number, queue: TaskQueue) {
    if (nesting === 0)
        return;

    const links: string[] = getPageLinks(currentUrl, body);
    if (links.length === 0)
        return;

    links.forEach(link => spider(link, nesting - 1, queue));
}

function spiderTask(url : string, nesting : number, queue : TaskQueue, cb : Function) {
    const filename = urlToFilename(url)
    fs.readFile(filename, 'utf8', (err, fileContent) => {
        if (err) {
            if (err.code !== 'ENOENT') {
                return cb(err)
            }

            return download(url, filename, (err :Error, requestContent : any) => {
                if (err) {
                    return cb(err)
                }

                spiderLinks(url, requestContent, nesting, queue)
                return cb()
            })
        }

        spiderLinks(url, fileContent, nesting, queue)
        return cb()
    })
}

const spidering = new Set()
export function spider(url: string, nesting: number, queue: TaskQueue) {
    if (spidering.has(url)) {
        return
    }

    spidering.add(url)
    queue.push((done: Function) => {
        spiderTask(url, nesting, queue, done)
    })
}