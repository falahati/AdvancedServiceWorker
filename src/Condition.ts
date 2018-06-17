namespace AdvancedServiceWorker {
    export class Condition {
        readonly url: RegExp | string | String = null;
        readonly header: RegExp | string | String = null;

        static getRelativeUrl(url: string): string {
            if ((url.indexOf("http://") === 0 || url.indexOf("https://") === 0) && url.indexOf("/", 8) !== -1) {
                url = url.substr(url.indexOf("/", 8));
            }
            return url;
        }

        doesMatch(request: Request): boolean {
            // check condition url regex
            if (this.url &&
                (!request.url || !((this.url) as RegExp).test(Condition.getRelativeUrl(request.url)))) {
                return false;
            }

            // check condition header regex
            if (this.header) {
                if (!request.headers) {
                    return false;
                }

                let matchAny: boolean = false;
                for (let pair of request.headers.entries()) {
                    const headerLine = pair[0] + ": " + pair[1];
                    if (((this.header) as RegExp).test(headerLine)) {
                        matchAny = true;
                        break;
                    }
                }

                if (!matchAny) {
                    return false;
                }
            }
            return true;
        }

        static wildCardToRegEx(str: string): RegExp {
            return new RegExp(`^${str.split("*").join(".*")}$`);
        }

        constructor(condition?: Partial<Condition>) {
            Object.assign(this, condition || {});

            if (this.url && (typeof this.url === "string" || this.url instanceof String)) {
                this.url = Condition.wildCardToRegEx(this.url as string);
            }

            if (this.header &&
                (typeof this.header === "string" || this.header instanceof String)) {
                this.header = Condition.wildCardToRegEx(this.header as string);
            }
        }
    }
}