import GameLayer from "../GameLayer";

export class InteractionGuard extends GameLayer {
    private interaction: InteractionLayer = null

    set(interaction: InteractionLayer): this {
        if (this.interaction) {
            this.interaction._guard = null
            this.interaction.remove()
            interaction.cancel()
        }

        this.interaction = interaction

        console.assert(interaction._guard == null)

        if (interaction) {
            interaction.addTo(this)
            interaction._guard = this
        }

        return this
    }
}

export default class InteractionLayer extends GameLayer {
    _guard: InteractionGuard = null

    cancel() {
        if (this._guard) this._guard.set(null)
        else this.cancelled()
    }

    protected cancelled() {}
}