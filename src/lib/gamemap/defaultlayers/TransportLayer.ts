import GameLayer from "../GameLayer";
import {Transportation} from "../../runescape/transportation";
import transportation = Transportation.transportation;
import {ShortcutEntity} from "./TeleportLayer";

export default class TransportLayer extends GameLayer {
    constructor(transports: transportation[]) {
        super();

        transports.forEach(t => new ShortcutEntity({
            highlightable: true,
            shortcut: t
        }).addTo(this))
    }
}