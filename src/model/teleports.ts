import {MapCoordinate} from "./coordinates";
import {TypedEmitter} from "../skillbertssolver/eventemitter";
import {teleport_data} from "../data/teleport_data";

export type teleport_group = {
    id: string,
    name: string,
    img: string | { url: string, width?: number, height?: number }
    can_be_in_pota?: boolean,
    spots: teleport_spot[]
}

export type teleport_spot = {
    subid: string,
    spot: MapCoordinate | ({ id: string, name: string, spot: MapCoordinate }[]),
    code?: string,
    has_variants?: boolean
    hover?: string,
    img?: string | { url: string, width?: number, height?: number }
}

export type flat_teleport = {
    id: full_teleport_id,
    spot: MapCoordinate,
    icon: string | { url: string, width?: number, height?: number },
    code?: string,
    hover?: string
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

        this.data = []

        for (let group of teleport_data.raw_data) {
            let pota = group.can_be_in_pota
                ? this.settings.potas.find((p) => p.active && p.slots.includes(group.id))
                : null

            let pota_prefix = pota ? `${pota.slots.indexOf(group.id) + 1},` : ""

            for (let sub of group.spots) {

                let spot: MapCoordinate = null

                if (sub.has_variants) {
                    let variants = sub.spot as { id: string, name: string, spot: MapCoordinate }[]

                    let selected = this.settings.variants.find((v) => v.id == group.id && v.subid == sub.subid)

                    spot = selected
                        ? variants.find((v) => v.id == selected.variant_id).spot
                        : variants[0].spot
                } else {
                    spot = sub.spot as MapCoordinate
                }

                let hover = group.name || sub.hover
                if (group.name && sub.hover) hover = `${group.name} - ${sub.hover}`

                let flat = {
                    id: {
                        group: group.id,
                        sub: sub.subid
                    },
                    spot: spot,
                    icon: sub.img || group.img,
                    code: sub.code,
                    hover: hover
                }

                if (group.id == "fairyring") {
                    let index = this.settings.fairy_ring_favourites.indexOf(sub.subid)
                    if (index >= 0) flat.code = ((index + 1) % 10).toString()
                }

                if (pota) {
                    flat.code = pota_prefix + flat.code
                    flat.icon = `pota_${pota.color}.png`
                }

                this.data.push(flat)
            }
        }

        this.emit("refreshed", this)
    }

    get(id: string, subid: string = null): flat_teleport {
        return this.data.find((t) => t.id.group == id && (!subid || t.id.sub == subid))
    }

    getAll(): flat_teleport[] {
        return this.data
    }
}
