import GameLayer from "../GameLayer";
import {Transportation} from "../../runescape/transportation";
import transportation = Transportation.Transportation;
import {ShortcutEntity, TeleportEntity} from "./TeleportLayer";
import {TransportData} from "../../../data/transports";

export default class TransportLayer extends GameLayer {
    constructor(transports: transportation[], interactive: boolean) {
        super();

        TransportData.getAllTeleportSpots().forEach(spot => {
            new TeleportEntity({
                highlightable: true,
                teleport: spot,
                interactive: interactive
            })
                .addTo(this)
        })

        TransportData.cache_extracted_transportation.forEach(t => new ShortcutEntity({
            highlightable: true,
            shortcut: t,
            interactive: interactive
        }).addTo(this))
    }
}