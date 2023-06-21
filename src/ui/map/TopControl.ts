import Widget from "../widgets/Widget";

export default class TopControl<T extends Record<string, any> = {}> extends Widget<T> {
    constructor(container: JQuery | null = null) {
        super(container)

        this.addClass("nis-map-control-top").addClass("nis-map-control")
    }

    static wrap(jquery: JQuery): Widget {
        return new Widget(jquery.addClass("nis-map-control-top").addClass("nis-map-control"))
    }
}