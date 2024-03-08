import {GameMapControl} from "lib/gamemap/GameMapControl";
import {PathEditor} from "./PathEditor";
import {Path} from "lib/runescape/pathing";
import movement_state = Path.movement_state;
import {direction, MovementAbilities, PlayerPosition} from "lib/runescape/movement";
import {DrawAbilityInteraction} from "./interactions/DrawAbilityInteraction";
import InteractionLayer, {InteractionGuard} from "lib/gamemap/interaction/InteractionLayer";
import DrawRunInteraction from "./interactions/DrawRunInteraction";
import ContextMenu, {Menu} from "../widgets/ContextMenu";
import PlacePowerburstInteraction from "./interactions/PlacePowerburstInteraction";
import {ActionBar} from "../map/ActionBar";
import ActionBarButton = ActionBar.ActionBarButton;
import {Observable, observe} from "lib/reactive";
import surge_cooldown = Path.movement_state.surge_cooldown;
import escape_cooldown = Path.movement_state.escape_cooldown;
import barge_cooldown = Path.movement_state.barge_cooldown;
import dive_cooldown = Path.movement_state.dive_cooldown;
import {GameMapKeyboardEvent} from "../../../lib/gamemap/MapEvents";
import PlaceRedClickInteraction from "./interactions/PlaceRedClickInteraction";
import ControlWithHeader from "../map/ControlWithHeader";

export default class PathEditActionBar extends GameMapControl<ControlWithHeader> {
    bar: ActionBar

    buttons: {
        surge: ActionBarButton,
        escape: ActionBarButton,
        dive: ActionBarButton,
        barge: ActionBarButton,
        run: ActionBarButton,
        compass: ActionBarButton,
        redclick: ActionBarButton,
        powerburst: ActionBarButton,
        cheat: ActionBarButton,
    }

    state: Observable<movement_state> = observe(movement_state.start({}))

    constructor(private editor: PathEditor,
                private interaction_guard: InteractionGuard
    ) {
        super({
            position: "bottom-center",
            type: "gapless"
        }, new ControlWithHeader("Path Editor"));

        type ability_data = {
            ability: MovementAbilities.movement_ability,
            predictor?: (_: PlayerPosition) => Promise<PlayerPosition> | PlayerPosition
        }

        // Render action bar
        {
            let self = this

            async function ability_handle(opt: ability_data): Promise<InteractionLayer> {
                if (opt.predictor && self.state.value().position?.tile != null && self.state.value().position?.direction != null) {
                    let res = await opt.predictor(self.state.value().position)

                    if (res) {

                        self.editor.value.add(({
                            type: "ability",
                            ability: opt.ability,
                            from: self.state.value().position?.tile,
                            to: res.tile
                        }))

                        return
                    }
                }

                return self.interaction_guard.set(
                    new DrawAbilityInteraction(opt.ability)
                        .onCommit((step) => self.editor.value.add(step))
                        .setStartPosition(self.state.value().position?.tile),
                    self)
            }

            this.buttons = {
                surge: new ActionBarButton('assets/icons/surge.png', () => ability_handle({ability: "surge", predictor: MovementAbilities.surge}))
                    .tooltip("Surge")
                    .setHotKey("s-W"),
                escape: new ActionBarButton('assets/icons/escape.png', () => ability_handle({ability: "escape", predictor: MovementAbilities.escape}))
                    .tooltip("Escape")
                    .setHotKey("s-S"),
                dive: new ActionBarButton('assets/icons/dive.png', () => ability_handle({ability: "dive"}))
                    .tooltip("Dive")
                    .setHotKey("D"),
                barge: new ActionBarButton('assets/icons/barge.png', () => ability_handle({ability: "barge"}))
                    .tooltip("Barge")
                    .setHotKey("s-D"),
                run: new ActionBarButton('assets/icons/run.png', () => {
                    return self.interaction_guard.set(
                        new DrawRunInteraction()
                            .onCommit(step => self.editor.value.add(step))
                            .setStartPosition(self.state.value().position?.tile),
                        self
                    )
                }).tooltip("Run")
                    .setHotKey("s-R"),
                redclick: new ActionBarButton('assets/icons/redclick.png', () => {
                    return self.interaction_guard.set(
                        new PlaceRedClickInteraction()
                            .onCommit((step) => self.editor.value.add(step))
                        , self)
                }).tooltip("Redclick")
                    .setHotKey("s-C")
                ,
                powerburst: new ActionBarButton('assets/icons/accel.png', () => {
                        if (self.state.value().position?.tile) {
                            this.editor.value.add(({
                                    type: "powerburst",
                                    where: self.state.value().position.tile
                                })
                            )
                        } else {
                            self.interaction_guard.set(
                                new PlacePowerburstInteraction()
                                    .onCommit((step) => self.editor.value.add(step))
                                , self)
                        }
                    }
                )
                    .tooltip("Powerburst of Acceleration")
                    .setHotKey("s-P"),
                compass: new ActionBarButton('assets/icons/compass.png', (e) => {
                    let menu: Menu = direction.all.map(d => {
                        return {
                            type: "basic",
                            text: direction.toString(d),
                            handler: () => {
                                self.editor.value.add(({
                                    type: "orientation",
                                    direction: d
                                }))
                            }
                        }
                    })

                    new ContextMenu(menu).showFromEvent(e)
                }).tooltip("Compass"),
                cheat: new ActionBarButton('assets/icons/Rotten_potato.png', (e) => {

                }).tooltip("Cheat")
            }

            this.bar = new ActionBar([
                this.buttons.surge,
                this.buttons.escape,
                this.buttons.dive,
                this.buttons.barge,
                this.buttons.run,
                this.buttons.redclick,
                this.buttons.powerburst,
                this.buttons.compass,
                this.buttons.cheat
            ]).appendTo(this.content.body)
        }

        this.state.subscribe((s) => this.render(s), true)
    }

    private render(state: movement_state) {
        this.buttons.surge.cooldown.set(surge_cooldown(state))
        this.buttons.escape.cooldown.set(escape_cooldown(state))
        this.buttons.barge.cooldown.set(barge_cooldown(state))
        this.buttons.dive.cooldown.set(dive_cooldown(state))
        this.buttons.compass.cooldown.set(state.position.tile ? -1 : 0)
        this.buttons.powerburst.cooldown.set(Math.max(state.acceleration_activation_tick + 120 - state.tick, 0))
    }

    eventKeyDown(event: GameMapKeyboardEvent) {
        event.onPre(() => {
            const e = event.original

            const handled = ((): boolean => {
                if (e.shiftKey && e.key.toLowerCase() == "w") {
                    this.editor.action_bar.buttons.surge.trigger()
                    return true
                } else if (e.shiftKey && e.key.toLowerCase() == "s") {
                    this.editor.action_bar.buttons.escape.trigger()
                    return true
                } else if (e.shiftKey && e.key.toLowerCase() == "d") {
                    this.editor.action_bar.buttons.barge.trigger()
                    return true
                } else if (e.key.toLowerCase() == "d") {
                    this.editor.action_bar.buttons.dive.trigger()
                    return true
                } else if (e.shiftKey && e.key.toLowerCase() == "r") {
                    this.editor.action_bar.buttons.run.trigger()
                    return true
                } else if (e.shiftKey && e.key.toLowerCase() == "c") {
                    this.editor.action_bar.buttons.redclick.trigger()
                    return true
                } else if (e.shiftKey && e.key.toLowerCase() == "p") {
                    this.editor.action_bar.buttons.powerburst.trigger()
                    return true
                }
            })()

            if (handled) {
                event.stopAllPropagation()
                e.preventDefault()
            }
        })
    }
}