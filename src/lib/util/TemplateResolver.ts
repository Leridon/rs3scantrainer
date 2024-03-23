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

  withSingle(key: string, replacement: (args: string[]) => string): TemplateResolver {
    let copy = this.copy()

    copy.templates.set(key, replacement)

    return copy
  }


  resolve(template: string, max_depth: number = 100): string {
    // TODO Critical: The input string needs to be html-escaped since it is user-provided text and can be shared across users!
    //                => Potential for Script-Injection !!!

    if (max_depth <= 0) return template

    let begin = template.indexOf("{{")
    let end = template.indexOf("}}", begin)

    if (begin < 0 || end < 0) return template

    let args: string[] = template.substring(begin + 2, end).split(" ")
    let op = args[0].toLowerCase() // Opcodes are case insensitive

    let f = this.templates.get(op)

    let replacement = f ? f(args.slice(1)) : `UNKNOWN(${op})`

    let next = template.slice(0, begin) + replacement + template.slice(end + 2)

    return this.resolve(next, max_depth - 1)
  }

  copy(): TemplateResolver {
    return new TemplateResolver(new Map(this.templates))
  }
}