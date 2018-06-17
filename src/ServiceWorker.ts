/// <reference path="../node_modules/typescript/lib/lib.webworker.d.ts" />
/// <reference path="../typings/serviceworker.d.ts" />

module AdvancedServiceWorker {
    declare var self: ServiceWorkerGlobalScope;

    class ServiceWorker {
        private cachedOptions: Options = null;

        static staticConstructor = (() => {
            if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
                // ReSharper disable once UnusedLocals
                const serviceWorker = new ServiceWorker();
            }
        })();

        private constructor() {
            // ReSharper disable Html.EventNotResolved
            self.addEventListener("activate", this.onActivate.bind(this));
            self.addEventListener("install", this.onInstall.bind(this));
            self.addEventListener("fetch", this.onFetch.bind(this));
            self.addEventListener("sync", this.onSync.bind(this));
            self.addEventListener("pushsubscriptionchange", this.onPushSubscriptionChange.bind(this));
            self.addEventListener("notificationclick", this.onNotificationClick.bind(this));
            self.addEventListener("push", this.onPush.bind(this));
            self.addEventListener("message", this.onMessage.bind(this));
            // ReSharper restore Html.EventNotResolved
        }

        private onInstall(event: ExtendableEvent): void {
            this.debug("Processing install event...", event);
            event.waitUntil(self.skipWaiting().then(this.reload.bind(this)));
        }

        private onActivate(event: ExtendableEvent): void {
            this.debug("Processing activate event...", event);
            event.waitUntil(this.getOptions().then(() => {
                self.clients.claim();
            }));
        }

        private onFetch(event: FetchEvent): void {
            if (event.request &&
                event.request.method === "GET" &&
                event.request.url &&
                (event.request.url.indexOf("http://") === 0 || event.request.url.indexOf("https://") === 0)) {
                let fetchRequest: FetchRequest;
                let response: Promise<Response>;
                event.waitUntil(
                    this.getOptions().then((options: Options) => {
                        return this.getMatchedRule(event.request).then((rule) => {
                            if (rule) {
                                const cache = new BrowserCache(options.storageName, options.version);
                                fetchRequest = new FetchRequest(event.request, rule, cache);
                                response = fetchRequest.getResponse();
                            }
                            if (response) {
                                event.respondWith(
                                    response.then(fetchResponse => {
                                            if (fetchResponse && fetchRequest.wasSuccessful()) {
                                                this.debug("Service worker intercepted the request: ", fetchRequest);
                                            } else {
                                                this.debug("Service worker failed to provide a response: ",
                                                    fetchRequest);
                                            }
                                            return fetchResponse;
                                        },
                                        reason => {
                                            this.debug("Request failed with unexpected error: ", fetchRequest);
                                            throw reason;
                                        })
                                );
                            } else {
                                this.debug("Request handled by the browser: ",
                                    fetchRequest ? fetchRequest : event.request);
                            }
                        });
                    }));
            }
        }

        private onPush(event: PushEvent): void {
            if (event.data) {
                const action = event.data.json() as Action;
                if (action) {
                    event.waitUntil(this.processAction(action));
                }
            }
        }

        private onPushSubscriptionChange(event: PushSubscriptionChangeEvent): void {
            this.debug("Push subscription changed: ", event);
            event.waitUntil(this.checkPushServiceStatus(true));
        }

        private onNotificationClick(event: NotificationEvent): void {
            this.debug("Notification clicked: ", event.notification);
            event.notification.close();

            if (event.notification.data && event.notification.data.url) {
                event.waitUntil(self.clients.matchAll({
                    type: "window"
                }).then(clientList => {
                    for (let i: number = 0; i < clientList.length; i++) {
                        const client: Client = clientList[i];
                        if (client.url === event.notification.data.url && "focus" in client) {
                            return client.focus();
                        }
                    }
                    if (self.clients.openWindow) {
                        return self.clients.openWindow(event.notification.data.url);
                    }
                    return false;
                }));
            }
        }

        private onSync(event: SyncEvent): void {
            this.debug("Sync request: ", event);
            event.waitUntil(this.reload());
        }

        private onMessage(event: ExtendableMessageEvent): void {
            this.debug("New message recieved: ", event);
            event.waitUntil(this.getOptions().then((options: Options) => {
                var message = (event.data) as RequestMessage;
                if (message.scope === options.scope) {
                    return this.processAction(message.data).then(actionResult => {
                        var response = new ResponseMessage(
                            options.scope,
                            message,
                            JSON.parse(JSON.stringify(actionResult)));
                        event.ports[0].postMessage(response);
                    });
                }
                return Promise.resolve();
            }));
        }

        private debug(message?: any, ...optionalParams: any[]): void {
            if (!this.cachedOptions || this.cachedOptions.debug) {
                // tslint:disable-next-line:no-console
                console.debug(message, ...optionalParams);
            }
        }

        private getOptions(force?: boolean): Promise<Options> {
            if (!force && this.cachedOptions) {
                return Promise.resolve(this.cachedOptions);
            }
            return BrowserDatabase.loadOptions(self.registration.scope).then(options => {
                this.cachedOptions = new Options(options);
                if (!this.cachedOptions) {
                    throw new Error("Missing service worker options in IndexedDB.");
                }
                return this.cachedOptions;
            });
        }

        private processAction(action: Action): Promise<any> {
            if (action.actionType) {
                switch (action.actionType) {
                    case ActionTypes.Notification:
                        return this.showNotification(
                            (action as Actions.Notification).title,
                            (action as Actions.Notification).options);
                    case ActionTypes.ClearCache:
                        return this.getOptions().then((options) => {
                            return new BrowserCache(options.storageName, options.version)
                                .remove((action as Actions.ClearCache).condition);
                        });
                    case ActionTypes.Preload:
                        return this.preload((action as Actions.Preload).urls);
                    case ActionTypes.Broadcast:
                        return this.broadcast((action as Actions.Broadcast).message);
                    case ActionTypes.Reload:
                        return this.reload();
                }
            }
            return Promise.resolve(false);
        }

        private showNotification(title: string, notificationOptions: NotificationOptions): Promise<boolean> {
            this.debug("New notification: ", title, notificationOptions);
            if (!title) {
                return Promise.resolve(false);
            }
            return self.registration.showNotification(title, notificationOptions || {}).then(() => true).catch(e => {
                console.warn("Can not show notification: ", e);
                return false;
            });
        }

        private preload(urls?: string[] | string | String): Promise<boolean> {
            return this.getOptions().then((options: Options) => {
                urls = urls || options.preload;
                if (!urls || (urls instanceof Array && urls.length === 0)) {
                    return Promise.resolve(true);
                }
                if (typeof urls === "string" || urls instanceof String) {
                    urls = [urls as string];
                }
                return (new BrowserCache(options.storageName, options.version)).preloadUrls(urls as any);
            }).catch(() => false);
        }

        private broadcast(message: any): Promise<boolean> {
            this.debug("Broadcasting message: ", message);
            if (!message) {
                return Promise.resolve(false);
            }
            return this.getOptions().then((options: Options) => {
                return self.clients.matchAll().then(clientList => {
                    if (clientList.length > 0) {
                        for (let i: number = 0; i < clientList.length; i++) {
                            clientList[i].postMessage(new Message(options.scope, message));
                        }
                        return true;
                    }
                    return false;
                });
            });
        }

        private reload(): Promise<boolean> {
            return this.getOptions(true).then((options: Options) => {
                return Promise.all([
                    this.preload(),
                    this.checkPersistence(),
                    this.checkPushServiceStatus(false)
                ]).then(() => {
                    this.debug(`Clear old caches... (< v${options.version})`);
                    const promises: Promise<boolean>[] = [];
                    for (let i: number = 0; i < options.version; i++) {
                        promises.push(new BrowserCache(options.storageName, i).remove());
                    }
                    return Promise.all(promises).then(() => true);
                });
            }).catch(() => false);
        }

        private checkPushServiceStatus(forceSubscription: boolean): Promise<void> {
            return this.getOptions().then((options: Options) => {
                var pushOptions: PushSubscriptionOptions = {
                    userVisibleOnly: options.pushUserVisibleOnly,
                    applicationServerKey: options.pushServerKey
                };
                return self.registration.pushManager.permissionState(pushOptions).then(permission => {
                    if (permission === "granted") {
                        return self.registration.pushManager.getSubscription().then(subscription => {
                            if ((!subscription || forceSubscription) && options.pushServerAddress) {
                                self.registration.pushManager.subscribe(pushOptions).then(subscription => {
                                    if (subscription) {
                                        this.reportPushSubscriptionStatus(subscription).catch(() => {
                                            console.warn("Failed to send subscription changes to the server.");
                                        });
                                    } else {
                                        console.warn("Push service subsription request denied.");
                                    }
                                }).catch(e => {
                                    console.warn("Failed to subscribe from push service.", e);
                                });
                            } else if (subscription && !options.pushServerAddress) {
                                self.registration.pushManager.unsubscribe().then(success => {
                                    if (success) {
                                        this.reportPushSubscriptionStatus(null).catch(() => {
                                            console.warn("Failed to send subscription changes to the server.");
                                        });
                                    } else {
                                        console.warn("Push service unsubsription request denied.");
                                    }
                                }).catch(e => {
                                    console.warn("Failed to unsubscribe from push service.", e);
                                });
                            }
                        }).catch(e => {
                            console.warn("Failed to get push service subscription status.", e);
                        });
                    }
                    return Promise.resolve();
                }).catch(error => {
                    if (options.pushServerAddress) {
                        console.warn("Push service requests rejected: ", error);
                    } else {
                        this.debug("Push service requests rejected: ", error);
                    }
                });
            });
        }

        private reportPushSubscriptionStatus(subscription: PushSubscription): Promise<{}> {
            return this.getOptions().then((options: Options) => {
                return new Promise((fulfill, reject) => {
                    if (!options.pushServerAddress) {
                        reject();
                    }
                    var httpRequest = new XMLHttpRequest();
                    httpRequest.onload = () => {
                        if (httpRequest.status === 200) {
                            fulfill();
                        } else {
                            reject();
                        }
                    };
                    httpRequest.onerror = reject;
                    httpRequest.onabort = reject;
                    httpRequest.open("POST", options.pushServerAddress);
                    httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    httpRequest.send(JSON.stringify(subscription));
                });
            });
        }

        private checkPersistence(): Promise<boolean> {
            return this.getOptions().then((options: Options) => {
                if (options.persistent && self.navigator.storage && self.navigator.storage.persist) {
                    return self.navigator.storage.persisted().then(persistent => {
                        if (!persistent) {
                            self.navigator.storage.persist().catch(() => {
                                console.warn("Failed to make storage persistance.");
                                return false;
                            });
                        }
                        return true;
                    });
                }
                return Promise.resolve(!options.persistent);
            });
        }

        private getMatchedRule(request: Request): Promise<Rule> {
            return this.getOptions().then((options: Options) => {
                for (let i: number = 0; i < options.rules.length; i++) {
                    const rule: Rule = options.rules[i];
                    if (rule.doesMatch(request)) {
                        return rule;
                    }
                }
                return null;
            });
        }
    }
}