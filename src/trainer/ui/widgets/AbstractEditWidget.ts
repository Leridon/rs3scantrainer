import Widget from "../../../lib/ui/Widget";


/**
 * This class encapsulates common functionality for widgets that are an editor for a value.
 */
export default abstract class AbstractEditWidget<T, AdditionalEvents extends Record<string, any> = {}> extends Widget<AdditionalEvents & {
    "changed": T
}> {

    protected value: T = null

    protected constructor(container: JQuery = null) {
        super(container);
    }

    protected changed(v: T) {
        this.value = v
        this.emit("changed", v as AdditionalEvents["changed"] & T)
    }

    public setValue(v: T): this {
        this.value = v
        this.update()

        return this
    }

    protected update(): void {

    }
}