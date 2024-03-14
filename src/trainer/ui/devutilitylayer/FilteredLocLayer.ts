import {GameLayer, time, timeSync} from "../../../lib/gamemap/GameLayer";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import Properties from "../widgets/Properties";
import TextArea from "../../../lib/ui/controls/TextArea";
import {storage} from "../../../lib/util/storage";
import {Observable, observe} from "../../../lib/reactive";
import {CacheTypes} from "./cachetools/CacheTypes";
import {LocUtil} from "./cachetools/util/LocUtil";
import TextField from "../../../lib/ui/controls/TextField";
import LocDataFile = CacheTypes.LocDataFile;
import {MapEntity} from "../../../lib/gamemap/MapEntity";
import LocInstance = CacheTypes.LocInstance;
import {FloorLevels, ZoomLevels} from "../../../lib/gamemap/ZoomLevels";
import {boxPolygon} from "../polygon_helpers";
import {Rectangle, Vector2} from "lib/math";
import {GameMapContextMenuEvent} from "../../../lib/gamemap/MapEvents";
import {Menu} from "../widgets/ContextMenu";
import Widget from "../../../lib/ui/Widget";
import getInstances = LocUtil.getInstances;
import LocWithUsages = CacheTypes.LocWithUsages;
import * as leaflet from "leaflet"

import {LocParsingTable} from "./cachetools/LocParsingAssociation";
import {C} from "../../../lib/ui/constructors";
import staticentity = C.staticentity;
import getActions = LocUtil.getActions;
import {CursorType} from "../../../lib/runescape/CursorType";
import hbox = C.hbox;
import inlineimg = C.inlineimg;
import vbox = C.vbox;
import hboxl = C.hboxl;

export type LocFilter = {
    names?: string[],
    actions?: string[],
    object_id?: number,
}

export namespace LocFilter {
    import getActions = LocUtil.getActions;
    import LocWithUsages = CacheTypes.LocWithUsages;

    export function normalize(filter: LocFilter): LocFilter {
        if (!filter.names) filter.names = []
        if (!filter.actions) filter.actions = []

        return filter
    }

    export function apply(filter: LocFilter, loc: LocWithUsages): boolean {
        if (filter.object_id != null && loc.id != filter.object_id) return false

        if (filter.names && filter.names.length > 0 && !filter.names.some(n => loc.location.name!.toLowerCase().includes(n.toLowerCase()))) return false

        if (filter.actions && filter.actions.length > 0) {
            const actions = getActions(loc.location)

            if (!actions.some(a => filter.actions?.some(filter_action =>
                a.name.toLowerCase().includes(filter_action.toLowerCase()),
            ))) return false
        }

        return true
    }
}

class LocFilterControl extends GameMapControl {
    storage = new storage.Variable<LocFilter>("devutility/locfilter", () => ({}))

    filter: Observable<LocFilter>

    constructor() {
        super({
            type: "floating",
            position: "top-right",
        }, c());

        this.filter = observe(this.storage.get() ?? {})

        const props = new Properties()

        props.header("Entity Names")
        props.row(
            new TextArea()
                .setValue(this.filter.value().names ? this.filter.value().names.join("\n") : "")
                .onCommit(v => {

                    const names = v.split("\n").map(l => l.trim().toLowerCase()).filter(l => l.length > 0)

                    this.filter.update(f => f.names = names)
                })
                .css("height", "80px")
        )

        props.header("Action Names")
        props.row(
            new TextArea()
                .setValue(this.filter.value().actions ? this.filter.value().actions.join("\n") : "")
                .onCommit(v => {
                    const names = v.split("\n").map(l => l.trim().toLowerCase()).filter(l => l.length > 0)

                    this.filter.update(f => f.actions = names)
                })
                .css("height", "80px")
        )

        props.named("Object ID", new TextField()
            .setValue(this.filter.value().object_id != null ? this.filter.value().object_id.toString() : "")
            .onCommit((v) => {
                const numeric = Number(v)

                this.filter.update(f => f.object_id = !v || isNaN(numeric) ? undefined : numeric)
            })
        )

        this.filter.subscribe((f) => {
            this.storage.set(f)
        })

        this.content.append(props)
    }
}

export class LocInstanceEntity extends MapEntity {

    constructor(public instance: LocInstance, private parsing_table: LocParsingTable) {
        super({
            highlightable: true,
            interactive: true
        })

        this.zoom_sensitivity_layers = ZoomLevels.none

        this.floor_sensitivity_layers = FloorLevels.single(instance.origin.level)
    }

    protected async render_implementation(props: MapEntity.RenderProps): Promise<Element> {

        const has_parser = this.parsing_table.hasParser(this.instance)

        boxPolygon(this.instance.box).setStyle({
            color: has_parser ? "green" : "red",
            stroke: true
        }).addTo(this).getElement()

        const rot = this.instance.rotation ?? 0

        let true_west: [Vector2, Vector2]

        const rect = Rectangle.extend(this.instance.box, 0.5)

        switch (this.instance.rotation ?? 0) {
            case 0:
                true_west = [Rectangle.bottomLeft(rect), Rectangle.topLeft(rect)]
                break
            case 1:
                true_west = [Rectangle.topLeft(rect), Rectangle.topRight(rect)]
                break
            case 2:
                true_west = [Rectangle.topRight(rect), Rectangle.bottomRight(rect)]
                break
            case 3:
                true_west = [Rectangle.bottomRight(rect), Rectangle.bottomLeft(rect)]
                break
        }

        leaflet.polyline(true_west.map(Vector2.toLatLong), {
            color: "blue"
        }).addTo(this)

        return undefined
    }

    bounds(): Rectangle {
        return this.instance.box
    }

    async renderTooltip(): Promise<{ content: Widget; interactive: boolean } | null> {

        const parser = this.parsing_table.getParser(this.instance)

        let props = new Properties()

        props.header(c().append(staticentity(this.instance.prototype.name), ` (${this.instance.loc_id})`))
        props.named("Actions", vbox(...getActions(this.instance.prototype).map(a => {
            return hboxl(inlineimg(CursorType.meta(a.cursor).icon_url).css("margin-right", "5px"), a.name)
        })))
        props.named("Size", `${this.instance.prototype.width ?? 1} x ${this.instance.prototype.length ?? 1}`)
        props.named("Rotation", (this.instance.rotation ?? 0).toString())
        props.named("Parser", parser ? parser : "-")

        return {
            content: props,
            interactive: false
        }
    }

    async contextMenu(event: GameMapContextMenuEvent): Promise<Menu | null> {
        return {
            type: "submenu",
            text: this.instance.prototype.name ?? "Entity",
            children: []
        }
    }
}

export class FilteredLocLayer extends GameLayer {

    filter_control: LocFilterControl

    loc_entities: {
        loc: LocWithUsages,
        instances: LocInstanceEntity[]
    }[]

    constructor(private data: LocDataFile, private parsing_table: LocParsingTable) {
        super();

        this.add(this.filter_control = new LocFilterControl())

        this.init()

        this.filter_control.filter.subscribe(() => this.applyFilter())
    }

    private applyFilter() {
        const pre_filter: LocFilter = {
            actions: ["open", "use", "enter", "climb", "crawl", "scale", "pass", "jump", "leave", "teleport", "descend", "step"]
        }

        this.loc_entities.forEach(loc => {
            const visible = LocFilter.apply(pre_filter, loc.loc) && LocFilter.apply(this.filter_control.filter.value(), loc.loc)

            loc.instances.forEach(instance => instance.setVisible(visible))
        })
    }

    init() {
        timeSync("Initializing loc_entities", () => {
            this.loc_entities = this.data.getAll().map((loc) => {
                return {
                    loc: loc,
                    instances: getInstances(loc).map(i => new LocInstanceEntity(i, this.parsing_table))
                }
            })
        })

        this.applyFilter()

        this.loc_entities.forEach(l => l.instances.forEach(i => i.addTo(this)))
    }
}