export namespace storage {
    export function get(key: string, def: any = null): any {
        let r = localStorage.getItem(key)

        if (!r) return def
        return JSON.parse(r)
    }

    export function set(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value))
    }

    export class Variable<type> {
        value: type = null

        constructor(public key: string, initial: type) {
            this.value = get(key, initial)
        }

        get() {
            return this.value
        }

        set(value: type){
            this.value = value
            set(this.key, value)
        }

        save() {
            set(this.key, this.value)
        }
    }
}