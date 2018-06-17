namespace AdvancedServiceWorker {
    export class BrowserCache {
        private readonly storageName: string;

        constructor(name: string, version?: number) {
            if (version) {
                name += `-v${version}`;
            }
            this.storageName = name;
        }

        private open(): Promise<Cache> {
            return caches.open(this.storageName);
        }

        remove(condition?: RegExp | String | string | string[]): Promise<boolean> {
            if (!condition) {
                // if there is no condition, delete the whole cache
                return caches.delete(this.storageName);
            } else if (
                // ReSharper disable once SuspiciousInstanceofCheck
                typeof condition === "string" ||
                    condition instanceof String ||
                    condition instanceof RegExp) {
                // if there is a wildcard or regex condition, match and delete based on url

                // first make sure that we have a regex condition
                if (!(condition instanceof RegExp)) {
                    condition = Condition.wildCardToRegEx((condition) as string);
                }

                // now delete all matched requests
                return this.open().then(cache => cache.keys().then(keys => {
                    const promises: Promise<boolean>[] = [];
                    keys.forEach(request => {
                        if (request.url && (condition as RegExp).test(request.url)) {
                            promises.push(cache.delete(request));
                        }
                    });

                    // return false if no request matched
                    if (!promises.length) {
                        return Promise.resolve(false);
                    }

                    // return true even if one request removed
                    return Promise.all(promises).then(results => {
                            for (let i: number = 0; i < results.length; i++) {
                                if (results[i]) {
                                    return true;
                                }
                            }
                            return false;
                        },
                        () => false);
                }));
            } else if (condition instanceof Array && condition.length) {
                // if there is a list of urls, request one by one
                return this.open().then(cache => {
                    const promises: Promise<boolean>[] = [];
                    for (let i: number = 0; i < (condition as string[]).length; i++) {
                        promises.push(cache.delete((condition[i]) as string));
                    }

                    // return true even if one request removed
                    return Promise.all(promises).then(results => {
                            for (let j: number = 0; j < results.length; j++) {
                                if (results[j]) {
                                    return true;
                                }
                            }
                            return false;
                        },
                        () => false);
                });
            } else {
                // otherwise, return false
                return Promise.resolve(false);
            }
        }

        preloadUrls(urls: string[], version?: number): Promise<boolean> {
            if (!urls) {
                return Promise.resolve(false);
            }
            return this.open().then(
                (cache: Cache) => cache.addAll(urls).then(
                    () => true,
                    () => {
                        console.error("Failed to add preload pages to cache.");
                        return false;
                    }),
                () => {
                    console.error("Failed to open cache.");
                    return false;
                });
        }

        putResponse(request: Request, response: Response): Promise<void> {
            if (!response) {
                throw new Error("Can not add an empty response to cache.");
            }

            // reject uncachable responses but dont throw an error
            if (response.status !== 200 && // oK
                response.status !== 204 && // no Content
                response.status !== 300 && // multiple Choice
                response.status !== 301 && // moved Permanently
                response.status !== 303 && // see Other
                response.status !== 308) { // permanent Redirect
                return Promise.resolve();
            }

            return this.open().then(cache => cache.put(request, response));
        }

        getResponse(request: string | Request): Promise<Response> {
            return this.open().then(
                cache => cache.match(request).then((response: Response) => {
                    if (response) {
                        return response;
                    }
                    throw new Error("Cache contains empty response.");
                }));
        }
    }
}