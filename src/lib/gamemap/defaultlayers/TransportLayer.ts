import GameLayer from "../GameLayer";
import {Transportation} from "../../runescape/transportation";
import transportation = Transportation.transportation;
import {ShortcutEntity, TeleportEntity} from "./TeleportLayer";
import {teleport_data} from "../../../data/teleport_data";

export default class TransportLayer extends GameLayer {
    constructor(transports: transportation[]) {
        super();

        teleport_data.getAllFlattened().forEach(tele => {
            new TeleportEntity({highlightable: true, teleport: tele})
                .addTo(this)
        })

        transports.forEach(t => new ShortcutEntity({
            highlightable: true,
            shortcut: t
        }).addTo(this))
    }
}