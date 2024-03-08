import {StateStack, UndoRedo} from "../../../lib/UndoRedo";
import {Observable, observe} from "../../../lib/reactive";
import {Path} from "../../../lib/runescape/pathing";
import {TileRectangle} from "../../../lib/runescape/coordinates";
import {PathStepEntity} from "../map/entities/PathStepEntity";
import GameLayer from "../../../lib/gamemap/GameLayer";
import movement_state = Path.movement_state;
import * as lodash from "lodash";
import {util} from "../../../lib/util/util";
import copyUpdate = util.copyUpdate;

export class PathBuilder2 {
    private commit_lock: Promise<void> = Promise.resolve()

    preview_layer: GameLayer
    undoredo: UndoRedo<PathBuilder2.SavedState>

    cursor = 0

    committed_value = observe<PathBuilder2.Value>(null)

    cursor_state = observe<PathBuilder2.CursorState>(null)

    private path: Path = []

    constructor(private meta: {
                    target?: TileRectangle,
                    start_state?: movement_state
                } = {},
                initial_value: Path = []) {
        this.undoredo = new UndoRedo<PathBuilder2.SavedState>(state => this.restoreState(state))

        this.preview_layer = new GameLayer()

        this.commit(initial_value.length, initial_value)
    }

    async commit(cursor: number | undefined, path: Path | undefined, save_state: boolean = true) {
        await this.commit_lock

        this.commit_lock = (async () => {
            // Update cursor
            const length = path !== undefined ? path.length : this.path.length
            this.cursor = Math.max(0, Math.min(length, cursor ?? cursor))

            if (path !== undefined) {
                this.path = path

                const augmented = await Path.augment(this.path, this.meta.start_state, this.meta.target)

                const steps = augmented.steps.map((step, index): PathBuilder2.Step => {
                    return new PathBuilder2.Step(
                        this,
                        index,
                        step,
                    )
                })

                // Render previews
                {
                    const layer = new GameLayer()

                    steps.forEach(v => {
                        v.associated_preview = new PathStepEntity({step: v.step.raw, highlightable: true, interactive: true})
                            .addTo(layer)
                    })

                    this.preview_layer.clearLayers().add(layer)
                }

                this.committed_value.set({
                    builder: this,
                    path: augmented,
                    steps: steps,
                })
            }

            if (save_state) this.saveState()

            this.cursor_state.set({
                state: Path.augmented.getState(this.committed_value.value().path, this.cursor),
                value: this.committed_value.value(),
                cursor: this.cursor
            })
        })()
    }

    setCursor(index: number): this {
        this.commit(index, undefined, false)

        return this
    }

    add(...steps: Path.Step[]): this {
        this.commit(
            this.cursor + steps.length,
            copyUpdate(this.path, path => {
                path.splice(this.cursor, 0, ...steps)
            })
        )

        return this
    }

    move(from: number, to: number): this {
        if (from == to) return

        let cursor_offset = 0

        if (from >= this.cursor && to < this.cursor) cursor_offset = 1
        if (from < this.cursor && to >= this.cursor) cursor_offset = -1

        this.commit(
            this.cursor + cursor_offset,
            copyUpdate(this.path, path => {
                const [removed] = path.splice(from, 1)

                if (from <= to) to -= 1

                path.splice(to, 0, removed)
            })
        )

        return this
    }

    delete(index: number): this {

        this.commit(
            undefined,
            copyUpdate(this.path, path => {
                path.splice(index, 1)
            })
        )

        return this
    }

    updateCopy(index: number, f: (_: Path.Step) => void): this {
        const copy = lodash.cloneDeep(this.path[index])

        f(copy)

        return this.update(index, copy)
    }

    update(index: number, step: Path.Step): this {
        this.commit(
            undefined,
            copyUpdate(this.path, path => {
                path[index] = lodash.cloneDeep(step)
            })
        )

        return this
    }

    async set(path: Path, reset_history: boolean = false): Promise<this> {
        await this.commit_lock

        if (reset_history) {
            this.undoredo.stack.reset()
        }

        this.commit(
            path.length,
            path
        )

        return this
    }

    private copyState(): PathBuilder2.SavedState {
        return {
            cursor: this.cursor,
            path: lodash.cloneDeep(this.path)
        }
    }

    private saveState(): void {
        this.undoredo.stack.pushState(this.copyState())
    }

    private async restoreState(state: PathBuilder2.SavedState): Promise<void> {
        this.commit(
            state.cursor,
            state.path,
            false
        )
    }

    get(): Path {
        return this.path
    }
}

export namespace PathBuilder2 {
    export class Step {
        associated_preview: PathStepEntity = null

        constructor(
            public parent: PathBuilder2,
            public index: number,
            public step: Path.augmented_step,
        ) {}

        update<T extends Path.Step>(f: (_: T) => void): void {
            this.parent.updateCopy(this.index, f)
        }

        delete(): void {
            this.parent.delete(this.index)
        }
    }

    export type CursorState = {
        cursor: number,
        state: movement_state,
        value: Value
    }

    export type Value = {
        builder: PathBuilder2,
        path: Path.augmented,
        steps: PathBuilder2.Step[]
    }

    export type SavedState = {
        cursor: number,
        path: Path.raw
    }
}
