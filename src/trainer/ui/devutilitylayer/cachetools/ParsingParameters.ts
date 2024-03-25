import {Checkbox} from "../../../../lib/ui/controls/Checkbox";
import {C} from "../../../../lib/ui/constructors";
import {ewent} from "../../../../lib/reactive";
import {util} from "../../../../lib/util/util";
import TextField from "../../../../lib/ui/controls/TextField";
import {AbstractDropdownSelection} from "../../widgets/AbstractDropdownSelection";
import {DropdownSelection} from "../../widgets/DropdownSelection";
import {direction} from "../../../../lib/runescape/movement";
import Widget from "../../../../lib/ui/Widget";
import {CacheTypes} from "./CacheTypes";
import {LocUtil} from "./util/LocUtil";
import {CursorType} from "../../../../lib/runescape/CursorType";
import NumberInput from "../../../../lib/ui/controls/NumberInput";
import {floor_t, TileCoordinates} from "../../../../lib/runescape/coordinates";
import {TileArea} from "../../../../lib/runescape/coordinates/TileArea";
import {GameMapMiniWidget} from "../../../../lib/gamemap/GameMap";
import LightButton from "../../widgets/LightButton";
import {DrawTileAreaInteraction} from "../DrawTileAreaInteraction";
import {ValueInteraction} from "../../../../lib/gamemap/interaction/ValueInteraction";
import InteractionTopControl from "../../map/InteractionTopControl";
import LocInstance = CacheTypes.LocInstance;

export abstract class ParsingParameter<T = any> {
  constructor(private _default_value: ParsingParameter.P<T>) {}

  default(f: ParsingParameter.P<T>): this {
    this._default_value = f

    return this
  }

  getDefault(loc: LocInstance): T {
    return ParsingParameter.P.apply(this._default_value, loc)
  }

  abstract renderForm(depth: number, loc: LocInstance, map: GameMapMiniWidget): ParsingParameter.Editor<T>
}

export namespace ParsingParameter {
  import copyUpdate2 = util.copyUpdate2;
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
        }(self)
      }
    }
  }

  export function dir(): ParsingParameter<direction> {
    return choose<direction>({
      toHTML: (v: direction): Widget => c().text(direction.toString(v))
    }, () => direction.all)
  }

  export function tileArea(): ParsingParameter<TileArea> {
    return (new class extends ParsingParameter<TileArea> {

      constructor() {
        super(TileArea.init({x: 0, y: 0, level: 0}));
      }

      renderForm(depth: number, loc: CacheTypes.LocInstance, map: GameMapMiniWidget): Editor<TileArea> {
        const self = this

        return new class extends ParsingParameter.Editor<TileArea> {
          edited_tiles: TileCoordinates[]
          interaction: ValueInteraction<any> = null

          render_implementation(value: TileArea): void {
            this.edited_tiles = TileArea.activate(value).getTiles().filter(t => t.x != 0 || t.y != 0)

            this.update_render()
          }

          private commitTiles() {
            console.log(this.edited_tiles)

            this.commit(TileArea.fromTiles(this.edited_tiles))
          }

          private update_render(): void {

            const editor = this

            this.control.empty().append(hboxl(
              this.edited_tiles.length > 0
                ? c().text(`${this.edited_tiles.length} tiles near ${TileCoordinates.toString(this.edited_tiles[0])}`)
                : c().text(`${this.edited_tiles.length} tiles`),
              new LightButton(this.interaction ? "Stop Editing" : "Edit")
                .onClick(() => {

                  if (this.interaction) {
                    this.interaction.cancel()
                  } else {
                    map.setInteraction(
                      this.interaction = (new class extends ValueInteraction<TileCoordinates[]> {
                        constructor() {
                          super();

                          new DrawTileAreaInteraction(editor.edited_tiles)
                            .onPreview(v => this.preview(v))
                            .attachTopControl(null)
                            .addTo(this)


                          this.attachTopControl(new InteractionTopControl({name: "Draw Tile Area"})
                            .setContent(
                              c("<div style='font-family: monospace; white-space:pre'></div>")
                                .append(c().text(`[Shift + Mouse] add tiles, [Alt + Mouse] remove tiles`))
                            ))
                        }
                      })
                        .onPreview(v => {
                          this.edited_tiles = v
                          this.update_render()
                        })
                        .onEnd(() => {
                          this.commitTiles()

                          this.interaction = null
                          this.update_render()
                        })
                    )

                    this.update_render()
                  }
                }),
              new LightButton("Reset")
                .onClick(() => {
                  this.edited_tiles = []
                  this.interaction?.cancel()
                  this.update_render()

                  this.commitTiles()
                })
            ))
          }
        }(self)
      }
    })
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

    override renderForm(depth: number, loc: LocInstance, map: GameMapMiniWidget): ParsingParameter.Editor<Record<string, any>> {
      const self = this

      return new class extends ParsingParameter.Editor {
        private elements: Rec.ElementWidget[]

        constructor() {
          super(self)
        }

        render_implementation(value: any) {
          this.elements = Object.entries(self.elements).map(([id, element]) =>
            new Rec.ElementWidget(element, element.optional ? "check" : "none", depth + 1, loc, map)
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

      constructor(public element: Element<T>,
                  public cb_type: "none" | "check" | "radio",
                  public depth: number,
                  private loc: LocInstance,
                  private map: GameMapMiniWidget) {
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
            .renderForm(this.depth + 1, this.loc, this.map)
            .onChange(v => this.commit(v))
            .set(value)

          control_column.append(this.sub.control)
          el_content.append(this.sub.additional)
        }
      }
    }
  }

  export function list<T>(base: ParsingParameter<T>): ParsingParameter<T[]> {
    return new class extends ParsingParameter<T[]> {
      constructor() {super([]);}

      renderForm(depth: number, loc: CacheTypes.LocInstance, map: GameMapMiniWidget): ParsingParameter.Editor<T[]> {
        const self = this

        return new class extends ParsingParameter.Editor<T[]> {
          private elements: Rec.ElementWidget[]

          constructor() {
            super(self)
          }

          render_implementation(value: T[]) {
            this.control.append(new LightButton("Add")
              .onClick(() => {
                  this.commit(copyUpdate2(this.get(), e => e.push(base.getDefault(loc))))
                  this.render()
                }
              )
            )

            this.elements = value.map((element, i) =>
              new Rec.ElementWidget({
                name: `Item ${i}`,
                type: base
              }, "check", depth + 1, loc, map)
                .set(element)
                .onChange(v => {
                  if (v == undefined) {
                    this.commit(copyUpdate2(this.get(), e => e.splice(i, 1)))
                    this.render()
                  } else {
                    this.commit(copyUpdate2(this.get(), e => e[i] = v))
                  }
                })
            )

            this.additional.append(...this.elements.map(e => e.additional))
          }
        }
      }
    }
  }

  export function either<T extends Record<string, ParsingParameter>>(
    elements: T
  ): ParsingParameter<{ [key in keyof T]?: Rec.Element.extr<T[key]> }> {
    return null
  }

  export class Either<T, U> extends ParsingParameter<T | U> {
    renderForm(depth: number): ParsingParameter.Editor<T | U> {
      return undefined;
    }
  }

}