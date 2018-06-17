namespace AdvancedServiceWorker {
    export class Rule {
        readonly conditions: Condition[] = [];
        readonly strategy: Strategies = Strategies.Disable;
        readonly offline: string = null;
        readonly networkTimeout: number = 3000;

        constructor(rule?: Partial<Rule>) {
            Object.assign(this, rule || {});

            // convert string conditions to RegExp
            for (let i = 0; i < this.conditions.length; i++) {
                this.conditions[i] = new Condition(this.conditions[i]);
            }
        }

        doesMatch(request: Request): boolean {
            for (let i: number = 0; i < this.conditions.length; i++) {
                if (this.conditions[i].doesMatch(request)) {
                    return true;
                }
            }
            return false;
        }
    }
}