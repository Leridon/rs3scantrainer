import {Checkbox} from "../../../../lib/ui/controls/Checkbox";
import {C} from "../../../../lib/ui/constructors";
import {ewent, Observable} from "../../../../lib/reactive";
import {util} from "../../../../lib/util/util";
import TextField from "../../../../lib/ui/controls/TextField";

export abstract class ParsingParameter<T = any> {

    abstract renderForm(depth: number): ParsingParameter.Editor<T>
}

export type ParType<T> = T extends ParsingParameter<infer Q> ? Q : undefined

export namespace ParsingParameter {
    import copyUpdate2 = util.copyUpdate2;

    export function bool(): ParsingParameter<boolean> {
        return new ParsingParameter.Boolean()
    }

    export function string(): ParsingParameter<string> {
        return new ParsingParameter.String()
    }

    export function rec<T extends Record<string, RecordElement<any>>>(): ParsingParameter.Rec<T> {
        return new ParsingParameter.Rec([])
    }


    export abstract class Editor<T = any> {
        public control = c()
        public additional = c()

        private value: T

        value_changed = ewent<T>()

        constructor(private type: ParsingParameter) {

        }

        abstract render_implementation(value: T): void

        render(): void {
            this.control.empty()
            this.additional.empty()

            this.render_implementation(this.value)
        }

        protected commit(v: T) {
            this.value = v
            this.value_changed.trigger(v)
        }

        get(): T {
            return this.value
        }

        set(value: T): this {
            this.value = value
            this.render()

            return this
        }

        onChange(f: (_: T) => void): this {
            this.value_changed.on(f)
            return this
        }

    }

    export class Boolean extends ParsingParameter<boolean> {
        override renderForm(depth: number): Editor<boolean> {
            const self = this

            return new class extends ParsingParameter.Editor<boolean> {
                constructor() {
                    super(self)
                }

                render_implementation(value: boolean) {
                    this.control.append(new Checkbox()
                        .onCommit(v => this.commit(v))
                        .setValue(value))
                }
            }
        }
    }

    export class String extends ParsingParameter<string> {
        override renderForm(depth: number): ParsingParameter.Editor<string> {
            const self = this

            return new class extends ParsingParameter.Editor<string> {
                constructor() {
                    super(self)
                }

                render_implementation(value: string) {
                    this.control.append(new TextField()
                        .onCommit(v => this.commit(v))
                        .setValue(value))
                }
            }
        }
    }

    export type RecordElement<T> = {}

    type extr<T> = T extends RecordElement<infer Q> ? Q : unknown

    export class Rec<T extends Record<string, RecordElement<any>>> extends ParsingParameter<{ [key in keyof T]?: extr<T[key]> }> {
        constructor(public elements: Rec.Element[]) {
            super();
        }

        override renderForm(depth: number): ParsingParameter.Editor<Record<string, any>> {
            const self = this

            return new class extends ParsingParameter.Editor {
                private elements: Rec.ElementWidget[]

                constructor() {
                    super(self)
                }

                render_implementation(value: any) {
                    this.elements = self.elements.map(element =>
                        new Rec.ElementWidget(element, element.optional ? "check" : "none", depth + 1)
                            .set(value[element.id])
                            .onChange(v => {
                                this.commit(copyUpdate2(this.get(), e => e[element.id] = v))
                            })
                    )

                    this.additional.append(...this.elements.map(e => e.additional))
                }
            }
        }

        element<T>(name: string, id: string, type: ParsingParameter<T>, default_value: T, optional: boolean = false): this {
            this.elements.push({
                name: name, id: id, type: type, optional: optional, default_value: default_value
            })

            return this
        }
    }

    export namespace Rec {
        import hbox = C.hbox;
        export type Element = {
            name: string,
            id: string,
            type: ParsingParameter
            default_value: any,
            optional?: boolean
        }

        export class ElementWidget<T = any> extends Editor<T | undefined> {
            checkbox: Checkbox
            sub: Editor<T> = null

            constructor(public element: Element, public cb_type: "none" | "check" | "radio", public depth: number) {
                super(element.type)
            }

            render_implementation(value: T | undefined) {
                let check_column = c().css("width", "50px")
                let name_column = c().css("min-width", "50px").text(this.element.name)
                const control_column = c().css("flex-grow", "1")
                const el_content = c()

                switch (this.cb_type) {
                    case "check":
                        this.checkbox = new Checkbox("", "checkbox")
                        break;
                    case "radio":
                        this.checkbox = new Checkbox("", "radio")
                        break;
                }
                if (this.checkbox) {
                    this.checkbox
                    this.checkbox
                        .setValue(value !== undefined)
                        .onChange(v => {
                            const value = v ? this.element.default_value : undefined

                            this.commit(value)
                            this.render()
                        })
                        .appendTo(check_column)
                }

                this.additional.append(
                    hbox(check_column, name_column, control_column),
                    el_content
                )

                this.sub = null

                if (value !== undefined) {
                    this.sub = this.element.type
                        .renderForm(this.depth + 1)
                        .onChange(v => this.commit(v))
                        .set(value)

                    control_column.append(this.sub.control)
                    el_content.append(this.sub.additional)
                }
            }
        }
    }

    export class Either<T, U> extends ParsingParameter<T | U> {
        renderForm(depth: number): ParsingParameter.Editor<T | U> {
            return undefined;
        }
    }

}