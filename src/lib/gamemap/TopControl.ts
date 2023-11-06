import Widget from "../ui/Widget";

export default class TopControl<T extends Record<string, any> = {}> extends Widget<T> {
    constructor(container: JQuery | null = null) {
        super(container)

        this.addClass("nis-map-control-top").addClass("nis-map-control")
    }

    static wrap(jquery: JQuery): TopControl {
        return new TopControl(jquery)
    }
}