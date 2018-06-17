namespace AdvancedServiceWorker {
    export class Message {
        readonly scope: string;
        readonly data: any;

        constructor(scope: string, data?: any) {
            this.scope = scope;
            this.data = typeof data === "undefined" ? null : data;
        }

        equal(other: Message): boolean {
            return this.scope === other.scope && JSON.stringify(this) === JSON.stringify(other);
        }
    }
}