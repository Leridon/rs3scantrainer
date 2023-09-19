import {MapCoordinate, MapRectangle} from "../coordinates";
import {indirected, method_base, resolved} from "../methods";
import {area_pulse, Pulse} from "./scans";
import {Modal} from "../../ui/widgets/modal";
import {ScanStep} from "../clues";
import {util} from "../../util/util";
import {Path} from "../pathing";
import * as lodash from "lodash";
import {TextRendering} from "../../ui/TextRendering";
import {Vector2} from "../../util/math";
import * as path from "path";

export namespace ScanTree {

    import movement_state = Path.movement_state;

    export function dig_area(spot: MapCoordinate): MapRectangle {
        return {
            topleft: {x: spot.x - 1, y: spot.y + 1},
            botright: {x: spot.x + 1, y: spot.y - 1},
            level: spot.level
        }
    }

    import shorten_integer_list = util.shorten_integer_list;
    import render_digspot = TextRendering.render_digspot;
    import registerStatusDaemon = alt1.registerStatusDaemon;

    // There is world in which this type isn't needed and scan trees are just a tree of paths.
    // There are some drawbacks in this idea, so for now it stays how it is.
    //  - pro: Would make sections that are like "check the remaining spots" simpler
    //  - pro: Cleaner implementation as a whole
    //  - con: People are used to the format
    //  - con: Would maybe exclude the ability to mark area with leeway
    //  - con: Having dedicated areas incentivizes to make keep the tree simple instead of having a million decision points
    //  - con: How would that work with non-deterministic paths/teleports?

    export type ScanRegion = {
        id: number,
        name: string
        area: MapRectangle
    }

    export type tree = method_base & {
        type: "scantree",
        spot_ordering: MapCoordinate[],
        assumes_meerkats: boolean,
        areas: ScanRegion[],
        root: decision_tree
    }

    export type resolved_scan_tree = tree & resolved<ScanStep>
    export type indirect_scan_tree = tree & indirected

    /**
     * @deprecated mark as deprecated to flag accidental use of draft type
     */
    type DRAFT_new_decision_tree = {
        area?: ScanRegion,
        path: Path.step[]
        children: {
            key: {
                pulse: Pulse,
                spot?: MapCoordinate
            },
            value: decision_tree
        }[]
    }

    /**
     * TODO: Plan: How to potentially transition to the above draft while always having a better state than before
     *  1. (Done) Make scan spots be identified by id
     *  2. (Done) Allow scan spots to be anonymous (empty name)
     *  3. Outsource spot children into leaf nodes, make path be an immediate member
     *  4. Allow nodes to not have a scan spot at all
     */

    export type PulseInformation = Pulse & ({
        pulse: 3
        spot?: MapCoordinate
    } | { pulse: 1 | 2 })

    namespace PulseInformation {
        export function equals(a: PulseInformation, b: PulseInformation): boolean {
            return Pulse.equals(a, b) && !(a.pulse == 3 && (b.pulse == 3) && !MapCoordinate.eq2(a?.spot, b.spot))
        }
    }

    export type scan_tree_old = method_base & {
        type: "scantree",
        spot_ordering: MapCoordinate[],
        assumes_meerkats: boolean,
        areas: ScanRegion[],
        root: decision_tree_old
    }

    export type decision_tree_old = {
        paths: {
            spot?: MapCoordinate,
            directions: string,
            path: {
                steps: Path.raw,
                target: MapRectangle,
                start_state: Path.movement_state
            }
        }[],
        scan_spot_id: number | null,
        children: {
            key: Pulse | null,
            value: decision_tree_old
        }[]
    }

    export type decision_tree = {
        path: Path.step[]
        scan_spot_id: number | null,
        directions: string,
        children: {
            key: PulseInformation,
            value: decision_tree
        }[]
    }

    export type augmented_decision_tree = {
        raw: decision_tree,
        raw_root: tree,
        root: augmented_decision_tree,
        parent: {
            key: PulseInformation
            node: augmented_decision_tree,
        },
        region?: ScanRegion,
        path: Path.augmented,
        depth: number,
        remaining_candidates: MapCoordinate[],
        //is_leaf?: boolean,
        information: ScanInformation[],
        children: {
            key: Pulse,
            value: augmented_decision_tree
        }[]
    }

    export function traverse(tree: decision_tree, f: (_: decision_tree) => void): void {
        if (tree) f(tree)

        tree.children.forEach(c => traverse(c.value, f))
    }

    export namespace augmented_decision_tree {
        export function traverse(node: augmented_decision_tree, f: (_: augmented_decision_tree) => void) {
            f(node)

            node.children.forEach(c => traverse(c.value, f))
        }

        export function traverse_parents(node: augmented_decision_tree, f: (_: augmented_decision_tree) => void): void {
            if (node.parent == null) return

            f(node.parent.node)
            traverse_parents(node.parent.node, f)
        }
    }

    export function init_leaf(): decision_tree {
        return {
            scan_spot_id: null,
            children: [],
            directions: "Missing directions",
            path: [],
        }
    }

    function get_target_region(tree: ScanTree.tree, node: ScanTree.decision_tree): ScanRegion {
        if (node.scan_spot_id == null) return null

        return ScanTree.getRegionById(tree, node.scan_spot_id)
    }

    export async function normalize(tree: ScanTree.resolved_scan_tree): Promise<ScanTree.resolved_scan_tree> {
        async function helper(node: decision_tree, candidates: MapCoordinate[], pre_state: Path.movement_state): Promise<void> {
            let region = get_target_region(tree, node)
            let augmented_path = await Path.augment(node.path, pre_state, region?.area)

            let area = region?.area ||
                MapRectangle.fromTile(augmented_path.post_state?.position?.tile)

            if (!region) node.scan_spot_id = null

            // Update children to remove all dead branches and add missing branches
            let pruned_children: {
                child: {
                    key: PulseInformation,
                    value: decision_tree
                },
                candidates: MapCoordinate[]
            }[] = (!area) ? []
                : spot_narrowing(candidates, area, assumedRange(tree))
                    .filter(n => n.narrowed_candidates.length > 0)
                    .map(({pulse, narrowed_candidates}) => {
                        return {
                            child: node.children.find(c => PulseInformation.equals(pulse, c.key)) || {
                                key: pulse,
                                value: init_leaf()
                            },
                            candidates: narrowed_candidates
                        }
                    })

            // When there is only one child, the current position produces no information at all
            // So there is no point in adding children, which is why they are removed by this statement
            if (pruned_children.length == 1) pruned_children = []

            node.children = pruned_children.map(c => c.child)

            pruned_children.forEach(({child, candidates}) => {
                // Propagate state recursively
                let cloned_state = augmented_path.post_state
                cloned_state.tick += 1 // Assume 1 tick reaction time between steps. Approximation, but may help to make timings and cooldowns more realistic

                helper(child.value, candidates, cloned_state)
            })
        }

        if (!tree.root) tree.root = init_leaf()

        await helper(tree.root, tree.clue.solution.candidates, Path.movement_state.start())

        return tree
    }

    export function assumedRange(tree: resolved_scan_tree): number {
        let r = tree.clue.range
        if (tree.assumes_meerkats) r += 5;
        return r
    }

    export function spotNumber(self: ScanTree.tree, spot: MapCoordinate): number {
        return self.spot_ordering.findIndex((s) => Vector2.eq(s, spot)) + 1
    }

    export async function augment(tree: resolved_scan_tree): Promise<augmented_decision_tree> {
        async function helper(
            node: decision_tree,
            parent: { node: augmented_decision_tree, key: PulseInformation },
            depth: number,
            remaining_candidates: MapCoordinate[],
            information: ScanInformation[],
            start_state: Path.movement_state
        ): Promise<augmented_decision_tree> {

            let region = get_target_region(tree, node)

            let t: augmented_decision_tree = {
                //directions: null,
                raw_root: tree,
                root: null,
                parent: parent,
                region: null,
                path: await Path.augment(node.path, start_state, region?.area),
                raw: node,
                depth: depth,
                remaining_candidates: remaining_candidates,
                information: information,
                children: []
            }

            let cloned_state = t.path.post_state
            cloned_state.tick += 1 // Assume 1 tick reaction time between steps. Approximation, but may help to make timings and cooldowns more realistic

            t.root = parent == null ? t : parent.node.root
            t.region = get_target_region(tree, node) || {
                area: MapRectangle.fromTile(t.path.post_state.position.tile),
                name: "",
                id: null
            }

            if (node.children.length > 0) {
                let narrowing = spot_narrowing(remaining_candidates, t.region.area, assumedRange(tree))

                // The node is not a leaf node, handle all relevant children
                t.children = await Promise.all(node.children.map(async child => {
                    return {
                        key: child.key,
                        value: await helper(
                            child ? child.value : null,
                            {node: t, key: child.key},
                            depth + 1,
                            narrowing.find(n => PulseInformation.equals(n.pulse, child.key)).narrowed_candidates,
                            information.concat([{
                                area: t.region.area,
                                pulse: child.key.pulse,
                                different_level: child.key.different_level
                            }]),
                            cloned_state
                        )

                    }
                }))
            }

            return t
        }

        tree = await normalize(tree)    // TODO: This is probably something that can (and should) be combined

        return helper(tree.root, null, 0, tree.clue.solution.candidates, [], movement_state.start());
    }

    export function getRegionById(tree: ScanTree.tree, id: number): ScanRegion {
        return tree.areas.find(a => a.id == id)
    }

    export function createNewSpot(tree: ScanTree.tree, area: MapRectangle): ScanRegion {
        for (let i: number = 0; i < 1000; i++) {
            if (!tree.areas.some(a => a.id == i)) {
                let a = {
                    id: i,
                    name: "",
                    area: area
                }

                tree.areas.push(a)

                return a
            }
        }
    }

    export class ScanExplanationModal extends Modal {
        protected hidden() {
            ($("#pingexplanationvideo").get(0) as HTMLVideoElement).pause();
        }
    }

    export type ScanInformation = PulseInformation & {
        area: MapRectangle
    }

    export namespace ScanInformation {
        export function toString(decision: ScanInformation) {
            return "TODO" // TODO:
            //return `${decision.area.name}${Pulse.meta(decision.ping).shorted}`
        }
    }

    export function spot_narrowing(candidates: MapCoordinate[], area: MapRectangle, range: number): {
        pulse: PulseInformation,
        narrowed_candidates: MapCoordinate[]
    }[] {
        return Pulse.all.flatMap((p) => {
            let remaining = narrow_down(candidates, {area: area, pulse: p.pulse, different_level: p.different_level}, range)

            if (p.pulse == 3) {
                return remaining.map(r => {
                    return {
                        pulse: {
                            pulse: 3,
                            different_level: p.different_level,
                            spot: r
                        },
                        narrowed_candidates: [r]
                    }
                })
            } else {
                return [{
                    pulse: p,
                    narrowed_candidates: remaining
                }]
            }
        })
    }

    export function narrow_down(candidates: MapCoordinate[], information: ScanInformation, range: number): MapCoordinate[] {
        return candidates.filter((s) => area_pulse(s, information.area, range).some((p2) => Pulse.equals(information, p2)))
    }

    export function template_resolvers(node: ScanTree.augmented_decision_tree): Record<string, (args: string[]) => string> {
        return {
            "target": () => {
                if (node.remaining_candidates.length == 1) {
                    // TODO: There's a bug hidden here where is always resolves the same digspot number for all triples
                    return render_digspot(spotNumber(node.raw_root, node.remaining_candidates[0]))
                } else if (node.region) {
                    return `{{scanarea ${node.region.name}}}`
                } else {
                    return "{ERROR: No target}"
                }
            },
            "candidates":
                () => {
                    return util.natural_join(
                        shorten_integer_list(node.remaining_candidates
                                .map(c => spotNumber(node.raw_root, c)),
                            render_digspot
                        ))
                }
        }
    }
}