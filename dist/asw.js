var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class Condition {
        constructor(condition) {
            this.url = null;
            this.header = null;
            Object.assign(this, condition || {});
            if (this.url && (typeof this.url === "string" || this.url instanceof String)) {
                this.url = Condition.wildCardToRegEx(this.url);
            }
            if (this.header &&
                (typeof this.header === "string" || this.header instanceof String)) {
                this.header = Condition.wildCardToRegEx(this.header);
            }
        }
        static getRelativeUrl(url) {
            if ((url.indexOf("http://") === 0 || url.indexOf("https://") === 0) && url.indexOf("/", 8) !== -1) {
                url = url.substr(url.indexOf("/", 8));
            }
            return url;
        }
        doesMatch(request) {
            if (this.url &&
                (!request.url || !(this.url).test(Condition.getRelativeUrl(request.url)))) {
                return false;
            }
            if (this.header) {
                if (!request.headers) {
                    return false;
                }
                let matchAny = false;
                for (let pair of request.headers.entries()) {
                    const headerLine = pair[0] + ": " + pair[1];
                    if ((this.header).test(headerLine)) {
                        matchAny = true;
                        break;
                    }
                }
                if (!matchAny) {
                    return false;
                }
            }
            return true;
        }
        static wildCardToRegEx(str) {
            return new RegExp(`^${str.split("*").join(".*")}$`);
        }
    }
    AdvancedServiceWorker.Condition = Condition;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    let Strategies;
    (function (Strategies) {
        Strategies["Disable"] = "DISABLE";
        Strategies["CacheFirst"] = "CACHE_FIRST";
        Strategies["NetworkFirst"] = "NETWORK_FIRST";
        Strategies["CacheOnly"] = "CACHE_ONLY";
        Strategies["NetworkOnly"] = "NETWORK_ONLY";
        Strategies["Race"] = "RACE";
    })(Strategies = AdvancedServiceWorker.Strategies || (AdvancedServiceWorker.Strategies = {}));
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class Rule {
        constructor(rule) {
            this.conditions = [];
            this.strategy = AdvancedServiceWorker.Strategies.Disable;
            this.offline = null;
            this.networkTimeout = 3000;
            Object.assign(this, rule || {});
            for (let i = 0; i < this.conditions.length; i++) {
                this.conditions[i] = new AdvancedServiceWorker.Condition(this.conditions[i]);
            }
        }
        doesMatch(request) {
            for (let i = 0; i < this.conditions.length; i++) {
                if (this.conditions[i].doesMatch(request)) {
                    return true;
                }
            }
            return false;
        }
    }
    AdvancedServiceWorker.Rule = Rule;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class Options {
        constructor(options) {
            this.version = 0;
            this.storageName = "offline-cache";
            this.preload = [];
            this.scope = "/";
            this.filePath = "/asw.js";
            this.persistent = false;
            this.pushServerAddress = "";
            this.pushServerKey = null;
            this.pushUserVisibleOnly = true;
            this.debug = false;
            this.rules = [];
            Object.assign(this, options || {});
            for (let i = 0; i < this.rules.length; i++) {
                if (this.rules[i].offline && this.preload.indexOf(this.rules[i].offline) === -1) {
                    this.preload.push(this.rules[i].offline);
                }
                this.rules[i] = new AdvancedServiceWorker.Rule(this.rules[i]);
            }
        }
    }
    AdvancedServiceWorker.Options = Options;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    let ActionTypes;
    (function (ActionTypes) {
        ActionTypes["Notification"] = "NOTIFICATION";
        ActionTypes["ClearCache"] = "CLEAECACHE";
        ActionTypes["Preload"] = "PRELOAD";
        ActionTypes["Reload"] = "RELOAD";
        ActionTypes["Broadcast"] = "BROADCAST";
    })(ActionTypes = AdvancedServiceWorker.ActionTypes || (AdvancedServiceWorker.ActionTypes = {}));
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class Action {
        constructor(actionType) {
            this.actionType = actionType;
        }
    }
    AdvancedServiceWorker.Action = Action;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class Message {
        constructor(scope, data) {
            this.scope = scope;
            this.data = typeof data === "undefined" ? null : data;
        }
        equal(other) {
            return this.scope === other.scope && JSON.stringify(this) === JSON.stringify(other);
        }
    }
    AdvancedServiceWorker.Message = Message;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class RequestMessage extends AdvancedServiceWorker.Message {
        constructor(scope, data) {
            super(scope, data);
        }
    }
    AdvancedServiceWorker.RequestMessage = RequestMessage;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class ResponseMessage extends AdvancedServiceWorker.Message {
        constructor(scope, request, data) {
            super(scope, data);
            this.request = request;
        }
    }
    AdvancedServiceWorker.ResponseMessage = ResponseMessage;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Actions;
    (function (Actions) {
        class Broadcast extends AdvancedServiceWorker.Action {
            constructor(message) {
                super(AdvancedServiceWorker.ActionTypes.Broadcast);
                this.message = message;
            }
        }
        Actions.Broadcast = Broadcast;
    })(Actions = AdvancedServiceWorker.Actions || (AdvancedServiceWorker.Actions = {}));
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Actions;
    (function (Actions) {
        class ClearCache extends AdvancedServiceWorker.Action {
            constructor(condition) {
                super(AdvancedServiceWorker.ActionTypes.ClearCache);
                this.condition = condition || null;
            }
        }
        Actions.ClearCache = ClearCache;
    })(Actions = AdvancedServiceWorker.Actions || (AdvancedServiceWorker.Actions = {}));
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Actions;
    (function (Actions) {
        class Notification extends AdvancedServiceWorker.Action {
            constructor(title, options, targetUrl) {
                super(AdvancedServiceWorker.ActionTypes.Notification);
                this.title = title;
                this.options = (options || {});
                this.options.data = Object.assign(this.options.data || {}, { url: targetUrl });
            }
        }
        Actions.Notification = Notification;
    })(Actions = AdvancedServiceWorker.Actions || (AdvancedServiceWorker.Actions = {}));
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Actions;
    (function (Actions) {
        class Preload extends AdvancedServiceWorker.Action {
            constructor(urls) {
                super(AdvancedServiceWorker.ActionTypes.Preload);
                this.urls = urls;
            }
        }
        Actions.Preload = Preload;
    })(Actions = AdvancedServiceWorker.Actions || (AdvancedServiceWorker.Actions = {}));
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class BrowserDatabase {
        static getIdb(type, callback) {
            return new Promise((resolve, reject) => {
                const openreq = indexedDB.open(this.databaseName, 1);
                openreq.onerror = () => reject(openreq.error);
                openreq.onsuccess = () => resolve(openreq.result);
                openreq.onupgradeneeded = () => {
                    openreq.result.createObjectStore(this.storeName);
                };
            }).then((db) => new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, type);
                transaction.oncomplete = () => resolve();
                transaction.onabort = transaction.onerror = () => reject(transaction.error);
                callback(transaction.objectStore(this.storeName));
            }));
        }
        static saveOptions(options) {
            const scope = AdvancedServiceWorker.Condition.getRelativeUrl(options.scope);
            return BrowserDatabase.getIdb("readwrite", (store) => {
                store.put(options, scope);
            }).then(() => true, (c) => {
                console.log(c);
                return false;
            });
        }
        static loadOptions(scope) {
            scope = AdvancedServiceWorker.Condition.getRelativeUrl(scope);
            let request;
            return BrowserDatabase.getIdb("readonly", (store) => {
                request = store.get(scope);
            }).then(() => request.result, () => null);
        }
    }
    BrowserDatabase.databaseName = "advanced-service-worker";
    BrowserDatabase.storeName = "keyval";
    AdvancedServiceWorker.BrowserDatabase = BrowserDatabase;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class BrowserCache {
        constructor(name, version) {
            if (version) {
                name += `-v${version}`;
            }
            this.storageName = name;
        }
        open() {
            return caches.open(this.storageName);
        }
        remove(condition) {
            if (!condition) {
                return caches.delete(this.storageName);
            }
            else if (typeof condition === "string" ||
                condition instanceof String ||
                condition instanceof RegExp) {
                if (!(condition instanceof RegExp)) {
                    condition = AdvancedServiceWorker.Condition.wildCardToRegEx((condition));
                }
                return this.open().then(cache => cache.keys().then(keys => {
                    const promises = [];
                    keys.forEach(request => {
                        if (request.url && condition.test(request.url)) {
                            promises.push(cache.delete(request));
                        }
                    });
                    if (!promises.length) {
                        return Promise.resolve(false);
                    }
                    return Promise.all(promises).then(results => {
                        for (let i = 0; i < results.length; i++) {
                            if (results[i]) {
                                return true;
                            }
                        }
                        return false;
                    }, () => false);
                }));
            }
            else if (condition instanceof Array && condition.length) {
                return this.open().then(cache => {
                    const promises = [];
                    for (let i = 0; i < condition.length; i++) {
                        promises.push(cache.delete((condition[i])));
                    }
                    return Promise.all(promises).then(results => {
                        for (let j = 0; j < results.length; j++) {
                            if (results[j]) {
                                return true;
                            }
                        }
                        return false;
                    }, () => false);
                });
            }
            else {
                return Promise.resolve(false);
            }
        }
        preloadUrls(urls, version) {
            if (!urls) {
                return Promise.resolve(false);
            }
            return this.open().then((cache) => cache.addAll(urls).then(() => true, () => {
                console.error("Failed to add preload pages to cache.");
                return false;
            }), () => {
                console.error("Failed to open cache.");
                return false;
            });
        }
        putResponse(request, response) {
            if (!response) {
                throw new Error("Can not add an empty response to cache.");
            }
            if (response.status !== 200 &&
                response.status !== 204 &&
                response.status !== 300 &&
                response.status !== 301 &&
                response.status !== 303 &&
                response.status !== 308) {
                return Promise.resolve();
            }
            return this.open().then(cache => cache.put(request, response));
        }
        getResponse(request) {
            return this.open().then(cache => cache.match(request).then((response) => {
                if (response) {
                    return response;
                }
                throw new Error("Cache contains empty response.");
            }));
        }
    }
    AdvancedServiceWorker.BrowserCache = BrowserCache;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class Controller {
        constructor(optionsObject) {
            this.options = new AdvancedServiceWorker.Options(optionsObject);
            this.eventElement = document.createElement("eventElement");
            Controller.addGlobalEventListener("message", (e) => {
                var message = e.detail.data;
                if (message.scope === this.options.scope) {
                    this.eventElement.dispatchEvent(new CustomEvent("message", { detail: message.data }));
                }
            });
        }
        static addGlobalEventListener(event, listener, options) {
            Controller.staticEventElement.addEventListener(event, listener, options);
        }
        addEventListener(event, listener, options) {
            this.eventElement.addEventListener(event, listener, options);
        }
        postMessage(action) {
            return new Promise((resolve, reject) => {
                if (!Controller.isInstalled()) {
                    reject(new Error("Service worker is not installed."));
                }
                const request = new AdvancedServiceWorker.RequestMessage(this.options.scope, action);
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = event => {
                    const response = (event.data);
                    if (response.scope === this.options.scope && response.request && request.equal(response.request)) {
                        resolve(response.data);
                    }
                };
                self.navigator.serviceWorker.controller.postMessage(request, [messageChannel.port2]);
                setTimeout(() => {
                    reject(new Error("Response timeout."));
                }, 100);
            });
        }
        showNotification(title, notificationOptions, targetUrl) {
            return this.postMessage(new AdvancedServiceWorker.Actions.Notification(title, notificationOptions, targetUrl));
        }
        reload() {
            return this.postMessage(new AdvancedServiceWorker.Action(AdvancedServiceWorker.ActionTypes.Reload));
        }
        clearCache(condition) {
            return this.postMessage(new AdvancedServiceWorker.Actions.ClearCache(condition));
        }
        preload(urls) {
            return this.postMessage(new AdvancedServiceWorker.Actions.Preload(urls));
        }
        broadcast(message) {
            return this.postMessage(new AdvancedServiceWorker.Actions.Broadcast(message));
        }
        ensureInstalled() {
            if (!Controller.isSupported()) {
                console.error("Service workers are not supported.");
                return Promise.resolve(false);
            }
            var serviceFilePath = this.options.filePath;
            if (this.options.version) {
                serviceFilePath = serviceFilePath + "?v=" + this.options.version;
            }
            return AdvancedServiceWorker.BrowserDatabase.loadOptions(this.options.scope).then(currentOptions => {
                const isInstalled = !!(self.navigator.serviceWorker.controller);
                const needsUpdate = isInstalled &&
                    (!currentOptions || JSON.stringify(currentOptions) !== JSON.stringify(this.options));
                if (isInstalled && !needsUpdate) {
                    console.debug("Active service worker found, no need to register.");
                }
                else {
                    return AdvancedServiceWorker.BrowserDatabase.saveOptions(this.options).then(() => {
                        return navigator.serviceWorker.register(serviceFilePath, { scope: this.options.scope }).then(registration => {
                            console.info(`Service worker has been registered for scope: ${registration.scope}`);
                            if (needsUpdate) {
                                return registration.update().then(() => {
                                    this.reload();
                                    console.info("Service worker has been updated.");
                                    return true;
                                });
                            }
                            return true;
                        });
                    }).catch(() => {
                        console.error("Failed to register or update the service worker.");
                        return false;
                    });
                }
                return false;
            });
        }
        static isSupported() {
            return ("serviceWorker" in self.navigator) && ("storage" in self.navigator);
        }
        static isInstalled() {
            return Controller.isSupported && !!(self.navigator.serviceWorker.controller);
        }
    }
    Controller.staticConstructor = (() => {
        if (Controller.isSupported && ("document" in self)) {
            Controller.staticEventElement = document.createElement("eventElement");
            self.navigator.serviceWorker.addEventListener("message", e => {
                Controller.staticEventElement.dispatchEvent(new CustomEvent("message", { detail: e }));
            });
            self.navigator.serviceWorker.addEventListener("controllerchange", e => {
                Controller.staticEventElement.dispatchEvent(new CustomEvent("controllerchange", { detail: e }));
            });
            self.navigator.serviceWorker.addEventListener("messageerror", e => {
                Controller.staticEventElement.dispatchEvent(new CustomEvent("messageerror", { detail: e }));
            });
        }
    })();
    AdvancedServiceWorker.Controller = Controller;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class FetchRequest {
        constructor(request, rule, cache) {
            this.messages = [];
            this.response = null;
            this.request = request;
            this.rule = rule;
            this.cache = cache;
        }
        message(message) {
            this.messages.push(message);
        }
        wasSuccessful() {
            return !!(this.response);
        }
        end(message, response) {
            this.message(message);
            if (!this.wasSuccessful()) {
                this.response = response || null;
                this.message("End of operation.");
            }
            return this.response;
        }
        fatal(message) {
            const error = new Error(message);
            this.message(`Operation failed. ${error}`);
            this.message(`Trying native fetch as the last resort.`);
            this.response = null;
            return fetch(this.request);
        }
        getResponse() {
            switch (this.rule.strategy) {
                case AdvancedServiceWorker.Strategies.NetworkFirst:
                    return this.strategyNetworkFirst();
                case AdvancedServiceWorker.Strategies.CacheFirst:
                    return this.strategyCacheFirst();
                case AdvancedServiceWorker.Strategies.NetworkOnly:
                    return this.strategyNetworkOnly();
                case AdvancedServiceWorker.Strategies.CacheOnly:
                    return this.strategyCacheOnly();
                case AdvancedServiceWorker.Strategies.Race:
                    return this.strategyRace();
                case AdvancedServiceWorker.Strategies.Disable:
                    this.end("Disabled");
                    return null;
            }
            return null;
        }
        strategyNetworkFirst() {
            return this.getLive(this.request).then(netResponse => {
                this.message("Fetched from network.");
                return this.cache.putResponse(this.request, netResponse.clone()).then(() => this.end("Saved to cache.", netResponse), (reason) => this.end(`Failed to save to cache. ${reason.toString()}`, netResponse));
            }, (reason) => {
                this.message(`Network failed, switching to cache. ${reason.toString()}`);
                return this.cache.getResponse(this.request).then((cacheResponse) => this.end("Fetched from cache.", cacheResponse), (reason) => {
                    this.message(`Cache failed, switching to offline page. ${reason.toString()}`);
                    if (!this.rule.offline) {
                        return this.fatal("Missing offline page.");
                    }
                    return this.cache.getResponse(this.rule.offline).then(offlineResponse => this.end("Offline page served.", offlineResponse), reason => this.fatal(`Cache failed for offline page. ${reason.toString()}`));
                });
            });
        }
        strategyCacheFirst() {
            return this.cache.getResponse(this.request).then(cacheResponse => this.end("Fetched from cache.", cacheResponse), (reason) => {
                this.message(`Cache failed, switching to network. ${reason.toString()}`);
                return this.getLive(this.request).then(netResponse => {
                    this.message("Fetched from network.");
                    return this.cache.putResponse(this.request, netResponse.clone()).then(() => this.end("Saved to cache.", netResponse), reason => this.end(`Failed to save to cache. ${reason.toString()}`, netResponse));
                }, (reason) => {
                    this.message(`Network failed, switching to offline page. ${reason.toString()}`);
                    if (!this.rule.offline) {
                        return this.fatal("Missing offline page.");
                    }
                    return this.cache.getResponse(this.rule.offline).then(offlineResponse => this.end("Offline page served.", offlineResponse), reason => this.fatal(`Cache failed for offline page. ${reason.toString()}`));
                });
            });
        }
        strategyNetworkOnly() {
            return this.getLive(this.request).then(netResponse => this.end("Fetched from network.", netResponse), reason => {
                this.message(`Network failed, switching to offline page. ${reason.toString()}`);
                if (!this.rule.offline) {
                    return this.fatal("Missing offline page.");
                }
                return this.cache.getResponse(this.rule.offline).then(offlineResponse => this.end("Offline page served.", offlineResponse), reason => this.fatal(`Cache failed for offline page. ${reason.toString()}`));
            });
        }
        strategyCacheOnly() {
            return this.cache.getResponse(this.request).then(cacheResponse => this.end("Fetched from cache.", cacheResponse), reason => {
                this.message(`Cache failed, switching to offline page. ${reason.toString()}`);
                if (!this.rule.offline) {
                    return this.fatal("Missing offline page.");
                }
                return this.cache.getResponse(this.rule.offline).then(offlineResponse => this.end("Offline page served.", offlineResponse), reason => this.fatal(`Cache failed for offline page. ${reason.toString()}`));
            }).catch(() => fetch(this.request));
        }
        strategyRace() {
            var live = this.getLive(this.request).then(netResponse => {
                this.message("Fetched from network.");
                return this.cache.putResponse(this.request, netResponse.clone()).then(() => this.end("Saved to cache.", netResponse), (reason) => this.end(`Failed to save to cache. ${reason.toString()}`, netResponse));
            });
            var delay = this.rule.networkTimeout <= 0
                ? Promise.resolve({})
                : new Promise(fulfill => {
                    setTimeout(() => {
                        this.message(`Network delay reached, trying cache...`);
                        fulfill();
                    }, this.rule.networkTimeout);
                });
            return (new Promise((fulfill, reject) => {
                var failed = 0;
                live.then(fulfill, reason => {
                    failed++;
                    if (failed >= 2) {
                        reject(reason);
                    }
                    else {
                        this.cache.getResponse(this.request).then(cacheResponse => fulfill(this.end("Fetched from cache.", cacheResponse)), reject);
                    }
                });
                delay.then(() => this.cache.getResponse(this.request).then(cacheResponse => fulfill(this.end("Fetched from cache.", cacheResponse)), reason => {
                    failed++;
                    if (failed >= 2) {
                        reject(reason);
                    }
                }));
            }).catch((reason) => {
                this.message(`Race failed, switching to offline page. ${reason.toString()}`);
                if (!this.rule.offline) {
                    return this.fatal("Missing offline page.");
                }
                return this.cache.getResponse(this.rule.offline).then(offlineResponse => this.end("Offline page served.", offlineResponse), reason => this.fatal(`Cache failed for offline page. ${reason.toString()}`));
            }));
        }
        getLive(request) {
            return fetch(request).then(response => {
                if (!response) {
                    throw new Error("Network is not accessible.");
                }
                if (response.status === 408 ||
                    response.status === 500 ||
                    response.status === 502 ||
                    response.status === 503 ||
                    response.status === 504) {
                    throw new Error("Bad network response.");
                }
                return response;
            });
        }
    }
    AdvancedServiceWorker.FetchRequest = FetchRequest;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    class ServiceWorker {
        constructor() {
            this.cachedOptions = null;
            self.addEventListener("activate", this.onActivate.bind(this));
            self.addEventListener("install", this.onInstall.bind(this));
            self.addEventListener("fetch", this.onFetch.bind(this));
            self.addEventListener("sync", this.onSync.bind(this));
            self.addEventListener("pushsubscriptionchange", this.onPushSubscriptionChange.bind(this));
            self.addEventListener("notificationclick", this.onNotificationClick.bind(this));
            self.addEventListener("push", this.onPush.bind(this));
            self.addEventListener("message", this.onMessage.bind(this));
        }
        onInstall(event) {
            this.debug("Processing install event...", event);
            event.waitUntil(self.skipWaiting().then(this.reload.bind(this)));
        }
        onActivate(event) {
            this.debug("Processing activate event...", event);
            event.waitUntil(this.getOptions().then(() => {
                self.clients.claim();
            }));
        }
        onFetch(event) {
            if (event.request &&
                event.request.method === "GET" &&
                event.request.url &&
                (event.request.url.indexOf("http://") === 0 || event.request.url.indexOf("https://") === 0)) {
                let fetchRequest;
                let response;
                event.waitUntil(this.getOptions().then((options) => {
                    return this.getMatchedRule(event.request).then((rule) => {
                        if (rule) {
                            const cache = new AdvancedServiceWorker.BrowserCache(options.storageName, options.version);
                            fetchRequest = new AdvancedServiceWorker.FetchRequest(event.request, rule, cache);
                            response = fetchRequest.getResponse();
                        }
                        if (response) {
                            event.respondWith(response.then(fetchResponse => {
                                if (fetchResponse && fetchRequest.wasSuccessful()) {
                                    this.debug("Service worker intercepted the request: ", fetchRequest);
                                }
                                else {
                                    this.debug("Service worker failed to provide a response: ", fetchRequest);
                                }
                                return fetchResponse;
                            }, reason => {
                                this.debug("Request failed with unexpected error: ", fetchRequest);
                                throw reason;
                            }));
                        }
                        else {
                            this.debug("Request handled by the browser: ", fetchRequest ? fetchRequest : event.request);
                        }
                    });
                }));
            }
        }
        onPush(event) {
            if (event.data) {
                const action = event.data.json();
                if (action) {
                    event.waitUntil(this.processAction(action));
                }
            }
        }
        onPushSubscriptionChange(event) {
            this.debug("Push subscription changed: ", event);
            event.waitUntil(this.checkPushServiceStatus(true));
        }
        onNotificationClick(event) {
            this.debug("Notification clicked: ", event.notification);
            event.notification.close();
            if (event.notification.data && event.notification.data.url) {
                event.waitUntil(self.clients.matchAll({
                    type: "window"
                }).then(clientList => {
                    for (let i = 0; i < clientList.length; i++) {
                        const client = clientList[i];
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
        onSync(event) {
            this.debug("Sync request: ", event);
            event.waitUntil(this.reload());
        }
        onMessage(event) {
            this.debug("New message recieved: ", event);
            event.waitUntil(this.getOptions().then((options) => {
                var message = (event.data);
                if (message.scope === options.scope) {
                    return this.processAction(message.data).then(actionResult => {
                        var response = new AdvancedServiceWorker.ResponseMessage(options.scope, message, JSON.parse(JSON.stringify(actionResult)));
                        event.ports[0].postMessage(response);
                    });
                }
                return Promise.resolve();
            }));
        }
        debug(message, ...optionalParams) {
            if (!this.cachedOptions || this.cachedOptions.debug) {
                console.debug(message, ...optionalParams);
            }
        }
        getOptions(force) {
            if (!force && this.cachedOptions) {
                return Promise.resolve(this.cachedOptions);
            }
            return AdvancedServiceWorker.BrowserDatabase.loadOptions(self.registration.scope).then(options => {
                this.cachedOptions = new AdvancedServiceWorker.Options(options);
                if (!this.cachedOptions) {
                    throw new Error("Missing service worker options in IndexedDB.");
                }
                return this.cachedOptions;
            });
        }
        processAction(action) {
            if (action.actionType) {
                switch (action.actionType) {
                    case AdvancedServiceWorker.ActionTypes.Notification:
                        return this.showNotification(action.title, action.options);
                    case AdvancedServiceWorker.ActionTypes.ClearCache:
                        return this.getOptions().then((options) => {
                            return new AdvancedServiceWorker.BrowserCache(options.storageName, options.version)
                                .remove(action.condition);
                        });
                    case AdvancedServiceWorker.ActionTypes.Preload:
                        return this.preload(action.urls);
                    case AdvancedServiceWorker.ActionTypes.Broadcast:
                        return this.broadcast(action.message);
                    case AdvancedServiceWorker.ActionTypes.Reload:
                        return this.reload();
                }
            }
            return Promise.resolve(false);
        }
        showNotification(title, notificationOptions) {
            this.debug("New notification: ", title, notificationOptions);
            if (!title) {
                return Promise.resolve(false);
            }
            return self.registration.showNotification(title, notificationOptions || {}).then(() => true).catch(e => {
                console.warn("Can not show notification: ", e);
                return false;
            });
        }
        preload(urls) {
            return this.getOptions().then((options) => {
                urls = urls || options.preload;
                if (!urls || (urls instanceof Array && urls.length === 0)) {
                    return Promise.resolve(true);
                }
                if (typeof urls === "string" || urls instanceof String) {
                    urls = [urls];
                }
                return (new AdvancedServiceWorker.BrowserCache(options.storageName, options.version)).preloadUrls(urls);
            }).catch(() => false);
        }
        broadcast(message) {
            this.debug("Broadcasting message: ", message);
            if (!message) {
                return Promise.resolve(false);
            }
            return this.getOptions().then((options) => {
                return self.clients.matchAll().then(clientList => {
                    if (clientList.length > 0) {
                        for (let i = 0; i < clientList.length; i++) {
                            clientList[i].postMessage(new AdvancedServiceWorker.Message(options.scope, message));
                        }
                        return true;
                    }
                    return false;
                });
            });
        }
        reload() {
            return this.getOptions(true).then((options) => {
                return Promise.all([
                    this.preload(),
                    this.checkPersistence(),
                    this.checkPushServiceStatus(false)
                ]).then(() => {
                    this.debug(`Clear old caches... (< v${options.version})`);
                    const promises = [];
                    for (let i = 0; i < options.version; i++) {
                        promises.push(new AdvancedServiceWorker.BrowserCache(options.storageName, i).remove());
                    }
                    return Promise.all(promises).then(() => true);
                });
            }).catch(() => false);
        }
        checkPushServiceStatus(forceSubscription) {
            return this.getOptions().then((options) => {
                var pushOptions = {
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
                                    }
                                    else {
                                        console.warn("Push service subsription request denied.");
                                    }
                                }).catch(e => {
                                    console.warn("Failed to subscribe from push service.", e);
                                });
                            }
                            else if (subscription && !options.pushServerAddress) {
                                self.registration.pushManager.unsubscribe().then(success => {
                                    if (success) {
                                        this.reportPushSubscriptionStatus(null).catch(() => {
                                            console.warn("Failed to send subscription changes to the server.");
                                        });
                                    }
                                    else {
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
                    }
                    else {
                        this.debug("Push service requests rejected: ", error);
                    }
                });
            });
        }
        reportPushSubscriptionStatus(subscription) {
            return this.getOptions().then((options) => {
                return new Promise((fulfill, reject) => {
                    if (!options.pushServerAddress) {
                        reject();
                    }
                    var httpRequest = new XMLHttpRequest();
                    httpRequest.onload = () => {
                        if (httpRequest.status === 200) {
                            fulfill();
                        }
                        else {
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
        checkPersistence() {
            return this.getOptions().then((options) => {
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
        getMatchedRule(request) {
            return this.getOptions().then((options) => {
                for (let i = 0; i < options.rules.length; i++) {
                    const rule = options.rules[i];
                    if (rule.doesMatch(request)) {
                        return rule;
                    }
                }
                return null;
            });
        }
    }
    ServiceWorker.staticConstructor = (() => {
        if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
            const serviceWorker = new ServiceWorker();
        }
    })();
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
//# sourceMappingURL=asw.js.map