import GameLayer from "../GameLayer";
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import {GameMap} from "../GameMap";
import Checks from "../../../skillbertssolver/typecheck";
import int = Checks.int;

export class InteractionGuard {
    private interaction: InteractionLayer = null

    set<T extends InteractionLayer>(interaction: T, target: GameLayer): T {
        this.reset()


        if (interaction) {
            if (interaction._guard) interaction._guard.reset()

            this.interaction = interaction
            interaction._guard = this

            interaction.addTo(target)
        }

        return interaction
    }

    reset() {
        if (this.interaction) {
            this.interaction._guard = null
            this.interaction.cancel()
        }

        this.interaction = null

        return this
    }
}

export default class InteractionLayer extends GameLayer {
    _guard: InteractionGuard = null

    events: TypedEmitter<{
        "cancelled": InteractionLayer,
        "started": InteractionLayer
    }> = new TypedEmitter()

    onAdd(map: GameMap): this {
        super.onAdd(map)

        this.events.emit("started", this)

        return this
    }

    cancel() {
        if (this._guard) this._guard.reset()
        this.remove()
        this.cancelled()
    }

    handle(event: "cancelled" | "started", handler: (_: InteractionLayer) => void): this {
        this.events.on(event, handler)
        return this
    }

    onEnd(handler: () => any): this {
        this.events.on("cancelled", handler)
        return this
    }

    onStart(handler: () => void): this {
        this.events.on("started", handler)
        return this
    }

    protected cancelled() {
        this.events.emit("cancelled", this)
    }
}