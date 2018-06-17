namespace AdvancedServiceWorker {
    export class BrowserDatabase {
        private static databaseName: string = "advanced-service-worker";
        private static storeName: string = "keyval";

        private static getIdb(type: IDBTransactionMode, callback: { (store: IDBObjectStore): void; }): Promise<{}> {
            return new Promise((resolve, reject) => {
                const openreq = indexedDB.open(this.databaseName, 1);
                openreq.onerror = () => reject(openreq.error);
                openreq.onsuccess = () => resolve(openreq.result);
                openreq.onupgradeneeded = () => {
                    openreq.result.createObjectStore(this.storeName);
                };
            }).then((db: IDBDatabase) => new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, type);
                transaction.oncomplete = () => resolve();
                transaction.onabort = transaction.onerror = () => reject(transaction.error);
                callback(transaction.objectStore(this.storeName));
            }));
        }

        static saveOptions(options: Options): Promise<boolean> {
            const scope = Condition.getRelativeUrl(options.scope);
            return BrowserDatabase.getIdb("readwrite",
                (store) => {
                    store.put(options, scope);
                }).then(() => true,
                (c) => {
                    console.log(c);
                    return false;
                });
        }

        static loadOptions(scope: string): Promise<Options> {
            scope = Condition.getRelativeUrl(scope);
            let request: IDBRequest;
            return BrowserDatabase.getIdb("readonly",
                (store) => {
                    request = store.get(scope);
                }).then(() => request.result as Options, () => null);
        }
    }
}