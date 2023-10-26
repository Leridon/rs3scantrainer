import {MapCoordinate} from "./coordinates";
import {TypedEmitter} from "skillbertssolver/eventemitter";
import {teleport_data} from "data/teleport_data";
import {direction} from "./movement";

export type teleport_group = {
    id: string
    name: string
    img: string | { url: string, width?: number, height?: number }
    can_be_in_pota?: boolean
    spots: teleport_spot[]
}

export type teleport_spot = {
    id: string
    spot: MapCoordinate | (teleport_variant[])
    facing?: direction
    code?: string
    has_variants?: boolean
    name?: string
    menu_ticks: number
    animation_ticks: number
    img?: string | { url: string, width?: number, height?: number }
}

export type teleport_variant = { id: string, name: string, spot: MapCoordinate }

export type flat_teleport = {
    id: full_teleport_id,
    spot: MapCoordinate,
    icon: string | { url: string, width?: number, height?: number },
    code?: string,
    hover?: string,
    group: teleport_group,
    sub: teleport_spot,
    variant?: teleport_variant
    menu_ticks: number
    animation_ticks: number
}

type teleport_settings = {
    variants: {
        id: string,
        subid: string,
        variant_id: string
    }[]
    fairy_ring_favourites: string[],
    potas: {
        color: "red" | "purple" | "green" | "yellow",
        slots: string[],
        active: boolean
    }[]
}

export type full_teleport_id = {
    group: string,
    sub: string,
    variant?: string
}

export class Teleports extends TypedEmitter<{
    refreshed: Teleports
}> {
    private data: flat_teleport[]

    constructor(private settings: teleport_settings) {
        super()
        this.update()
    }

    updateSettings(settings: teleport_settings) {
        this.settings = settings

        this.update()
    }

    private update() {
        this.data = Teleports.flattenWithSettings(teleport_data.raw_data, this.settings)

        this.emit("refreshed", this)
    }

    get(id: string, subid: string = null): flat_teleport {
        return this.data.find((t) => t.id.group == id && (!subid || t.id.sub == subid))
    }

    getAll(): flat_teleport[] {
        return this.data
    }
}

export namespace Teleports {

    export namespace teleport_id {
        export function equals(a: full_teleport_id, b: full_teleport_id) {
            return a.group == b.group && a.sub == b.sub && ((!a.variant && !b.variant) || (a.variant == b.variant))
        }
    }

    export function find(data: flat_teleport[], id: full_teleport_id): flat_teleport {
        return data.find((t) => teleport_id.equals(t.id, id))
    }

    export function flatten(data: teleport_group[]): flat_teleport[] {
        return flattenWithSettings(data, {
            variants: [],
            fairy_ring_favourites: [],
            potas: []
        }, true)
    }

    export function flattenWithSettings(raw_data: teleport_group[], settings: teleport_settings, all_variants: boolean = false): flat_teleport[] {
        let data: flat_teleport[] = []

        for (let group of raw_data) {
            let pota = group.can_be_in_pota
                ? settings.potas.find((p) => p.active && p.slots.includes(group.id))
                : null

            let pota_prefix = pota ? `${pota.slots.indexOf(group.id) + 1},` : ""

            for (let sub of group.spots) {

                let variants: teleport_variant[]

                if (sub.has_variants) {
                    if (all_variants) variants = sub.spot as { id: string, name: string, spot: MapCoordinate }[]
                    else {
                        let vars = sub.spot as { id: string, name: string, spot: MapCoordinate }[]

                        let selected = settings.variants.find((v) => v.id == group.id && v.subid == sub.id)

                        variants = [selected
                            ? vars.find((v) => v.id == selected.variant_id)
                            : vars[0]]
                    }
                } else {
                    variants = [{id: undefined, name: "", spot: sub.spot as MapCoordinate}]
                }

                for (let variant of variants) {
                    let hover = group.name || sub.name
                    if (group.name && sub.name) hover = `${group.name} - ${sub.name}`

                    if (variant.name) hover += ` - ${variant.name}`

                    let flat: flat_teleport = {
                        id: {
                            group: group.id,
                            sub: sub.id,
                            variant: variant.id
                        },
                        spot: variant.spot,
                        icon: sub.img || group.img,
                        code: sub.code,
                        hover: hover,
                        group: group,
                        sub: sub,
                        variant: variant.id ? variant : undefined,
                        menu_ticks: sub.menu_ticks,
                        animation_ticks: sub.animation_ticks,
                    }

                    if (group.id == "fairyring") {
                        let index = settings.fairy_ring_favourites.indexOf(sub.id)
                        if (index >= 0) flat.code = ((index + 1) % 10).toString()
                    }

                    if (pota) {
                        flat.code = pota_prefix + flat.code
                        flat.icon = `pota_${pota.color}.png`
                    }

                    data.push(flat)
                }
            }
        }

        return data
    }
}
