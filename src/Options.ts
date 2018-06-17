namespace AdvancedServiceWorker {
    export class Options {
        readonly version: number = 0;
        readonly storageName: string = "offline-cache";
        readonly preload: string[] = [];
        readonly scope: string = "/";
        readonly filePath: string = "/asw.js";
        readonly persistent: boolean = false;
        readonly pushServerAddress: string = "";
        readonly pushServerKey: any = null;
        readonly pushUserVisibleOnly: boolean = true;
        readonly debug: boolean = false;
        readonly rules: Rule[] = [];

        constructor(options?: Partial<Options>) {
            Object.assign(this, options || {});

            for (let i = 0; i < this.rules.length; i++) {
                // check for missing preload files
                if (this.rules[i].offline && this.preload.indexOf(this.rules[i].offline) === -1) {
                    this.preload.push(this.rules[i].offline);
                }
                this.rules[i] = new Rule(this.rules[i]);
            }
        }
    }
}