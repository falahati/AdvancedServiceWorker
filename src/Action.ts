namespace AdvancedServiceWorker {
    export class Action {
        readonly actionType: ActionTypes;

        constructor(actionType: ActionTypes) {
            this.actionType = actionType;
        }
    }
}