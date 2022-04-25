import fs, { NoParamCallback, promises as fsPromise } from 'fs'
import path from 'path'
import superagent, { Response } from 'superagent';
import { urlToFilename, getPageLinks } from './utils'
import mkdirp from 'mkdirp'
import { promisify } from "util";

const mkdirpPromises = promisify(fs.mkdir);

function download(url: string, filename: string) {
    console.log(`Downloading "${url}"`);
    let content: string;
    return superagent.get(url)
        .then((res: Response) => {
            content = res.text;
            return mkdirpPromises(path.dirname(filename));
        })
        .then(() => fsPromise.writeFile(filename, content))
        .then(() => {
            console.log(`Downloaded and saved: ${url}`)
            return content;
        });
}

function spiderLinks(currentUrl: string, content: string, nesting: number) {
    let promise = Promise.resolve();
    if (nesting === 0)
        return promise;

    const links = getPageLinks(currentUrl, content);

    links.forEach(link => {
        promise = promise.then(() => spider(link, nesting - 1));
    });
}

const spidering = new Set()
export function spider(url: string, nesting: number) {
    const filename = urlToFilename(url);
    return fsPromise.readFile(filename, 'utf8')
        .catch(err => {
            if (err.code !== 'ENOENT') {
                throw err;
            }
            return download(url, filename);
        })
        .then(content => spiderLinks(url, content, nesting));
}