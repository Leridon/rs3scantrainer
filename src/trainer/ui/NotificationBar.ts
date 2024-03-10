import Widget from "../../lib/ui/Widget";
import {C} from "../../lib/ui/constructors";
import spacer = C.spacer;

class Notification extends Widget {
    body: Widget = null
    content: Widget = null

    constructor(public options: {
        type?: "error" | "information",
        duration?: number | null,
        fixed?: boolean
    }) {
        super();

        this.addClass("ctr-notification")
            .addClass(`ctr-notification-${options.type ?? "information"}`)

        this.body = c().addClass("ctr-notification-content").appendTo(this)

        this.body.append(spacer()
            .css("max-width", "30px")
            .css("min-width", "30px")
        )

        if (!options.fixed) {
            this.body.append(c("<div class='ctr-notification-dismiss'>&times;</div>")
                .tooltip("Dismiss")
                .on("click", () => this.dismiss()))
        }

    }

    setContent(content: Widget): this {
        if (this.content) this.content.remove()

        this.content = content.css("flex-grow", "1").prependTo(this.body)

        return this
    }

    dismiss(fade: boolean = false) {
        if (fade) this.container.fadeOut(300, () => this.remove())
        else this.remove()
    }
}

export default class NotificationBar extends Widget {

    constructor() {
        super();

        this.addClass("ctr-notification-bar")
    }

    do(notification: Notification): this {
        notification
            .css("display", "none")
            .appendTo(this)
            .container.animate({
            "height": "toggle"
        }, 300)

        if (notification.options.duration !== null) {
            setTimeout(() => {
                notification.dismiss(true)
            }, notification.options.duration ?? 3000)
        }

        return this
    }

    notify(options: {
        type?: "error" | "information",
        duration?: number | null,
        fixed?: boolean
    }, content: (string | Widget | ((_: Notification) => (string | Widget)))) {

        let notification = new Notification(options)

        if (typeof content == "function") content = content(notification)
        if (typeof content == "string") content = c().text(content)

        notification.setContent(content)

        this.do(notification)

        return notification
    }
}