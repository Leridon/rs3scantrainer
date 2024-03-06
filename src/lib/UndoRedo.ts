import {Observable, observe} from "./reactive";
import {identity} from "lodash";

export class StateStack<T> {
    canUndo: Observable<boolean> = observe(false)
    canRedo: Observable<boolean> = observe(false)

    private stacks: { undo: T[], redo: T[] } = {
        undo: [],
        redo: []
    }

    private update() {
        this.canUndo.set(this.stacks.undo.length > 0)
        this.canRedo.set(this.stacks.redo.length > 0)
    }

    pushState(value: T) {
        this.stacks.undo.push(value)
    }

    undo(): T {
        if (this.stacks.undo.length > 0) {
            const state = this.stacks.undo.pop()
            this.stacks.redo.push(state)

            this.update()

            return state
        }
    }

    redo(): T {

        if (this.stacks.redo.length > 0) {
            const state = this.stacks.redo.pop()
            this.stacks.undo.push(state)

            this.update()

            return state
        }
    }

    reset() {
        this.stacks.undo = []
        this.stacks.redo = []

        this.update()
    }
}

export class UndoRedo<T> {
    stack = new StateStack<T>()

    canUndo = this.stack.canUndo.map(identity)
    canRedo = this.stack.canRedo.map(identity)

    constructor(private apply_state: (state: T) => any | Promise<any>) {}

    undo(): void | Promise<void> {
        if (this.stack.canUndo.value()) {
            this.apply_state(this.stack.undo())
        }
    }

    redo(): void | Promise<void> {
        if (this.stack.canRedo.value()) {
            this.apply_state(this.stack.redo())
        }
    }
}