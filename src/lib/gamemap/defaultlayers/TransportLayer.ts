import GameLayer from "../GameLayer";
import {Transportation} from "../../runescape/transportation";
import transportation = Transportation.Transportation;
import {ShortcutEntity, TeleportEntity} from "./TeleportLayer";
import {teleport_data} from "../../../data/teleport_data";

export default class TransportLayer extends GameLayer {
    constructor(transports: transportation[], interactive: boolean) {
        super();

        teleport_data.getAllFlattened().forEach(tele => {
            new TeleportEntity({
                highlightable: true,
                teleport: tele,
                interactive: interactive
            })
                .addTo(this)
        })

        transports.forEach(t => new ShortcutEntity({
            highlightable: true,
            shortcut: t,
            interactive: interactive
        }).addTo(this))
    }
}