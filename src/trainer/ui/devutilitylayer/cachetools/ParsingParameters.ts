import {Checkbox} from "../../../../lib/ui/controls/Checkbox";
import {C} from "../../../../lib/ui/constructors";
import {ewent} from "../../../../lib/reactive";
import {util} from "../../../../lib/util/util";
import TextField from "../../../../lib/ui/controls/TextField";
import {AbstractDropdownSelection} from "../../widgets/AbstractDropdownSelection";
import {DropdownSelection} from "../../widgets/DropdownSelection";
import {Transportation} from "../../../../lib/runescape/transportation";
import {direction} from "../../../../lib/runescape/movement";
import Widget from "../../../../lib/ui/Widget";
import {CacheTypes} from "./CacheTypes";
import LocInstance = CacheTypes.LocInstance;
import {LocUtil} from "./util/LocUtil";
import {CursorType} from "../../../../lib/runescape/CursorType";
import NumberInput from "../../../../lib/ui/controls/NumberInput";
import {floor_t} from "../../../../lib/runescape/coordinates";

export abstract class ParsingParameter<T = any> {
    constructor(private _default_value: ParsingParameter.P<T>) {}

    default(f: ParsingParameter.P<T>) {
        this._default_value = f
    }

    getDefault(loc: LocInstance): T {
        return ParsingParameter.P.apply(this._default_value, loc)
    }

    abstract renderForm(depth: number, loc: LocInstance): ParsingParameter.Editor<T>
}

export namespace ParsingParameter {
    import copyUpdate2 = util.copyUpdate2;
    import Movement = Transportation.EntityTransportation.Movement;
    import getNthAction = LocUtil.getNthAction;
    import hboxl = C.hboxl;
    import inlineimg = C.inlineimg;
    import getActions = LocUtil.getActions;

    export type P<T> = T | ((loc: LocInstance) => T)

    export namespace P {
        export function apply<T>(p: P<T>, loc: LocInstance): T {
            if (typeof p == "function") return (p as ((loc: LocInstance) => T))(loc)
            else return p
        }
    }

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


    export function int(bounds: P<[number, number]> = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]): ParsingParameter<number> {
        return new class extends ParsingParameter<number> {
            constructor() {
                super((loc) => Math.max(P.apply(bounds, loc)[0], 0))
            }

            override renderForm(depth: number, loc: LocInstance): Editor<number> {
                const self = this

                return new class extends ParsingParameter.Editor<number> {
                    constructor() {
                        super(self)
                    }

                    render_implementation(value: number) {
                        const [min, max] = P.apply(bounds, loc)

                        this.control.append(new NumberInput(min, max)
                            .onCommit(v => this.commit(v))
                            .setValue(value))
                    }
                }
            }
        }
    }

    export function floor(): ParsingParameter<floor_t> {
        return int([0, 3]) as ParsingParameter<floor_t>
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

    export function choose<T>(type_class: P<AbstractDropdownSelection.selectable<T>>, choices: P<T[]>): ParsingParameter<T> {

        return new class extends ParsingParameter<T> {
            constructor() {
                super((loc) => P.apply(choices, loc)[0])
            }

            override renderForm(depth: number, loc: LocInstance): Editor<T> {
                const self = this

                return new class extends ParsingParameter.Editor<T> {
                    render_implementation(value: T) {
                        this.control.append(new DropdownSelection({type_class: P.apply(type_class, loc)}, P.apply(choices, loc))
                            .onSelection(v => this.commit(v))
                            .setValue(value))
                    }

                    constructor() {
                        super(self)
                    }
                }
            }
        }
    }

    export function dir(): ParsingParameter<direction> {
        return choose<direction>({
            toHTML: (v: direction): Widget => c().text(direction.toString(v))
        }, () => direction.all)
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

    export function locAction(): ParsingParameter<{
        id: number
    }> {

        return choose<{ id: number }>((loc) => ({
            toHTML: (v: { id: number }) => {
                const a = getNthAction(loc.prototype, v.id)

                if (!a) return c().text("undefined")

                return hboxl(inlineimg(CursorType.meta(a.cursor).icon_url), " ", a.name)
            }
        }), (loc) => getActions(loc.prototype).map(a => ({id: a.cache_id})))
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
            super((loc) => {

                return Object.fromEntries(
                    Object.entries(elements).map(([key, value]) => [key, value.optional ? undefined : value.type.getDefault(loc)])
                ) as { [key in keyof T]?: Rec.Element.extr<T[key]> } // There's probably an idiomatic way to get this to typecheck without this cast
            });
        }

        override renderForm(depth: number, loc: LocInstance): ParsingParameter.Editor<Record<string, any>> {
            const self = this

            return new class extends ParsingParameter.Editor {
                private elements: Rec.ElementWidget[]

                constructor() {
                    super(self)
                }

                render_implementation(value: any) {
                    this.elements = Object.entries(self.elements).map(([id, element]) =>
                        new Rec.ElementWidget(element, element.optional ? "check" : "none", depth + 1, loc)
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

            constructor(public element: Element<T>, public cb_type: "none" | "check" | "radio", public depth: number, private loc: LocInstance) {
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
                            const value = v ? this.element.type.getDefault(this.loc) : undefined

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
                        .renderForm(this.depth + 1, this.loc)
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