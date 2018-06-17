/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />

namespace AdvancedServiceWorker {
    // ReSharper disable once DeclarationHides
    declare var self: Window;

    export class Controller {
        private readonly options: Options;
        private readonly eventElement;
        private static staticEventElement;

        static staticConstructor = (() => {
            if (Controller.isSupported && ("document" in self)) {
                Controller.staticEventElement = document.createElement("eventElement");
                // ReSharper disable Html.EventNotResolved
                self.navigator.serviceWorker.addEventListener("message",
                    e => {
                        Controller.staticEventElement.dispatchEvent(new CustomEvent("message", { detail: e }));
                    });
                self.navigator.serviceWorker.addEventListener("controllerchange",
                    e => {
                        Controller.staticEventElement.dispatchEvent(new CustomEvent("controllerchange", { detail: e }));
                    });
                self.navigator.serviceWorker.addEventListener("messageerror",
                    e => {
                        Controller.staticEventElement.dispatchEvent(new CustomEvent("messageerror", { detail: e }));
                    });
                // ReSharper restore Html.EventNotResolved
            }
        })();

        constructor(optionsObject: Partial<Options>) {
            this.options = new Options(optionsObject);
            this.eventElement = document.createElement("eventElement");
            Controller.addEventListener("message",
                (e: CustomEvent<ServiceWorkerMessageEvent>) => {
                    var message = e.detail.data as Message;
                    if (message.scope === this.options.scope) {
                        this.eventElement.dispatchEvent(new CustomEvent("message", { detail: message.data }));
                    }
                });
        }

        static addEventListener<TK extends keyof {
            "controllerchange": CustomEvent<Event>;
            "message": CustomEvent<ServiceWorkerMessageEvent>;
            "messageerror": CustomEvent<MessageEvent>;
        }>(
            event: TK,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions): void {

            Controller.staticEventElement.addEventListener(event, listener, options);
        }

        addEventListener<TK extends keyof { "message": CustomEvent<any> }>(
            event: TK,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions): void {

            this.eventElement.addEventListener(event, listener, options);
        }

        private postMessage(action: Action): Promise<any> {
            return new Promise((resolve, reject) => {
                if (!Controller.isInstalled()) {
                    reject(new Error("Service worker is not installed."));
                }
                const request = new RequestMessage(this.options.scope, action);
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = event => {
                    const response = (event.data) as ResponseMessage;
                    if (response.scope === this.options.scope && response.request && request.equal(response.request)) {
                        resolve(response.data);
                    }
                };
                self.navigator.serviceWorker.controller.postMessage(request, [messageChannel.port2]);
                setTimeout(() => {
                        reject(new Error("Response timeout."));
                    },
                    100);
            });
        }

        showNotification(title: string, notificationOptions?: NotificationOptions, targetUrl?: string):
            Promise<boolean> {
            return this.postMessage(new Actions.Notification(title, notificationOptions, targetUrl));
        }

        reload(): Promise<boolean> {
            return this.postMessage(new Action(ActionTypes.Reload));
        }

        clearCache(condition?: string | string[] | RegExp): Promise<boolean> {
            return this.postMessage(new Actions.ClearCache(condition));
        }

        preload(urls: string[]): Promise<boolean> {
            return this.postMessage(new Actions.Preload(urls));
        }

        broadcast(message?: any): Promise<boolean> {
            return this.postMessage(new Actions.Broadcast(message));
        }

        ensureInstalled(): Promise<boolean> {
            if (!Controller.isSupported()) {
                console.error("Service workers are not supported.");
                return Promise.resolve(false);
            }

            var serviceFilePath = this.options.filePath;
            if (this.options.version) {
                serviceFilePath = serviceFilePath + "?v=" + this.options.version;
            }

            return BrowserDatabase.loadOptions(this.options.scope).then(currentOptions => {
                const isInstalled = !!(self.navigator.serviceWorker.controller);
                const needsUpdate = isInstalled &&
                    (!currentOptions || JSON.stringify(currentOptions) !== JSON.stringify(this.options));

                // save options to IndexedDB
                if (isInstalled && !needsUpdate) {
                    // tslint:disable-next-line:no-console
                    console.debug("Active service worker found, no need to register.");
                } else {
                    // register the ServiceWorker
                    return BrowserDatabase.saveOptions(this.options).then(() => {
                        return navigator.serviceWorker.register(serviceFilePath, { scope: this.options.scope }).then(
                            registration => {
                                // tslint:disable-next-line:no-console
                                console.info(`Service worker has been registered for scope: ${registration.scope}`);
                                if (needsUpdate) {
                                    return registration.update().then(() => {
                                        this.reload();
                                        // tslint:disable-next-line:no-console
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

        static isSupported(): boolean {
            return ("serviceWorker" in self.navigator) && ("storage" in self.navigator);
        }

        static isInstalled(): boolean {
            return Controller.isSupported && !!(self.navigator.serviceWorker.controller);
        }
    }
}