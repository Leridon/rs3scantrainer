export default class TemplateResolver {
    constructor(private templates: Map<string, (args: string[]) => string> = new Map()) {

    }

    with(a: Record<string, (args: string[]) => string>): TemplateResolver {
        let copy = this.copy()

        for (let k in a) {
            copy.templates.set(k, a[k])
        }

        return copy
    }

    withSingle(key: string, replacement: (args: string[]) => string) {
        let copy = this.copy()

        copy.templates.set(key, replacement)

        return copy
    }


    resolve(template: string): string {
        let begin = template.indexOf("{{")
        let end = template.indexOf("}}")

        if (begin < 0 || end < 0) return template

        let args: string[] = template.substring(begin + 2, end).split(" ")
        let op = args[0].toLowerCase() // Opcodes are case insensitive

        let f = this.templates.get(op)

        let replacement = f ? f(args.slice(1)) : `UNKNOWN(${op})`

        let next = template.slice(0, begin) + replacement + template.slice(end + 2)

        return this.resolve(next)
    }

    copy(): TemplateResolver {
        return new TemplateResolver(new Map(this.templates))
    }
}