import {NisModal} from "../NisModal";

export abstract class FormModal<T> extends NisModal {
    private resolver: {
        handler: (_: T) => void,
        resolved: boolean
    } = null

    protected constructor(protected options: NisModal.Options = {}) {
        super(options);

        this.hidden.on(() => this.confirm(this.getValueForCancel()))
    }

    protected confirm(value: T): void {
        if (this.resolver && !this.resolver.resolved) {
            this.resolver.resolved = true
            this.resolver.handler(value)

            this.remove()
        }
    }

    protected getValueForCancel(): T {
        return null
    }

    do(): Promise<T> {
        return new Promise(resolve => {
            this.resolver = {
                handler: resolve,
                resolved: false
            }

            this.show()
        })
    }
}