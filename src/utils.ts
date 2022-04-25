import { URL } from "url";
import slug from "slug";
import path from "path";
import cheerio from 'cheerio';

function getLinkUrl(currentUrl: string, element: any): string {
    const parsedLink: URL = new URL(element.href || '', currentUrl);
    const currentParsedUrl: URL = new URL(currentUrl);
    if (parsedLink.hostname !== currentParsedUrl.hostname || !parsedLink.pathname) {
        return "";
    }
    return parsedLink.toString();
}

export function urlToFilename(url: string): string {
    const parseUrl: URL = new URL(url);
    const urlPath = parseUrl.pathname.split("/")
        .filter(function (component: string) {
            return component !== "";
        })
        .map(function (component: string) {
            return slug(component, { remove: null });
        })
        .join("/");

    let filename = path.join(parseUrl.hostname, urlPath);
    if (!path.extname(filename).match(/html/)) {
        filename += ".html";
    }
    return filename;
}

export function getPageLinks(currentUrl: string, body: any) {
    return Array.from(cheerio.load('body')('a'))
        .map(function (element: any) {
            return getLinkUrl(currentUrl, element);
        })
        .filter(Boolean)
}

export function promisify(callbackBasedApi : Function) {
    return function promisified(...args : any[]) {
        return new Promise((resolve, reject) => { 
            const newArgs = [
                ...args,
                function (err : Error, result : any) { 
                    if (err) {
                        return reject(err)
                    }
                    resolve(result)
                }
            ]
            callbackBasedApi(...newArgs) 
        })
    }
}