import Widget from "../Widget";


export default class Collapsible extends Widget {
    heading: JQuery
    title: JQuery
    icon: JQuery
    content: Widget

    is_collapsed: boolean = false

    constructor(container: JQuery, title: string) {
        super(container)

        container.addClass("nis-collapsible")

        this.heading = $("<div class='nis-collapsible-heading'>")
            .on("click", () => {
                this.setCollapsed(!this.is_collapsed)
            })

            .appendTo(this.container)
        this.title = $("<div style='flex-grow: 1; text-align: center; border-right: 1px solid rgb(11, 34, 46)'>").text(title).appendTo(this.heading)
        this.icon = $("<div style='padding-left: 5px; padding-right: 5px; border-left: 1px solid rgb(53, 81, 94)'><img src='assets/nis/arrow_up.png'></div>").appendTo(this.heading)

        this.content = Widget.wrap($("<div class='nis-collapsible-content'></div>")).appendTo(this)

        this.append($("<div>"))
    }

    setCollapsed(collapsed: boolean) {

        if (collapsed != this.is_collapsed) {
            this.is_collapsed = collapsed

            this.content.container.animate({
                "height": "toggle"
            })

            this.icon.children("img").attr("src", this.is_collapsed ? 'assets/nis/arrow_down.png' : 'assets/nis/arrow_up.png')

            if (collapsed) this.heading.addClass("collapsed")
            else this.heading.removeClass("collapsed")
        }
    }
}