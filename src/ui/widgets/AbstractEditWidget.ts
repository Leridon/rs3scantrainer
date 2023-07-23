import Widget from "./Widget";


/**
 * This class encapsulates common functionality for widgets that are an editor for a value.
 */
export default abstract class AbstractEditWidget<T> extends Widget<{
    "changed": T
}> {

    protected value: T = null

    protected constructor() {
        super();
    }

    protected changed(v: T) {
        this.value = v
        this.emit("changed", v)
    }

    public setValue(v: T): this {
        this.value = v
        this.update()

        return this
    }

    protected update(): void{

    }
}