import {ValueInteraction} from "lib/gamemap/interaction/ValueInteraction";
import {Shortcuts} from "lib/runescape/shortcuts";
import {Transform, Vector2} from "lib/math";
import {TileRectangle} from "lib/runescape/coordinates";
import {TileCoordinates} from "lib/runescape/coordinates";
import {TileTransform} from "lib/runescape/coordinates/TileTransform";
import {floor_t} from "lib/runescape/coordinates";
import {GameMapKeyboardEvent, GameMapMouseEvent} from "../../../../lib/gamemap/MapEvents";
import {ShortcutViewLayer} from "../ShortcutView";
import InteractionTopControl from "../../map/InteractionTopControl";
import {observe} from "../../../../lib/reactive";
import {LodashHas} from "lodash/fp";

export class PlaceShortcut extends ValueInteraction<Shortcuts.shortcut> {

    private transform: TileTransform
    private final_translation_transform: TileTransform

    constructor(private original: Shortcuts.shortcut,
                private origin: TileCoordinates,
                private copy_handler: (copy: Shortcuts.shortcut) => void = null
    ) {
        super({
            preview_render: (s) => new ShortcutViewLayer.ShortcutPolygon(observe(s))
        });

        this.transform = TileTransform.translation(Vector2.neg(this.origin), -this.origin.level)
        this.final_translation_transform = TileTransform.translation(this.origin, this.origin.level)

        this.updatePreview()

        this.attachTopControl(new InteractionTopControl().setName("Placing Shortcut")
            .setContent(
                c("<div style='font-family: monospace; white-space:pre'></div>")
                    .append(c().text(`[R] - Rotate clockwise  | [Shift + R] - Rotate counterclockwise`))
                    .append(c().text(`[F] - Flip Horizontally | [Shift + F] - Flip vertically`))
                    .append(c().text(`[Click] - Place         ` + (this.copy_handler ? "| [Shift + Click] - Place copy" : "")))
            )
        )
    }

    eventHover(event: GameMapMouseEvent) {
        event.onPre(() => {
            this.final_translation_transform = TileTransform.translation(event.tile(), event.tile().level)
            this.updatePreview()
        })
    }

    private updatePreview() {
        this.preview(PlaceShortcut.transform(this.original,
            TileTransform.chain(
                this.final_translation_transform,
                this.transform
            )
        ))
    }

    eventKeyDown(event: GameMapKeyboardEvent) {
        event.onPost(() => {
            if (event.original.key.toLowerCase() == "r") {
                this.transform = TileTransform.chain(
                    Transform.rotation(event.original.shiftKey ? 3 : 1),
                    this.transform
                )
                this.updatePreview()
            } else if (event.original.key.toLowerCase() == "f") {
                this.transform = TileTransform.chain(
                    event.original.shiftKey ? Transform.mirror_y() : Transform.mirror_x(),
                    this.transform
                )
                this.updatePreview()
            }
        })
    }

    eventClick(event: GameMapMouseEvent) {
        event.onPre(() => {
            event.stopAllPropagation()

            this.final_translation_transform = TileTransform.translation(event.tile(), event.tile().level)

            if(event.original.shiftKey){
                this.copy_handler(PlaceShortcut.transform(this.original,
                    TileTransform.chain(
                        this.final_translation_transform,
                        this.transform
                    )
                ))
            } else {
                this.commit(PlaceShortcut.transform(this.original,
                    TileTransform.chain(
                        TileTransform.translation(event.tile(), event.tile().level),
                        this.transform
                    )
                ))
            }
        })
    }
}

export namespace PlaceShortcut {
    export function transform(s: Shortcuts.shortcut, trans: TileTransform): Shortcuts.shortcut {
        function dir(s: "eastwest" | "northsouth"): "eastwest" | "northsouth" {
            let v = s == "eastwest" ? {x: 1, y: 0} : {x: 0, y: 1}

            let new_v = Vector2.transform(v, trans.matrix)

            return Math.abs(new_v.x) > 0.1 ? "eastwest" : "northsouth"
        }

        switch (s.type) {
            case "door":
                return {
                    type: "door",
                    name: s.name,
                    area: TileRectangle.transform(s.area, trans),
                    direction: dir(s.direction)
                }
            case "entity":
                return {
                    type: "entity",
                    name: s.name,
                    clickable_area: TileRectangle.transform(s.clickable_area, trans),
                    actions: s.actions.map(a => ({
                        cursor: a.cursor,
                        interactive_area: TileRectangle.transform(a.interactive_area, trans),
                        movement: (() => {
                            switch (a.movement.type) {
                                case "fixed":
                                    return {
                                        type: "fixed",
                                        target: TileCoordinates.transform(a.movement.target, trans)
                                    }
                                case "offset":
                                    return {
                                        type: "offset",
                                        offset: Vector2.transform(a.movement.offset, trans.matrix),
                                        level_offset: floor_t.clamp(a.movement.level_offset + trans.level_offset)
                                    }
                            }
                        })(),
                        name: a.name,
                        time: a.time
                    }))
                }


        }
    }
}