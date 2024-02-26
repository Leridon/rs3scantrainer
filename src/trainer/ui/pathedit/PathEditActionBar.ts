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
import Collapsible from "../widgets/Collapsible";
import Properties from "../widgets/Properties";
import LightButton from "../widgets/LightButton";
import ExportStringModal from "../widgets/modals/ExportStringModal";
import ImportStringModal from "../widgets/modals/ImportStringModal";
import {QueryLinks} from "../../query_functions";
import {ScanTrainerCommands} from "../../application";
import {C} from "../../../lib/ui/constructors";
import hbox = C.hbox;
import {GameMapKeyboardEvent} from "../../../lib/gamemap/MapEvents";
import spacer = C.spacer;
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
        }, new ControlWithHeader("Path Editor", () => this.editor.close()));

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

                        self.editor.value.create(({
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
                        .onCommit((step) => self.editor.value.create(step))
                        .setStartPosition(self.state.value().position?.tile),
                    self)
            }

            this.buttons = {
                surge: new ActionBarButton('assets/icons/surge.png', () => ability_handle({ability: "surge", predictor: MovementAbilities.surge})).tooltip("Surge"),
                escape: new ActionBarButton('assets/icons/escape.png', () => ability_handle({ability: "escape", predictor: MovementAbilities.escape})).tooltip("Escape"),
                dive: new ActionBarButton('assets/icons/dive.png', () => ability_handle({ability: "dive"})).tooltip("Dive"),
                barge: new ActionBarButton('assets/icons/barge.png', async () => await ability_handle({ability: "barge"})).tooltip("Barge"),
                run: new ActionBarButton('assets/icons/run.png', () => {
                    return self.interaction_guard.set(
                        new DrawRunInteraction()
                            .onCommit(step => self.editor.value.create(step))
                            .setStartPosition(self.state.value().position?.tile),
                        self
                    )
                }).tooltip("Run"),
                redclick: new ActionBarButton('assets/icons/redclick.png', () => {
                    return self.interaction_guard.set(
                        new PlaceRedClickInteraction()
                            .onCommit((step) => self.editor.value.create(step))
                        , self)
                }).tooltip("Redclick"),
                powerburst: new ActionBarButton('assets/icons/accel.png', () => {
                        if (self.state.value().position?.tile) {
                            this.editor.value.create(({
                                    type: "powerburst",
                                    where: self.state.value().position.tile
                                })
                            )
                        } else {
                            self.interaction_guard.set(
                                new PlacePowerburstInteraction()
                                    .onCommit((step) => self.editor.value.create(step))
                                , self)
                        }
                    }
                )
                    .tooltip("Powerburst of Acceleration"),
                compass: new ActionBarButton('assets/icons/compass.png', (e) => {
                    let menu: Menu = direction.all.map(d => {
                        return {
                            type: "basic",
                            text: direction.toString(d),
                            handler: () => {
                                self.editor.value.create(({
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
                //this.buttons.cheat
            ]).appendTo(this.content.body)
        }

        // Render buttons
        {
            hbox(
                new LightButton("Commit", "rectangle").onClick(() => {
                    this.editor.options.commit_handler(this.editor.value.construct())
                }).setEnabled(!!this.editor.options.commit_handler),

                new LightButton("Discard", "rectangle").onClick(() => {
                    this.editor.value.load(this.editor.options.initial)
                    this.editor.options?.discard_handler()
                }),

                new LightButton("Export", "rectangle")
                    .onClick(() => ExportStringModal.do(Path.export_path(this.editor.value.construct()))),

                new LightButton("Import", "rectangle")
                    .onClick(async () => {
                        await ImportStringModal.do((s) => Path.import_path(s), (value) => {
                            this.editor.value.load(value)
                        })
                    }),

                new LightButton("Share", "rectangle")
                    .onClick(() => {
                        ExportStringModal.do(QueryLinks.link(ScanTrainerCommands.load_path, {
                            steps: this.editor.value.construct(),
                            start_state: this.editor.options.start_state,
                            target: this.editor.options.target,
                        }), "Use this link to directly link to this path.")
                    })
            ).addClass("ctr-button-container")
                .appendTo(this.content.body)
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
        event.onPost(() => {
            if (event.original.key == "Escape") {
                event.stopAllPropagation()
                this.editor.stop()
            }

            if (event.original.key.toLowerCase() == "s" && event.original.shiftKey) {
                event.original.preventDefault()
                this.editor.commit()
            }
        })
    }
}