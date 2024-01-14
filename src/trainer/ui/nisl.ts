import Widget from "../../lib/ui/Widget";
import {observe} from "../../lib/reactive";

export class NislIcon extends Widget {
    private img: Widget
    protected url = observe("")

    protected constructor() {
        super();

        this.addClass("nisl-icon")

        this.img = c("<img>").appendTo(this)

        this.url.subscribe(url => {
            this.img.setAttribute("src", url)
        })
    }

    setSource(src: string): this {
        this.url.set(src)
        return this
    }

    static dropdown(): NislIcon {
        return new NislIcon().setSource("assets/nis/dropdown.png")
    }
}

export class FavouriteIcon extends NislIcon {
    toggled = observe(false)

    constructor() {
        super();

        this.toggled.subscribe(v => {
            this.setSource(v ? "assets/nis/favourite_on.png" : "assets/nis/favourite_off.png")
        }, true)
    }

    set(value: boolean): this {
        this.toggled.set(value)
        return this
    }
}