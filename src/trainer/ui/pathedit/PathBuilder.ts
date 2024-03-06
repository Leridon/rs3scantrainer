import {StateStack, UndoRedo} from "../../../lib/UndoRedo";
import {Observable, observe} from "../../../lib/reactive";
import {Path} from "../../../lib/runescape/pathing";
import {TileRectangle} from "../../../lib/runescape/coordinates";
import {PathStepEntity} from "../map/entities/PathStepEntity";
import GameLayer from "../../../lib/gamemap/GameLayer";
import movement_state = Path.movement_state;
import {util} from "../../../lib/util/util";
import * as lodash from "lodash";

export class PathBuilder2 {
    preview_layer: GameLayer
    undoredo: UndoRedo<PathBuilder2.SavedState>

    cursor: Observable<number>
    committed_value = observe<{
        path: Path.augmented,
        steps: PathBuilder2.Step[]
    }>(null)

    private path: Path = []

    constructor(private meta: {
        target?: TileRectangle,
        start_state?: movement_state
    } = {}) {
        this.undoredo = new UndoRedo<PathBuilder2.SavedState>(state => this.restoreState(state))

        this.commit()
    }

    private async commit(): Promise<void> {
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
            path: augmented,
            steps: steps,
        })
    }

    setCursor(index: number): this {
        this.cursor.set(index)

        return this
    }

    add(...steps: Path.Step[]): this {
        this.saveState()

        this.path.splice(this.cursor.value(), 0, ...steps)

        this.commit()

        return this
    }

    move(from: number, to: number): this {
        this.saveState()

        const [removed] = this.path.splice(from, 1)

        if (from >= to) to += 1

        this.path.splice(to, 0, removed)

        this.commit()

        return this
    }

    delete(index: number): this {
        this.saveState()

        this.path.splice(index, 1)

        this.commit()

        return this
    }

    update(index: number, f: (_: Path.Step) => void): this {
        this.saveState()

        const copy = lodash.cloneDeep(this.path[index])

        f(copy)

        this.path[index] = copy

        this.commit()

        return this
    }

    load(path: Path): this {

        this.undoredo.stack.reset()

        this.path = path

        this.commit()

        return this
    }

    private copyState(): PathBuilder2.SavedState {
        return {
            cursor: this.cursor.value(),
            path: lodash.cloneDeep(this.path)
        }
    }

    private saveState(): void {
        this.undoredo.stack.pushState(this.copyState())
    }

    private async restoreState(state: PathBuilder2.SavedState): Promise<void> {
        this.cursor.set(0)

        this.path = state.path

        await this.commit()

        this.cursor.set(state.cursor)
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
            this.parent.update(this.index, f)
        }

        delete(): void {
            this.parent.delete(this.index)
        }
    }

    export type SavedState = {
        cursor: number,
        path: Path.raw
    }
}
