import {MapEntity} from "../../../../lib/gamemap/MapEntity";
import {Transportation} from "../../../../lib/runescape/transportation";
import TeleportAccess = Transportation.TeleportAccess;

export class TeleportAccessEntity extends MapEntity {
    protected render_implementation(options: MapEntity.RenderProps): Promise<Element> {
        throw new Error("Method not implemented.");
    }

    constructor(private access: TeleportAccess) {
        super({interactive: true, highlightable: true});
    }
}