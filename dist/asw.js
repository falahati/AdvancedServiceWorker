var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Condition = (function () {
        function Condition(condition) {
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
        Condition.getRelativeUrl = function (url) {
            if ((url.indexOf("http://") === 0 || url.indexOf("https://") === 0) && url.indexOf("/", 8) !== -1) {
                url = url.substr(url.indexOf("/", 8));
            }
            return url;
        };
        Condition.prototype.doesMatch = function (request) {
            if (this.url &&
                (!request.url || !(this.url).test(Condition.getRelativeUrl(request.url)))) {
                return false;
            }
            if (this.header) {
                if (!request.headers) {
                    return false;
                }
                var matchAny = false;
                for (var _i = 0, _a = request.headers.entries(); _i < _a.length; _i++) {
                    var pair = _a[_i];
                    var headerLine = pair[0] + ": " + pair[1];
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
        };
        Condition.wildCardToRegEx = function (str) {
            return new RegExp("^" + str.split("*").join(".*") + "$");
        };
        return Condition;
    }());
    AdvancedServiceWorker.Condition = Condition;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Strategies;
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
    var Rule = (function () {
        function Rule(rule) {
            this.conditions = [];
            this.strategy = AdvancedServiceWorker.Strategies.Disable;
            this.offline = null;
            this.networkTimeout = 3000;
            Object.assign(this, rule || {});
            for (var i = 0; i < this.conditions.length; i++) {
                this.conditions[i] = new AdvancedServiceWorker.Condition(this.conditions[i]);
            }
        }
        Rule.prototype.doesMatch = function (request) {
            for (var i = 0; i < this.conditions.length; i++) {
                if (this.conditions[i].doesMatch(request)) {
                    return true;
                }
            }
            return false;
        };
        return Rule;
    }());
    AdvancedServiceWorker.Rule = Rule;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Options = (function () {
        function Options(options) {
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
            for (var i = 0; i < this.rules.length; i++) {
                if (this.rules[i].offline && this.preload.indexOf(this.rules[i].offline) === -1) {
                    this.preload.push(this.rules[i].offline);
                }
                this.rules[i] = new AdvancedServiceWorker.Rule(this.rules[i]);
            }
        }
        return Options;
    }());
    AdvancedServiceWorker.Options = Options;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var ActionTypes;
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
    var Action = (function () {
        function Action(actionType) {
            this.actionType = actionType;
        }
        return Action;
    }());
    AdvancedServiceWorker.Action = Action;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Message = (function () {
        function Message(scope, data) {
            this.scope = scope;
            this.data = typeof data === "undefined" ? null : data;
        }
        Message.prototype.equal = function (other) {
            return this.scope === other.scope && JSON.stringify(this) === JSON.stringify(other);
        };
        return Message;
    }());
    AdvancedServiceWorker.Message = Message;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var RequestMessage = (function (_super) {
        __extends(RequestMessage, _super);
        function RequestMessage(scope, data) {
            return _super.call(this, scope, data) || this;
        }
        return RequestMessage;
    }(AdvancedServiceWorker.Message));
    AdvancedServiceWorker.RequestMessage = RequestMessage;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var ResponseMessage = (function (_super) {
        __extends(ResponseMessage, _super);
        function ResponseMessage(scope, request, data) {
            var _this = _super.call(this, scope, data) || this;
            _this.request = request;
            return _this;
        }
        return ResponseMessage;
    }(AdvancedServiceWorker.Message));
    AdvancedServiceWorker.ResponseMessage = ResponseMessage;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Actions;
    (function (Actions) {
        var Broadcast = (function (_super) {
            __extends(Broadcast, _super);
            function Broadcast(message) {
                var _this = _super.call(this, AdvancedServiceWorker.ActionTypes.Broadcast) || this;
                _this.message = message;
                return _this;
            }
            return Broadcast;
        }(AdvancedServiceWorker.Action));
        Actions.Broadcast = Broadcast;
    })(Actions = AdvancedServiceWorker.Actions || (AdvancedServiceWorker.Actions = {}));
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Actions;
    (function (Actions) {
        var ClearCache = (function (_super) {
            __extends(ClearCache, _super);
            function ClearCache(condition) {
                var _this = _super.call(this, AdvancedServiceWorker.ActionTypes.ClearCache) || this;
                _this.condition = condition || null;
                return _this;
            }
            return ClearCache;
        }(AdvancedServiceWorker.Action));
        Actions.ClearCache = ClearCache;
    })(Actions = AdvancedServiceWorker.Actions || (AdvancedServiceWorker.Actions = {}));
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Actions;
    (function (Actions) {
        var Notification = (function (_super) {
            __extends(Notification, _super);
            function Notification(title, options, targetUrl) {
                var _this = _super.call(this, AdvancedServiceWorker.ActionTypes.Notification) || this;
                _this.title = title;
                _this.options = (options || {});
                _this.options.data = Object.assign(_this.options.data || {}, { url: targetUrl });
                return _this;
            }
            return Notification;
        }(AdvancedServiceWorker.Action));
        Actions.Notification = Notification;
    })(Actions = AdvancedServiceWorker.Actions || (AdvancedServiceWorker.Actions = {}));
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Actions;
    (function (Actions) {
        var Preload = (function (_super) {
            __extends(Preload, _super);
            function Preload(urls) {
                var _this = _super.call(this, AdvancedServiceWorker.ActionTypes.Preload) || this;
                _this.urls = urls;
                return _this;
            }
            return Preload;
        }(AdvancedServiceWorker.Action));
        Actions.Preload = Preload;
    })(Actions = AdvancedServiceWorker.Actions || (AdvancedServiceWorker.Actions = {}));
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var BrowserDatabase = (function () {
        function BrowserDatabase() {
        }
        BrowserDatabase.getIdb = function (type, callback) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var openreq = indexedDB.open(_this.databaseName, 1);
                openreq.onerror = function () { return reject(openreq.error); };
                openreq.onsuccess = function () { return resolve(openreq.result); };
                openreq.onupgradeneeded = function () {
                    openreq.result.createObjectStore(_this.storeName);
                };
            }).then(function (db) { return new Promise(function (resolve, reject) {
                var transaction = db.transaction(_this.storeName, type);
                transaction.oncomplete = function () { return resolve(); };
                transaction.onabort = transaction.onerror = function () { return reject(transaction.error); };
                callback(transaction.objectStore(_this.storeName));
            }); });
        };
        BrowserDatabase.saveOptions = function (options) {
            var scope = AdvancedServiceWorker.Condition.getRelativeUrl(options.scope);
            return BrowserDatabase.getIdb("readwrite", function (store) {
                store.put(options, scope);
            }).then(function () { return true; }, function (c) {
                console.log(c);
                return false;
            });
        };
        BrowserDatabase.loadOptions = function (scope) {
            scope = AdvancedServiceWorker.Condition.getRelativeUrl(scope);
            var request;
            return BrowserDatabase.getIdb("readonly", function (store) {
                request = store.get(scope);
            }).then(function () { return request.result; }, function () { return null; });
        };
        BrowserDatabase.databaseName = "advanced-service-worker";
        BrowserDatabase.storeName = "keyval";
        return BrowserDatabase;
    }());
    AdvancedServiceWorker.BrowserDatabase = BrowserDatabase;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var BrowserCache = (function () {
        function BrowserCache(name, version) {
            if (version) {
                name += "-v" + version;
            }
            this.storageName = name;
        }
        BrowserCache.prototype.open = function () {
            return caches.open(this.storageName);
        };
        BrowserCache.prototype.remove = function (condition) {
            if (!condition) {
                return caches.delete(this.storageName);
            }
            else if (typeof condition === "string" ||
                condition instanceof String ||
                condition instanceof RegExp) {
                if (!(condition instanceof RegExp)) {
                    condition = AdvancedServiceWorker.Condition.wildCardToRegEx((condition));
                }
                return this.open().then(function (cache) { return cache.keys().then(function (keys) {
                    var promises = [];
                    keys.forEach(function (request) {
                        if (request.url && condition.test(request.url)) {
                            promises.push(cache.delete(request));
                        }
                    });
                    if (!promises.length) {
                        return Promise.resolve(false);
                    }
                    return Promise.all(promises).then(function (results) {
                        for (var i = 0; i < results.length; i++) {
                            if (results[i]) {
                                return true;
                            }
                        }
                        return false;
                    }, function () { return false; });
                }); });
            }
            else if (condition instanceof Array && condition.length) {
                return this.open().then(function (cache) {
                    var promises = [];
                    for (var i = 0; i < condition.length; i++) {
                        promises.push(cache.delete((condition[i])));
                    }
                    return Promise.all(promises).then(function (results) {
                        for (var j = 0; j < results.length; j++) {
                            if (results[j]) {
                                return true;
                            }
                        }
                        return false;
                    }, function () { return false; });
                });
            }
            else {
                return Promise.resolve(false);
            }
        };
        BrowserCache.prototype.preloadUrls = function (urls, version) {
            if (!urls) {
                return Promise.resolve(false);
            }
            return this.open().then(function (cache) { return cache.addAll(urls).then(function () { return true; }, function () {
                console.error("Failed to add preload pages to cache.");
                return false;
            }); }, function () {
                console.error("Failed to open cache.");
                return false;
            });
        };
        BrowserCache.prototype.putResponse = function (request, response) {
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
            return this.open().then(function (cache) { return cache.put(request, response); });
        };
        BrowserCache.prototype.getResponse = function (request) {
            return this.open().then(function (cache) { return cache.match(request).then(function (response) {
                if (response) {
                    return response;
                }
                throw new Error("Cache contains empty response.");
            }); });
        };
        return BrowserCache;
    }());
    AdvancedServiceWorker.BrowserCache = BrowserCache;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var Controller = (function () {
        function Controller(optionsObject) {
            var _this = this;
            this.options = new AdvancedServiceWorker.Options(optionsObject);
            this.eventElement = document.createElement("eventElement");
            Controller.addGlobalEventListener("message", function (e) {
                var message = e.detail.data;
                if (message.scope === _this.options.scope) {
                    _this.eventElement.dispatchEvent(new CustomEvent("message", { detail: message.data }));
                }
            });
        }
        Controller.addGlobalEventListener = function (event, listener, options) {
            Controller.staticEventElement.addEventListener(event, listener, options);
        };
        Controller.prototype.addEventListener = function (event, listener, options) {
            this.eventElement.addEventListener(event, listener, options);
        };
        Controller.prototype.postMessage = function (action) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (!Controller.isInstalled()) {
                    reject(new Error("Service worker is not installed."));
                }
                var request = new AdvancedServiceWorker.RequestMessage(_this.options.scope, action);
                var messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = function (event) {
                    var response = (event.data);
                    if (response.scope === _this.options.scope && response.request && request.equal(response.request)) {
                        resolve(response.data);
                    }
                };
                self.navigator.serviceWorker.controller.postMessage(request, [messageChannel.port2]);
                setTimeout(function () {
                    reject(new Error("Response timeout."));
                }, 100);
            });
        };
        Controller.prototype.showNotification = function (title, notificationOptions, targetUrl) {
            return this.postMessage(new AdvancedServiceWorker.Actions.Notification(title, notificationOptions, targetUrl));
        };
        Controller.prototype.reload = function () {
            return this.postMessage(new AdvancedServiceWorker.Action(AdvancedServiceWorker.ActionTypes.Reload));
        };
        Controller.prototype.clearCache = function (condition) {
            return this.postMessage(new AdvancedServiceWorker.Actions.ClearCache(condition));
        };
        Controller.prototype.preload = function (urls) {
            return this.postMessage(new AdvancedServiceWorker.Actions.Preload(urls));
        };
        Controller.prototype.broadcast = function (message) {
            return this.postMessage(new AdvancedServiceWorker.Actions.Broadcast(message));
        };
        Controller.prototype.ensureInstalled = function () {
            var _this = this;
            if (!Controller.isSupported()) {
                console.error("Service workers are not supported.");
                return Promise.resolve(false);
            }
            var serviceFilePath = this.options.filePath;
            if (this.options.version) {
                serviceFilePath = serviceFilePath + "?v=" + this.options.version;
            }
            return AdvancedServiceWorker.BrowserDatabase.loadOptions(this.options.scope).then(function (currentOptions) {
                var isInstalled = !!(self.navigator.serviceWorker.controller);
                var needsUpdate = isInstalled &&
                    (!currentOptions || JSON.stringify(currentOptions) !== JSON.stringify(_this.options));
                if (isInstalled && !needsUpdate) {
                    console.debug("Active service worker found, no need to register.");
                }
                else {
                    return AdvancedServiceWorker.BrowserDatabase.saveOptions(_this.options).then(function () {
                        return navigator.serviceWorker.register(serviceFilePath, { scope: _this.options.scope }).then(function (registration) {
                            console.info("Service worker has been registered for scope: " + registration.scope);
                            if (needsUpdate) {
                                return registration.update().then(function () {
                                    _this.reload();
                                    console.info("Service worker has been updated.");
                                    return true;
                                });
                            }
                            return true;
                        });
                    }).catch(function () {
                        console.error("Failed to register or update the service worker.");
                        return false;
                    });
                }
                return false;
            });
        };
        Controller.isSupported = function () {
            return ("serviceWorker" in self.navigator) && ("storage" in self.navigator);
        };
        Controller.isInstalled = function () {
            return Controller.isSupported && !!(self.navigator.serviceWorker.controller);
        };
        Controller.staticConstructor = (function () {
            if (Controller.isSupported && ("document" in self)) {
                Controller.staticEventElement = document.createElement("eventElement");
                self.navigator.serviceWorker.addEventListener("message", function (e) {
                    Controller.staticEventElement.dispatchEvent(new CustomEvent("message", { detail: e }));
                });
                self.navigator.serviceWorker.addEventListener("controllerchange", function (e) {
                    Controller.staticEventElement.dispatchEvent(new CustomEvent("controllerchange", { detail: e }));
                });
                self.navigator.serviceWorker.addEventListener("messageerror", function (e) {
                    Controller.staticEventElement.dispatchEvent(new CustomEvent("messageerror", { detail: e }));
                });
            }
        })();
        return Controller;
    }());
    AdvancedServiceWorker.Controller = Controller;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var FetchRequest = (function () {
        function FetchRequest(request, rule, cache) {
            this.messages = [];
            this.response = null;
            this.request = request;
            this.rule = rule;
            this.cache = cache;
        }
        FetchRequest.prototype.message = function (message) {
            this.messages.push(message);
        };
        FetchRequest.prototype.wasSuccessful = function () {
            return !!(this.response);
        };
        FetchRequest.prototype.end = function (message, response) {
            this.message(message);
            if (!this.wasSuccessful()) {
                this.response = response || null;
                this.message("End of operation.");
            }
            return this.response;
        };
        FetchRequest.prototype.fatal = function (message) {
            var error = new Error(message);
            this.message("Operation failed. " + error);
            this.message("Trying native fetch as the last resort.");
            this.response = null;
            return fetch(this.request);
        };
        FetchRequest.prototype.getResponse = function () {
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
        };
        FetchRequest.prototype.strategyNetworkFirst = function () {
            var _this = this;
            return this.getLive(this.request).then(function (netResponse) {
                _this.message("Fetched from network.");
                return _this.cache.putResponse(_this.request, netResponse.clone()).then(function () { return _this.end("Saved to cache.", netResponse); }, function (reason) { return _this.end("Failed to save to cache. " + reason.toString(), netResponse); });
            }, function (reason) {
                _this.message("Network failed, switching to cache. " + reason.toString());
                return _this.cache.getResponse(_this.request).then(function (cacheResponse) { return _this.end("Fetched from cache.", cacheResponse); }, function (reason) {
                    _this.message("Cache failed, switching to offline page. " + reason.toString());
                    if (!_this.rule.offline) {
                        return _this.fatal("Missing offline page.");
                    }
                    return _this.cache.getResponse(_this.rule.offline).then(function (offlineResponse) { return _this.end("Offline page served.", offlineResponse); }, function (reason) { return _this.fatal("Cache failed for offline page. " + reason.toString()); });
                });
            });
        };
        FetchRequest.prototype.strategyCacheFirst = function () {
            var _this = this;
            return this.cache.getResponse(this.request).then(function (cacheResponse) { return _this.end("Fetched from cache.", cacheResponse); }, function (reason) {
                _this.message("Cache failed, switching to network. " + reason.toString());
                return _this.getLive(_this.request).then(function (netResponse) {
                    _this.message("Fetched from network.");
                    return _this.cache.putResponse(_this.request, netResponse.clone()).then(function () { return _this.end("Saved to cache.", netResponse); }, function (reason) { return _this.end("Failed to save to cache. " + reason.toString(), netResponse); });
                }, function (reason) {
                    _this.message("Network failed, switching to offline page. " + reason.toString());
                    if (!_this.rule.offline) {
                        return _this.fatal("Missing offline page.");
                    }
                    return _this.cache.getResponse(_this.rule.offline).then(function (offlineResponse) { return _this.end("Offline page served.", offlineResponse); }, function (reason) { return _this.fatal("Cache failed for offline page. " + reason.toString()); });
                });
            });
        };
        FetchRequest.prototype.strategyNetworkOnly = function () {
            var _this = this;
            return this.getLive(this.request).then(function (netResponse) { return _this.end("Fetched from network.", netResponse); }, function (reason) {
                _this.message("Network failed, switching to offline page. " + reason.toString());
                if (!_this.rule.offline) {
                    return _this.fatal("Missing offline page.");
                }
                return _this.cache.getResponse(_this.rule.offline).then(function (offlineResponse) { return _this.end("Offline page served.", offlineResponse); }, function (reason) { return _this.fatal("Cache failed for offline page. " + reason.toString()); });
            });
        };
        FetchRequest.prototype.strategyCacheOnly = function () {
            var _this = this;
            return this.cache.getResponse(this.request).then(function (cacheResponse) { return _this.end("Fetched from cache.", cacheResponse); }, function (reason) {
                _this.message("Cache failed, switching to offline page. " + reason.toString());
                if (!_this.rule.offline) {
                    return _this.fatal("Missing offline page.");
                }
                return _this.cache.getResponse(_this.rule.offline).then(function (offlineResponse) { return _this.end("Offline page served.", offlineResponse); }, function (reason) { return _this.fatal("Cache failed for offline page. " + reason.toString()); });
            }).catch(function () { return fetch(_this.request); });
        };
        FetchRequest.prototype.strategyRace = function () {
            var _this = this;
            var live = this.getLive(this.request).then(function (netResponse) {
                _this.message("Fetched from network.");
                return _this.cache.putResponse(_this.request, netResponse.clone()).then(function () { return _this.end("Saved to cache.", netResponse); }, function (reason) { return _this.end("Failed to save to cache. " + reason.toString(), netResponse); });
            });
            var delay = this.rule.networkTimeout <= 0
                ? Promise.resolve({})
                : new Promise(function (fulfill) {
                    setTimeout(function () {
                        _this.message("Network delay reached, trying cache...");
                        fulfill();
                    }, _this.rule.networkTimeout);
                });
            return (new Promise(function (fulfill, reject) {
                var failed = 0;
                live.then(fulfill, function (reason) {
                    failed++;
                    if (failed >= 2) {
                        reject(reason);
                    }
                    else {
                        _this.cache.getResponse(_this.request).then(function (cacheResponse) { return fulfill(_this.end("Fetched from cache.", cacheResponse)); }, reject);
                    }
                });
                delay.then(function () {
                    return _this.cache.getResponse(_this.request).then(function (cacheResponse) { return fulfill(_this.end("Fetched from cache.", cacheResponse)); }, function (reason) {
                        failed++;
                        if (failed >= 2) {
                            reject(reason);
                        }
                    });
                });
            }).catch(function (reason) {
                _this.message("Race failed, switching to offline page. " + reason.toString());
                if (!_this.rule.offline) {
                    return _this.fatal("Missing offline page.");
                }
                return _this.cache.getResponse(_this.rule.offline).then(function (offlineResponse) { return _this.end("Offline page served.", offlineResponse); }, function (reason) { return _this.fatal("Cache failed for offline page. " + reason.toString()); });
            }));
        };
        FetchRequest.prototype.getLive = function (request) {
            return fetch(request).then(function (response) {
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
        };
        return FetchRequest;
    }());
    AdvancedServiceWorker.FetchRequest = FetchRequest;
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
var AdvancedServiceWorker;
(function (AdvancedServiceWorker) {
    var ServiceWorker = (function () {
        function ServiceWorker() {
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
        ServiceWorker.prototype.onInstall = function (event) {
            this.debug("Processing install event...", event);
            event.waitUntil(self.skipWaiting().then(this.reload.bind(this)));
        };
        ServiceWorker.prototype.onActivate = function (event) {
            this.debug("Processing activate event...", event);
            event.waitUntil(this.getOptions().then(function () {
                self.clients.claim();
            }));
        };
        ServiceWorker.prototype.onFetch = function (event) {
            var _this = this;
            if (event.request &&
                event.request.method === "GET" &&
                event.request.url &&
                (event.request.url.indexOf("http://") === 0 || event.request.url.indexOf("https://") === 0)) {
                var fetchRequest_1;
                var response_1;
                event.waitUntil(this.getOptions().then(function (options) {
                    return _this.getMatchedRule(event.request).then(function (rule) {
                        if (rule) {
                            var cache = new AdvancedServiceWorker.BrowserCache(options.storageName, options.version);
                            fetchRequest_1 = new AdvancedServiceWorker.FetchRequest(event.request, rule, cache);
                            response_1 = fetchRequest_1.getResponse();
                        }
                        if (response_1) {
                            event.respondWith(response_1.then(function (fetchResponse) {
                                if (fetchResponse && fetchRequest_1.wasSuccessful()) {
                                    _this.debug("Service worker intercepted the request: ", fetchRequest_1);
                                }
                                else {
                                    _this.debug("Service worker failed to provide a response: ", fetchRequest_1);
                                }
                                return fetchResponse;
                            }, function (reason) {
                                _this.debug("Request failed with unexpected error: ", fetchRequest_1);
                                throw reason;
                            }));
                        }
                        else {
                            _this.debug("Request handled by the browser: ", fetchRequest_1 ? fetchRequest_1 : event.request);
                        }
                    });
                }));
            }
        };
        ServiceWorker.prototype.onPush = function (event) {
            if (event.data) {
                var action = event.data.json();
                if (action) {
                    event.waitUntil(this.processAction(action));
                }
            }
        };
        ServiceWorker.prototype.onPushSubscriptionChange = function (event) {
            this.debug("Push subscription changed: ", event);
            event.waitUntil(this.checkPushServiceStatus(true));
        };
        ServiceWorker.prototype.onNotificationClick = function (event) {
            this.debug("Notification clicked: ", event.notification);
            event.notification.close();
            if (event.notification.data && event.notification.data.url) {
                event.waitUntil(self.clients.matchAll({
                    type: "window"
                }).then(function (clientList) {
                    for (var i = 0; i < clientList.length; i++) {
                        var client = clientList[i];
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
        };
        ServiceWorker.prototype.onSync = function (event) {
            this.debug("Sync request: ", event);
            event.waitUntil(this.reload());
        };
        ServiceWorker.prototype.onMessage = function (event) {
            var _this = this;
            this.debug("New message recieved: ", event);
            event.waitUntil(this.getOptions().then(function (options) {
                var message = (event.data);
                if (message.scope === options.scope) {
                    return _this.processAction(message.data).then(function (actionResult) {
                        var response = new AdvancedServiceWorker.ResponseMessage(options.scope, message, JSON.parse(JSON.stringify(actionResult)));
                        event.ports[0].postMessage(response);
                    });
                }
                return Promise.resolve();
            }));
        };
        ServiceWorker.prototype.debug = function (message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            if (!this.cachedOptions || this.cachedOptions.debug) {
                console.debug.apply(console, [message].concat(optionalParams));
            }
        };
        ServiceWorker.prototype.getOptions = function (force) {
            var _this = this;
            if (!force && this.cachedOptions) {
                return Promise.resolve(this.cachedOptions);
            }
            return AdvancedServiceWorker.BrowserDatabase.loadOptions(self.registration.scope).then(function (options) {
                _this.cachedOptions = new AdvancedServiceWorker.Options(options);
                if (!_this.cachedOptions) {
                    throw new Error("Missing service worker options in IndexedDB.");
                }
                return _this.cachedOptions;
            });
        };
        ServiceWorker.prototype.processAction = function (action) {
            if (action.actionType) {
                switch (action.actionType) {
                    case AdvancedServiceWorker.ActionTypes.Notification:
                        return this.showNotification(action.title, action.options);
                    case AdvancedServiceWorker.ActionTypes.ClearCache:
                        return this.getOptions().then(function (options) {
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
        };
        ServiceWorker.prototype.showNotification = function (title, notificationOptions) {
            this.debug("New notification: ", title, notificationOptions);
            if (!title) {
                return Promise.resolve(false);
            }
            return self.registration.showNotification(title, notificationOptions || {}).then(function () { return true; }).catch(function (e) {
                console.warn("Can not show notification: ", e);
                return false;
            });
        };
        ServiceWorker.prototype.preload = function (urls) {
            return this.getOptions().then(function (options) {
                urls = urls || options.preload;
                if (!urls || (urls instanceof Array && urls.length === 0)) {
                    return Promise.resolve(true);
                }
                if (typeof urls === "string" || urls instanceof String) {
                    urls = [urls];
                }
                return (new AdvancedServiceWorker.BrowserCache(options.storageName, options.version)).preloadUrls(urls);
            }).catch(function () { return false; });
        };
        ServiceWorker.prototype.broadcast = function (message) {
            this.debug("Broadcasting message: ", message);
            if (!message) {
                return Promise.resolve(false);
            }
            return this.getOptions().then(function (options) {
                return self.clients.matchAll().then(function (clientList) {
                    if (clientList.length > 0) {
                        for (var i = 0; i < clientList.length; i++) {
                            clientList[i].postMessage(new AdvancedServiceWorker.Message(options.scope, message));
                        }
                        return true;
                    }
                    return false;
                });
            });
        };
        ServiceWorker.prototype.reload = function () {
            var _this = this;
            return this.getOptions(true).then(function (options) {
                return Promise.all([
                    _this.preload(),
                    _this.checkPersistence(),
                    _this.checkPushServiceStatus(false)
                ]).then(function () {
                    _this.debug("Clear old caches... (< v" + options.version + ")");
                    var promises = [];
                    for (var i = 0; i < options.version; i++) {
                        promises.push(new AdvancedServiceWorker.BrowserCache(options.storageName, i).remove());
                    }
                    return Promise.all(promises).then(function () { return true; });
                });
            }).catch(function () { return false; });
        };
        ServiceWorker.prototype.checkPushServiceStatus = function (forceSubscription) {
            var _this = this;
            return this.getOptions().then(function (options) {
                var pushOptions = {
                    userVisibleOnly: options.pushUserVisibleOnly,
                    applicationServerKey: options.pushServerKey
                };
                return self.registration.pushManager.permissionState(pushOptions).then(function (permission) {
                    if (permission === "granted") {
                        return self.registration.pushManager.getSubscription().then(function (subscription) {
                            if ((!subscription || forceSubscription) && options.pushServerAddress) {
                                self.registration.pushManager.subscribe(pushOptions).then(function (subscription) {
                                    if (subscription) {
                                        _this.reportPushSubscriptionStatus(subscription).catch(function () {
                                            console.warn("Failed to send subscription changes to the server.");
                                        });
                                    }
                                    else {
                                        console.warn("Push service subsription request denied.");
                                    }
                                }).catch(function (e) {
                                    console.warn("Failed to subscribe from push service.", e);
                                });
                            }
                            else if (subscription && !options.pushServerAddress) {
                                self.registration.pushManager.unsubscribe().then(function (success) {
                                    if (success) {
                                        _this.reportPushSubscriptionStatus(null).catch(function () {
                                            console.warn("Failed to send subscription changes to the server.");
                                        });
                                    }
                                    else {
                                        console.warn("Push service unsubsription request denied.");
                                    }
                                }).catch(function (e) {
                                    console.warn("Failed to unsubscribe from push service.", e);
                                });
                            }
                        }).catch(function (e) {
                            console.warn("Failed to get push service subscription status.", e);
                        });
                    }
                    return Promise.resolve();
                }).catch(function (error) {
                    if (options.pushServerAddress) {
                        console.warn("Push service requests rejected: ", error);
                    }
                    else {
                        _this.debug("Push service requests rejected: ", error);
                    }
                });
            });
        };
        ServiceWorker.prototype.reportPushSubscriptionStatus = function (subscription) {
            return this.getOptions().then(function (options) {
                return new Promise(function (fulfill, reject) {
                    if (!options.pushServerAddress) {
                        reject();
                    }
                    var httpRequest = new XMLHttpRequest();
                    httpRequest.onload = function () {
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
        };
        ServiceWorker.prototype.checkPersistence = function () {
            return this.getOptions().then(function (options) {
                if (options.persistent && self.navigator.storage && self.navigator.storage.persist) {
                    return self.navigator.storage.persisted().then(function (persistent) {
                        if (!persistent) {
                            self.navigator.storage.persist().catch(function () {
                                console.warn("Failed to make storage persistance.");
                                return false;
                            });
                        }
                        return true;
                    });
                }
                return Promise.resolve(!options.persistent);
            });
        };
        ServiceWorker.prototype.getMatchedRule = function (request) {
            return this.getOptions().then(function (options) {
                for (var i = 0; i < options.rules.length; i++) {
                    var rule = options.rules[i];
                    if (rule.doesMatch(request)) {
                        return rule;
                    }
                }
                return null;
            });
        };
        ServiceWorker.staticConstructor = (function () {
            if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
                var serviceWorker = new ServiceWorker();
            }
        })();
        return ServiceWorker;
    }());
})(AdvancedServiceWorker || (AdvancedServiceWorker = {}));
//# sourceMappingURL=asw.js.map