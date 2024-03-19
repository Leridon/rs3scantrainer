import {Checkbox} from "../../../../lib/ui/controls/Checkbox";
import {C} from "../../../../lib/ui/constructors";
import {ewent, Observable} from "../../../../lib/reactive";
import {util} from "../../../../lib/util/util";
import TextField from "../../../../lib/ui/controls/TextField";
import {AbstractDropdownSelection} from "../../widgets/AbstractDropdownSelection";
import {DropdownSelection} from "../../widgets/DropdownSelection";
import {Path} from "../../../../lib/runescape/pathing";
import {Transportation} from "../../../../lib/runescape/transportation";
import {direction} from "../../../../lib/runescape/movement";
import Widget from "../../../../lib/ui/Widget";

export abstract class ParsingParameter<T = any> {
    constructor(private _default_value: () => T) {}

    default(f: () => T) {
        this._default_value = f
    }

    getDefault(): T {
        return this._default_value()
    }

    abstract renderForm(depth: number): ParsingParameter.Editor<T>
}

export type ParType<T> = T extends ParsingParameter<infer Q> ? Q : undefined

export namespace ParsingParameter {
    import copyUpdate2 = util.copyUpdate2;
    import Movement = Transportation.EntityTransportation.Movement;

    export function bool(): ParsingParameter<boolean> {
        return new class extends ParsingParameter<boolean> {
            constructor() {
                super(() => false)
            }

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
    }

    export function string(): ParsingParameter<string> {

        return new class extends ParsingParameter<string> {
            constructor() {
                super(() => "")
            }

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
    }

    export function choose<T>(type_class: AbstractDropdownSelection.selectable<T>, choices: T[]): ParsingParameter<T> {

        return new class extends ParsingParameter<T> {
            constructor() {
                super(() => choices[0])
            }

            override renderForm(depth: number): Editor<T> {
                const self = this

                return new class extends ParsingParameter.Editor<T> {
                    constructor() {
                        super(self)
                    }

                    render_implementation(value: T) {
                        this.control.append(new DropdownSelection({type_class: type_class}, choices)
                            .onSelection(v => this.commit(v))
                            .setValue(value))
                    }
                }
            }
        }
    }

    export function dir(): ParsingParameter<direction> {
        return choose<direction>({
            toHTML: (v: direction): Widget => c().text(direction.toString(v))
        }, direction.all)
    }

    export function rec<T extends Record<string, Rec.Element<any>>>(
        elements: T
    ): ParsingParameter.Rec<T> {
        return new ParsingParameter.Rec(elements)
    }

    export function element<T>(name: string, type: ParsingParameter<T>, optional: boolean = false): Rec.Element<T> {
        return {
            name: name,
            type: type,
            optional: optional,
        }
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

    export class Rec<T extends Record<string, Rec.Element<any>>> extends ParsingParameter<{ [key in keyof T]?: Rec.Element.extr<T[key]> }> {
        constructor(public elements: T) {
            super(() => {

                return Object.fromEntries(
                    Object.entries(elements).map(([key, value]) => [key, value.optional ? undefined : value.type.getDefault()])
                ) as { [key in keyof T]?: Rec.Element.extr<T[key]> } // There's probably an idiomatic way to get this to typecheck without this cast
            });
        }

        override renderForm(depth: number): ParsingParameter.Editor<Record<string, any>> {
            const self = this

            return new class extends ParsingParameter.Editor {
                private elements: Rec.ElementWidget[]

                constructor() {
                    super(self)
                }

                render_implementation(value: any) {
                    this.elements = Object.entries(self.elements).map(([id, element]) =>
                        new Rec.ElementWidget(element, element.optional ? "check" : "none", depth + 1)
                            .set(value?.[id])
                            .onChange(v => {
                                this.commit(copyUpdate2(this.get(), e => e[id] = v))
                            })
                    )

                    this.additional.append(...this.elements.map(e => e.additional))
                }
            }
        }
    }

    export namespace Rec {
        import hbox = C.hbox;

        export type Element<T> = {
            name: string,
            type: ParsingParameter<T>
            optional?: boolean
        }

        export namespace Element {
            export type extr<T> = T extends Element<infer Q> ? Q : unknown
        }


        export class ElementWidget<T = any> extends Editor<T | undefined> {
            checkbox: Checkbox
            sub: Editor<T> = null

            constructor(public element: Element<T>, public cb_type: "none" | "check" | "radio", public depth: number) {
                super(element.type)
            }

            render_implementation(value: T | undefined) {
                const name_column = c().css("min-width", "100px")
                    .css("padding-left", `${this.depth * 5}px`)

                const control_column = c().css("flex-grow", "1")
                const el_content = c()

                switch (this.cb_type) {
                    case "check":
                        this.checkbox = new Checkbox(this.element.name, "checkbox")
                        break;
                    case "radio":
                        this.checkbox = new Checkbox(this.element.name, "radio")
                        break;
                }
                if (this.checkbox) {
                    this.checkbox
                        .setValue(value !== undefined)
                        .onCommit(v => {
                            const value = v ? this.element.type.getDefault() : undefined

                            this.commit(value)
                            this.render()
                        })
                        .appendTo(name_column)
                } else {
                    name_column.text(this.element.name)
                }

                this.additional.append(
                    hbox(name_column, control_column),
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