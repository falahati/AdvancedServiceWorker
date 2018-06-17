namespace AdvancedServiceWorker.Actions {
    export class Preload extends Action {
        readonly urls: string[];

        constructor(urls: string[]) {
            super(ActionTypes.Preload);
            this.urls = urls;
        }
    }
}