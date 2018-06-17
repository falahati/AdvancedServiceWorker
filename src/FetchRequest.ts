namespace AdvancedServiceWorker {
    export class FetchRequest {
        messages: string[] = [];
        request: Request;
        response: Response = null;
        rule: Rule;
        cache: BrowserCache;

        constructor(request: Request, rule: Rule, cache: BrowserCache) {
            this.request = request;
            this.rule = rule;
            this.cache = cache;
        }

        message(message: string) {
            this.messages.push(message);
        }

        wasSuccessful() {
            return !!(this.response);
        }

        end(message: string, response?: Response): Response {
            this.message(message);
            if (!this.wasSuccessful()) {
                this.response = response || null;
                this.message("End of operation.");
            }
            return this.response;
        }

        fatal(message: string): Promise<Response> {
            const error = new Error(message);
            this.message(`Operation failed. ${error}`);
            this.message(`Trying native fetch as the last resort.`);
            this.response = null;
            return fetch(this.request);
        }

        getResponse(): Promise<Response> {
            switch (this.rule.strategy) {
                case Strategies.NetworkFirst:
                    return this.strategyNetworkFirst();
                case Strategies.CacheFirst:
                    return this.strategyCacheFirst();
                case Strategies.NetworkOnly:
                    return this.strategyNetworkOnly();
                case Strategies.CacheOnly:
                    return this.strategyCacheOnly();
                case Strategies.Race:
                    return this.strategyRace();
                case Strategies.Disable:
                    this.end("Disabled");
                    return null;
            }
            return null;
        }

        private strategyNetworkFirst(): Promise<Response> {
            // load from network and if failed, try loading the cached version, if not available, serve the offline page
            return this.getLive(this.request).then(
                netResponse => {
                    this.message("Fetched from network.");
                    return this.cache.putResponse(this.request, netResponse.clone()).then(
                        () => this.end("Saved to cache.", netResponse),
                        (reason) => this.end(`Failed to save to cache. ${reason.toString()}`, netResponse)
                    );
                },
                (reason) => {
                    this.message(`Network failed, switching to cache. ${reason.toString()}`);
                    return this.cache.getResponse(this.request).then(
                        (cacheResponse) => this.end("Fetched from cache.", cacheResponse),
                        (reason) => {
                            this.message(`Cache failed, switching to offline page. ${reason.toString()}`);
                            if (!this.rule.offline) {
                                return this.fatal("Missing offline page.");
                            }
                            return this.cache.getResponse(this.rule.offline).then(
                                offlineResponse => this.end("Offline page served.", offlineResponse),
                                reason => this.fatal(`Cache failed for offline page. ${reason.toString()}`)
                            );
                        });
                });
        }

        private strategyCacheFirst(): Promise<Response> {
            // load from cache and if failed, try loading the live version from network,
            // if not available, serve the offline page
            return this.cache.getResponse(this.request).then(
                cacheResponse => this.end("Fetched from cache.", cacheResponse),
                (reason) => {
                    this.message(`Cache failed, switching to network. ${reason.toString()}`);
                    return this.getLive(this.request).then(netResponse => {
                            this.message("Fetched from network.");
                            return this.cache.putResponse(this.request, netResponse.clone()).then(
                                () => this.end("Saved to cache.", netResponse),
                                reason => this.end(`Failed to save to cache. ${reason.toString()}`,
                                    netResponse)
                            );
                        },
                        (reason) => {
                            this.message(`Network failed, switching to offline page. ${reason.toString()}`);
                            if (!this.rule.offline) {
                                return this.fatal("Missing offline page.");
                            }
                            return this.cache.getResponse(this.rule.offline).then(
                                offlineResponse => this.end("Offline page served.", offlineResponse),
                                reason => this.fatal(`Cache failed for offline page. ${reason.toString()}`)
                            );
                        });
                });
        }

        private strategyNetworkOnly(): Promise<Response> {
            // load from network and if failed, serve the offline cached page
            return this.getLive(this.request).then(
                netResponse => this.end("Fetched from network.", netResponse),
                reason => {
                    this.message(`Network failed, switching to offline page. ${reason.toString()}`);
                    if (!this.rule.offline) {
                        return this.fatal("Missing offline page.");
                    }
                    return this.cache.getResponse(this.rule.offline).then(
                        offlineResponse => this.end("Offline page served.", offlineResponse),
                        reason => this.fatal(`Cache failed for offline page. ${reason.toString()}`)
                    );
                });
        }

        private strategyCacheOnly(): Promise<Response> {
            // load from the cache and if failed, serve the offline cached page
            return this.cache.getResponse(this.request).then(
                cacheResponse => this.end("Fetched from cache.", cacheResponse),
                reason => {
                    this.message(`Cache failed, switching to offline page. ${reason.toString()}`);
                    if (!this.rule.offline) {
                        return this.fatal("Missing offline page.");
                    }
                    return this.cache.getResponse(this.rule.offline).then(
                        offlineResponse => this.end("Offline page served.", offlineResponse),
                        reason => this.fatal(`Cache failed for offline page. ${reason.toString()}`)
                    );
                }).catch(() => fetch(this.request));
        }

        private strategyRace(): Promise<Response> {
            // try loading from network and on timeout or failure, load the cached version,
            // if not available, serve the offline page

            var live = this.getLive(this.request).then(
                netResponse => {
                    this.message("Fetched from network.");
                    return this.cache.putResponse(this.request, netResponse.clone()).then(
                        () => this.end("Saved to cache.", netResponse),
                        (reason) => this.end(`Failed to save to cache. ${reason.toString()}`, netResponse)
                    );
                });


            var delay = this.rule.networkTimeout <= 0
                ? Promise.resolve({})
                : new Promise(fulfill => {
                    setTimeout(
                        () => {
                            this.message(`Network delay reached, trying cache...`);
                            fulfill();
                        },
                        this.rule.networkTimeout);
                });

            return (new Promise((fulfill, reject) => {
                var failed: number = 0;

                live.then(
                    fulfill,
                    reason => {
                        // if net failed, try cache, even if timeout not yet reached
                        failed++;
                        // if cache already failed, reject
                        if (failed >= 2) {
                            reject(reason);
                        } else {
                            // force the cache if not yet started
                            this.cache.getResponse(this.request).then(
                                cacheResponse => fulfill(this.end("Fetched from cache.", cacheResponse)),
                                reject
                            );
                        }
                    });

                delay.then(() =>
                    this.cache.getResponse(this.request).then(
                        cacheResponse => fulfill(this.end("Fetched from cache.", cacheResponse)),
                        reason => {
                            failed++;
                            // if net already failed, reject
                            if (failed >= 2) {
                                reject(reason);
                            }
                        }));
            }).catch((reason) => {
                this.message(`Race failed, switching to offline page. ${reason.toString()}`);
                if (!this.rule.offline) {
                    return this.fatal("Missing offline page.");
                }
                return this.cache.getResponse(this.rule.offline).then(
                    offlineResponse => this.end("Offline page served.", offlineResponse),
                    reason => this.fatal(`Cache failed for offline page. ${reason.toString()}`)
                );
            })) as Promise<Response>;
        }

        private getLive(request: Request): Promise<Response> {
            return fetch(request).then(
                response => {
                    // in case of no network connectivity, throw
                    if (!response) {
                        throw new Error("Network is not accessible.");
                    }

                    // 500, 502, 503 and 504 statuses should be ignored and have the same effect as losing network connectivity
                    if (response.status === 408 ||
                        response.status === 500 ||
                        response.status === 502 ||
                        response.status === 503 ||
                        response.status === 504) {
                        throw new Error("Bad network response.");
                    }

                    // we accept all other status codes as valid
                    return response;
                });
        }
    }
}