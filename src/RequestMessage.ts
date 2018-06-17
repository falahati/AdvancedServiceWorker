namespace AdvancedServiceWorker {
    export class RequestMessage extends Message {
        readonly data: Action;

        constructor(scope: string, data: Action) {
            super(scope, data);
        }
    }
}