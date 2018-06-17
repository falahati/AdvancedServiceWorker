namespace AdvancedServiceWorker.Actions {
    export class ClearCache extends Action {
        readonly condition: string[] | RegExp | string | String;

        constructor(condition?: string[] | RegExp | string | String) {
            super(ActionTypes.ClearCache);
            this.condition = condition || null;
        }
    }
}