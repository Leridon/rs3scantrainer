import Widget from "lib/ui/Widget";


export default class Collapsible extends Widget {
    heading: Widget
    title: Widget
    icon: Widget
    content_container: Widget

    is_collapsed: boolean = false

    constructor(title: string = "", content?: Widget) {
        super()

        this.addClass("nis-collapsible")

        this.heading = c("<div class='nis-collapsible-heading'>")
            .tapRaw(r => r.on("click", () => {
                this.setCollapsed(!this.is_collapsed)
            }))
            .appendTo(this)

        this.title = c("<div style='flex-grow: 1; text-align: center; border-right: 1px solid rgb(11, 34, 46)'>").text(title).appendTo(this.heading)
        this.icon = c("<div style='padding-left: 5px; padding-right: 5px; border-left: 1px solid rgb(53, 81, 94)'><img src='assets/nis/arrow_up.png'></div>").appendTo(this.heading)

        this.content_container = c("<div class='nis-collapsible-content'></div>").appendTo(this)

        if(content) this.setContent(content)
        //this.append($("<div>")) //??
    }

    setTitle(title: string): this {
        this.title.text(title)

        return this
    }

    setContent(content: Widget): this {
        this.content_container.empty().append(content)

        return this
    }

    setCollapsed(collapsed: boolean) {

        if (collapsed != this.is_collapsed) {
            this.is_collapsed = collapsed

            this.content_container.container.animate({
                "height": "toggle"
            })

            this.icon.container.children("img").attr("src", this.is_collapsed ? 'assets/nis/arrow_down.png' : 'assets/nis/arrow_up.png')

            this.heading.toggleClass("collapsed", collapsed)
        }
    }
}