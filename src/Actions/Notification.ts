namespace AdvancedServiceWorker.Actions {
    export class Notification extends Action {
        readonly title: string;
        readonly options: NotificationOptions;

        constructor(title: string, options?: Partial<NotificationOptions> | object, targetUrl?: string) {
            super(ActionTypes.Notification);
            this.title = title;
            this.options = (options || {}) as NotificationOptions;
            this.options.data = Object.assign(this.options.data || {}, { url: targetUrl });
        }
    }
}