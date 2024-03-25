import Widget from "../../lib/ui/Widget";
import {C} from "../../lib/ui/constructors";
import {Application} from "../application";
import {PathEditor} from "./pathedit/PathEditor";
import {GameLayer} from "../../lib/gamemap/GameLayer";
import TheoryCrafter from "./theorycrafting/TheoryCrafter";
import Button from "../../lib/ui/controls/Button";
import NeoSolvingBehaviour from "./neosolving/NeoSolvingBehaviour";
import MapUtilityBehaviour from "./MapUtilityBehaviour";
import spacer = C.spacer;
import span = C.span;

class MenuButton extends Button {

  constructor(name: string, icon: string) {
    super()

    this.addClass("ctr-menubar-button")

    this.append(
      c("<div style='height: 60%'></div>").append(c(`<img src="${icon}" style="width: 60%" alt="">`)),
      span(name)
    )
  }

  setActive(v: boolean) {
    this.toggleClass("active", v)
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
            app.main_behaviour.set(new PathEditor(new GameLayer().addTo(app.map), app.template_resolver, {initial: []}, true))
          }),

        this.app.in_dev_mode ?
          new MenuButton("Utility", "assets/icons/ribbon_notes.webp")
            .setEnabled(!(behaviour instanceof MapUtilityBehaviour))
            .onClick(() => app.main_behaviour.set(new MapUtilityBehaviour(app)))
          : undefined
        ,
        spacer(),
        new MenuButton("Settings", "assets/icons/ribbon_options.webp").onClick(() => {

          const o = window.open("", "_blank", "popup=yes,width=200px,height=200px")

          o.document.body.append(c().text("Hello World")
            .on("click", () => {
              console.log("Clicked")
            })
            .raw())
        }),
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

export namespace MenuBar {
  export type Tab = "map" | "solve" | "create" | "pathedit" | "utility"
}