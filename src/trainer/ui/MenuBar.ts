import Widget from "../../lib/ui/Widget";
import {C} from "../../lib/ui/constructors";
import spacer = C.spacer;
import span = C.span;
import {Application} from "../application";
import {ShortcutEditor} from "./shortcut_editing/ShortcutEditor";
import {PathEditor} from "./pathedit/PathEditor";
import {GameLayer} from "../../lib/gamemap/GameLayer";
import TheoryCrafter from "./theorycrafting/TheoryCrafter";
import Button from "../../lib/ui/controls/Button";
import NeoSolvingBehaviour from "./neosolving/NeoSolvingBehaviour";
import MapUtilityBehaviour from "./MapUtilityBehaviour";

class MenuButton extends Button {

    constructor(name: string, icon: string) {
        super()

        this.addClass("ctr-menubar-button")

        this.append(
            c("<div style='height: 60%'></div>").append(c(`<img src="${icon}" style="width: 60%" alt="">`)),
            span(name)
        )
    }
}


export default class MenuBar extends Widget {

    constructor(public app: Application) {
        super();

        this.addClass("ctr-menubar")

        app.main_behaviour.behaviour.subscribe(behaviour => {
            this.empty()

            this.append(
                new MenuButton("Solve", "assets/icons/ribbon_clue.png")
                    .setEnabled(!(behaviour instanceof NeoSolvingBehaviour))
                    .onClick(() => {
                        app.main_behaviour.set(new NeoSolvingBehaviour(app))
                    }),
                new MenuButton("Create", "assets/icons/ribbon_notes.webp")
                    .setEnabled(!(behaviour instanceof TheoryCrafter))
                    .onClick(() => {
                        app.main_behaviour.set(new TheoryCrafter(app))
                    }),
                new MenuButton("Paths", "assets/icons/ribbon_activitytracker.webp")
                    .setEnabled(!(behaviour instanceof PathEditor))
                    .onClick(() => {
                        app.main_behaviour.set(new PathEditor(new GameLayer().addTo(app.map), app.template_resolver, {initial: []}))
                    }),
                /*new MenuButton("Edit", "assets/icons/ribbon_teleports.webp")
                    .setEnabled(!(behaviour instanceof ShortcutEditor))
                    .onClick(() => app.main_behaviour.set(new ShortcutEditor(app)))                ,*/
                new MenuButton("Utility", "assets/icons/ribbon_notes.webp")
                    .setEnabled(!(behaviour instanceof MapUtilityBehaviour))
                    .onClick(() => app.main_behaviour.set(new MapUtilityBehaviour(app)))
                ,
                spacer(),
                new MenuButton("Settings", "assets/icons/ribbon_options.webp").onClick(() => {}),
                c(`<div style="font-size: 6pt" class='nisl-textlink'>Version b0.3.1</div>`)
                    .tapRaw(r => r.on("click", () => app.about_modal.show()))
            )
        }, true)


        // Solving (Clue Icon)
        // Method Editor (including overview map)
        // Path Editor  (Path Icon)
        // Shortcut Editor (Shortcut Icon)

        // Settings
    }
}