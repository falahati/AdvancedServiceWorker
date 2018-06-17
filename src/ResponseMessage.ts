namespace AdvancedServiceWorker {
    export class ResponseMessage extends Message {
        readonly request: RequestMessage;

        constructor(scope: string, request: RequestMessage, data: any) {
            super(scope, data);
            this.request = request;
        }
    }
}