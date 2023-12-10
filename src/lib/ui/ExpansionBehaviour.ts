import Widget from "./Widget";
import {ewent, Observable, observe} from "../reactive";
import {identity} from "lodash";

export class ExpansionBehaviour {
    private collapsed: Observable<boolean>

    private collapsed_event = ewent()
    private expanded_event = ewent()

    constructor(starts_collapsed: boolean) {
        this.collapsed = observe(starts_collapsed)
    }

    isCollapsed(): boolean {
        return this.collapsed.value()
    }

    isExpanded(): boolean {
        return !this.collapsed.value()
    }

    bindToClickable(widget: Widget) {
        widget.on("click", () => this.toggle())

        return this
    }

    toggle(): this {
        if (this.collapsed.value()) this.expand()
        else this.collapse()

        return this
    }

    expand(): this {
        if (!this.collapsed.value()) return this

        this.expanded_event.trigger(undefined)

        this.collapsed.set(false)

        return this
    }

    collapse(): this {
        if (this.collapsed.value()) return this

        this.collapsed_event.trigger(undefined)

        this.collapsed.set(true)

        return this
    }

    onCollapse(f: () => any): this {
        this.collapsed_event.on(f)

        return this
    }

    onExpansion(f: () => any): this {
        this.expanded_event.on(f)

        return this
    }

    state(): Observable<boolean> {
        return this.collapsed
    }

    onChange(f: (_: boolean) => any, trigger_now: boolean = false): this {
        this.state().subscribe(f, trigger_now)
        return this
    }
}

export namespace ExpansionBehaviour {

    export function create(options: {
        target?: Widget,
        starts_collapsed?: boolean,
        onCollapse: () => any,
        onExpand: () => any,
    }): ExpansionBehaviour {
        let behaviour = new ExpansionBehaviour(!!options.starts_collapsed)
            .onCollapse(options.onCollapse)
            .onExpansion(options.onExpand)

        if (options.target) behaviour.bindToClickable(options.target)

        return behaviour
    }
}