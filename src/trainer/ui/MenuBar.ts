import Widget from "../../lib/ui/Widget";
import {C} from "../../lib/ui/constructors";
import spacer = C.spacer;
import span = C.span;
import {Application} from "../application";
import {ShortcutEditor} from "./shortcut_editing/ShortcutEditor";
import {PathEditor} from "./pathedit/PathEditor";
import GameLayer from "../../lib/gamemap/GameLayer";
import shortcuts from "../../data/shortcuts";
import TheoryCrafter from "./theorycrafting/TheoryCrafter";

class MenuButton extends Widget {

    constructor(name: string, icon: string, handler: () => any) {
        super()

        this.addClass("ctr-menubar-button")

        this.append(
            c("<div style='height: 60%'></div>").append(c(`<img src="${icon}" style="width: 60%" alt="">`)),
            span(name)
        )

        this.container.on("click", handler)
    }
}


export default class MenuBar extends Widget {

    constructor(public app: Application) {
        super();

        this.addClass("ctr-menubar")

        this.append(
            new MenuButton("Solving", "assets/icons/ribbon_clue.png", () => {}),
            new MenuButton("Theory", "assets/icons/ribbon_notes.webp", () => {
                app.main_behaviour.set(new TheoryCrafter(app))

            }),
            new MenuButton("Paths", "assets/icons/ribbon_activitytracker.webp", () => {
                app.main_behaviour.set(new PathEditor(new GameLayer().addTo(app.map), app.template_resolver, {
                    teleports: this.app.data.teleports.getAll(),
                    shortcuts: shortcuts
                }, {initial: []}))

            }),
            new MenuButton("Map", "assets/icons/ribbon_teleports.webp", () => app.main_behaviour.set(null)),
            new MenuButton("Edit", "assets/icons/ribbon_teleports.webp", () => app.main_behaviour.set(new ShortcutEditor(app))),
            spacer(),
            new MenuButton("Settings", "assets/icons/ribbon_options.webp", () => {}),
            c(`<div style="font-size: 6pt" class='nisl-textlink'>Version b0.3.1</div>`)
                .tapRaw(r => r.on("click", () => app.about_modal.show()))
        )


        // Solving (Clue Icon)
        // Method Editor (including overview map)
        // Path Editor  (Path Icon)
        // Shortcut Editor (Shortcut Icon)

        // Settings
    }
}