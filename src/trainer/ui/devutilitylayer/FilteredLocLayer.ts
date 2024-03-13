import {GameLayer} from "../../../lib/gamemap/GameLayer";
import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import Properties from "../widgets/Properties";
import TextArea from "../../../lib/ui/controls/TextArea";
import {storage} from "../../../lib/util/storage";
import {Observable, observe} from "../../../lib/reactive";
import {CacheTypes} from "./cachetools/CacheTypes";
import {LocUtil} from "./cachetools/util/LocUtil";
import TextField from "../../../lib/ui/controls/TextField";
import Checks from "../../../skillbertssolver/typecheck";
import num = Checks.num;
import LocDataFile = CacheTypes.LocDataFile;
import {MapEntity} from "../../../lib/gamemap/MapEntity";
import LocInstance = CacheTypes.LocInstance;
import {QuadTree} from "../../../lib/QuadTree";
import {FloorLevels, ZoomLevels} from "../../../lib/gamemap/ZoomLevels";
import {boxPolygon} from "../polygon_helpers";
import {Rectangle} from "lib/math";
import {GameMapContextMenuEvent} from "../../../lib/gamemap/MapEvents";
import {Menu} from "../widgets/ContextMenu";
import Widget from "../../../lib/ui/Widget";
import getInstances = LocUtil.getInstances;
import LocWithUsages = CacheTypes.LocWithUsages;
import {TransportParser2} from "./cachetools/TransportParser";
import {TransportParsers} from "./cachetools/parsers2";

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

class LocInstanceEntity extends MapEntity {

    constructor(public instance: LocInstance) {
        super({
            highlightable: false,
            interactive: true
        })

        this.zoom_sensitivity_layers = ZoomLevels.none

        this.floor_sensitivity_layers = FloorLevels.single(instance.origin.level)
    }

    protected async render_implementation(props: MapEntity.RenderProps): Promise<Element> {

        const has_parser = !!TransportParsers.lookup_parser(this.instance.loc_id)

        boxPolygon(this.instance.box).setStyle({
            color: has_parser ? "green" : "yellow",
            stroke: true
        }).addTo(this).getElement()

        return undefined
    }

    bounds(): Rectangle {
        return this.instance.box
    }

    async renderTooltip(): Promise<{ content: Widget; interactive: boolean } | null> {
        return {
            content: c().append(this.instance.loc_id.toString()),
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

    data: LocDataFile = null

    loc_entities: {
        loc: LocWithUsages,
        instances: LocInstanceEntity[]
    }[]

    constructor() {
        super();

        this.add(this.filter_control = new LocFilterControl())

        LocDataFile.fromURL("map/raw_loc_data.json").then(file => this.init(file))

        this.filter_control.filter.subscribe(() => this.applyFilter())
    }

    private applyFilter() {
        const pre_filter: LocFilter = {
            actions: ["open", "use", "enter", "climb", "crawl", "scale", "pass", "jump", "leave"]
        }

        this.loc_entities.forEach(loc => {
            const visible = LocFilter.apply(pre_filter, loc.loc) && LocFilter.apply(this.filter_control.filter.value(), loc.loc)

            loc.instances.forEach(instance => instance.setVisible(visible))
        })
    }

    init(data: LocDataFile) {
        this.data = data

        this.loc_entities = data.getAll().map((loc) => {
            return {
                loc: loc,
                instances: getInstances(loc).map(i => new LocInstanceEntity(i).addTo(this))
            }
        })

        this.applyFilter()

        this.loc_entities.forEach(l => l.instances.forEach(i => i.addTo(this)))
    }
}