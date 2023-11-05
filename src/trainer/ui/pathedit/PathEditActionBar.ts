import {GameMapControl} from "../../../lib/gamemap/GameMapControl";
import {PathEditor} from "./PathEditor";
import Button from "../../../lib/ui/controls/Button";
import Widget from "../../../lib/ui/Widget";
import {Path} from "../../../lib/runescape/pathing";
import movement_state = Path.movement_state;
import {TypedEmitter} from "../../../skillbertssolver/eventemitter";
import {direction, MovementAbilities, PlayerPosition} from "../../../lib/runescape/movement";
import {Observable, observe} from "../../../lib/properties/Observable";
import {DrawAbilityInteraction} from "./interactions/DrawAbilityInteraction";
import {InteractionGuard} from "../../../lib/gamemap/interaction/InteractionLayer";
import DrawRunInteraction from "./interactions/DrawRunInteraction";
import ContextMenu, {Menu} from "../widgets/ContextMenu";
import SelectTileInteraction from "../../../lib/gamemap/interaction/SelectTileInteraction";
import PlacePowerburstInteraction from "./interactions/PlacePowerburstInteraction";

class ActionBarButton extends Button {
    constructor(icon: string,
                cooldown: number = 0) {
        super();

        this.addClass("medium-image-button")
            .append($(`<img src='${icon}'>`))

        if (cooldown != 0) {
            this.css("position", "relative").append(c("<div class='ctr-cooldown-overlay-shadow'></div>").text(cooldown > 0 ? cooldown + "t" : ""))
        }
    }
}

export default class PathEditActionBar extends GameMapControl {
    bar: Widget

    events = new TypedEmitter<{
        step_added: Path.step
    }>()

    state: Observable<movement_state> = observe(movement_state.start())

    constructor(private editor: PathEditor,
                private interaction_guard: InteractionGuard = null
    ) {
        super({
            position: "bottom-center",
            type: "gapless"
        });

        if (!this.interaction_guard) this.interaction_guard = new InteractionGuard()

        this.state.subscribe((s) => this.render(s), true)
    }

    private render(state: movement_state) {
        this.content.empty()

        this.bar = c("<div style='display: flex'></div>").appendTo(this.content);

        type ability_data = {
            ability: MovementAbilities.movement_ability,
            predictor?: (_: PlayerPosition) => Promise<PlayerPosition> | PlayerPosition
        }

        let self = this

        async function ability_handle(opt: ability_data) {
            if (opt.predictor && state.position?.tile != null && state.position?.direction != null) {
                let res = await opt.predictor(state.position)

                if (res) {
                    self.events.emit("step_added", Path.auto_describe({
                        type: "ability",
                        ability: opt.ability,
                        description: "",
                        from: state.position?.tile,
                        to: res.tile
                    }))

                    return
                }
            }

            let interaction = new DrawAbilityInteraction(opt.ability, false, {
                done_handler: (step) => self.events.emit("step_added", step)
            }).setStartPosition(state.position?.tile)

            self.interaction_guard.set(interaction, self)
        }

        [
            new ActionBarButton('assets/icons/surge.png', movement_state.surge_cooldown(state)).tooltip("Surge")
                .on("click", async () => await ability_handle({ability: "surge", predictor: MovementAbilities.surge})),
            new ActionBarButton('assets/icons/escape.png', movement_state.escape_cooldown(state)).tooltip("Escape")
                .on("click", async () => await ability_handle({ability: "escape", predictor: MovementAbilities.escape})),
            new ActionBarButton('assets/icons/dive.png', movement_state.dive_cooldown(state)).tooltip("Dive")
                .on("click", async () => await ability_handle({ability: "dive"})),
            new ActionBarButton('assets/icons/barge.png', movement_state.barge_cooldown(state)).tooltip("Barge")
                .on("click", async () => await ability_handle({ability: "barge"})),
            new ActionBarButton('assets/icons/run.png').tooltip("Run")
                .on("click", async () => {

                    self.interaction_guard.set(
                        new DrawRunInteraction({done_handler: (step) => self.events.emit("step_added", step)})
                            .setStartPosition(state.position?.tile),
                        self
                    )
                }),
            new ActionBarButton('assets/icons/teleports/homeport.png').tooltip("Teleport"),
            new ActionBarButton('assets/icons/redclick.png').tooltip("Redclick"),
            new ActionBarButton('assets/icons/accel.png',
                Math.max(state.acceleration_activation_tick + 120 - state.tick, 0))
                .tooltip("Powerburst of Acceleration")
                .on("click", () => {
                    if (state.position?.tile) {
                        this.editor.value.addBack(Path.auto_describe({
                            type: "powerburst",
                            description: "",
                            where: state.position.tile
                        }))
                    } else {
                        self.interaction_guard.set(
                            new PlacePowerburstInteraction({
                                done_handler: (step) => self.events.emit("step_added", step)
                            }), self)
                    }
                }),
            new ActionBarButton('assets/icons/shortcut.png').tooltip("Shortcut"),
            new ActionBarButton('assets/icons/compass.png', state.position.tile ? -1 : 0).tooltip("Compass")
                .on("click", (e) => {
                    let menu: Menu = direction.all.map(d => {
                        return {
                            type: "basic",
                            text: direction.toString(d),
                            handler: () => {
                                self.events.emit("step_added", Path.auto_describe({
                                    type: "orientation",
                                    description: "",
                                    direction: d
                                }))
                            }
                        }
                    })

                    new ContextMenu(menu).showFromEvent(e)
                })
            ,
            //new ActionBarButton('assets/icons/regenerate.png'),
        ].forEach(b => this.bar.append(b))
    }
}

namespace PathEditorActionBar {

}