namespace AdvancedServiceWorker.Actions {
    export class Broadcast extends Action {
        readonly message: any;

        constructor(message?: any) {
            super(ActionTypes.Broadcast);
            this.message = message;
        }
    }
}