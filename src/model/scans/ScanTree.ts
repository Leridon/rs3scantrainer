import {Box, MapCoordinate, Vector2} from "../coordinates";
import {indirected, method_base, resolved} from "../methods";
import {area_pulse, Pulse} from "./scans";
import {Modal} from "../../ui/widgets/modal";
import {ScanStep} from "../clues";
import {util} from "../../util/util";
import {Path} from "../pathing";
import * as lodash from "lodash";

export namespace ScanTree {

    import movement_state = Path.movement_state;

    export function dig_area(spot: MapCoordinate): Box {
        return {
            topleft: {x: spot.x - 1, y: spot.y + 1},
            botright: {x: spot.x + 1, y: spot.y - 1},
        }
    }

    import natural_order = util.natural_order;

    export type ScanSpot = {
        name: string,
        area?: Box,
        level: number,
    }

    export type tree = method_base & {
        type: "scantree",
        spot_ordering: MapCoordinate[],
        assumes_meerkats: boolean,
        areas: ScanSpot[],
        root: decision_tree
    }

    export type resolved_scan_tree = tree & resolved<ScanStep>
    export type indirect_scan_tree = tree & indirected

    export type decision_tree = {
        paths: {
            spot?: MapCoordinate,
            short_instruction: string,
            path: Path.raw
        }[],
        where_to: string,
        why?: string,
        children: {
            key: Pulse | null,
            value: decision_tree
        }[]
    }

    export type augmented_decision_tree = {
        raw: decision_tree,
        root: tree,
        parent: { node: augmented_decision_tree, kind: Pulse },
        is_leaf?: boolean,
        scan_spot?: ScanSpot,
        leaf_spot?: MapCoordinate,
        path: Path.raw,
        directions: string,
        depth: number,
        remaining_candidates: MapCoordinate[],
        decisions: ScanDecision[],
        children: {
            key: Pulse,
            value: augmented_decision_tree
        }[]
    }

    export function init_leaf(candidates: MapCoordinate[]): decision_tree {
        return {
            where_to: null,
            children: [],
            paths: candidates.map(c => {
                return {
                    spot: c,
                    short_instruction: "Dig at {{target}}",
                    path: {
                        steps: [],
                        start_state: Path.movement_state.start(), // The real start state is propagated from the parent and done elsewhere
                        target: dig_area(c)
                    }
                }
            })
        }
    }

    export async function prune_clean_and_propagate(tree: ScanTree.resolved_scan_tree): Promise<ScanTree.tree> {
        async function helper(node: decision_tree, candidates: MapCoordinate[], pre_state: Path.movement_state): Promise<void> {
            if (node == null || candidates.length == 0) return null

            // Prune dead and create missing branches
            if (node.where_to) {
                let area = tree.areas.find((a) => a.name == node.where_to)

                // Update children to remove all dead branches and add missing branches
                node.children =
                    spot_narrowing(candidates, area, assumedRange(tree))
                        .filter(n => n.narrowed_candidates.length > 0)
                        .map(n => {
                            return node.children.find(c => Pulse.equals(n.pulse, c.key))
                                || {
                                    key: n.pulse,
                                    value: init_leaf(n.narrowed_candidates)
                                }
                        })

                // Branches with a set area only contain one path: The one to the area.
                node.paths = [node.paths.find(p => p.spot == null) || {
                    path: {start_state: movement_state.start(), steps: []},
                    spot: null,
                    short_instruction: "Move to {{target}}"
                }]
            } else {
                node.children = []  // Nodes without a "where_to" can never have children nodes, only paths

                // Create a new leaf as a template to get missing paths from
                let raw_leaf = init_leaf(candidates)

                node.paths = candidates.map(c =>
                    node.paths.find(p => MapCoordinate.eq2(p.spot, c)) ||
                    raw_leaf.paths.find(p => MapCoordinate.eq2(p.spot, c))
                )
            }

            // Propagate movement state to paths/children
            {
                let pre = lodash.clone(pre_state)

                pre.tick += 1 // Simulate a waiting tick between steps

                // Set proper target for every path
                node.paths.forEach(p => {
                    p.path.start_state = pre

                    if (p.spot) p.path.target = dig_area(p.spot)
                    else p.path.target = tree.areas.find((a) => a.name == node.where_to).area
                })

                // Augment path and propagate post_state to all children
                if (node.children.length > 0) {
                    let area = tree.areas.find((a) => a.name == node.where_to)

                    let to_here = node.paths.find(p => p.spot == null)
                    let ap = await Path.augment(to_here.path)

                    for (const c of node.children) {
                        await helper(c.value, narrow_down(candidates, {area: area, ping: c.key}, assumedRange(tree)), ap.post_state)
                    }
                }
            }
        }

        if (!tree.root) tree.root = init_leaf(tree.clue.solution.candidates)

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
            parent: { node: augmented_decision_tree, kind: Pulse },
            depth: number,
            remaining_candidates: MapCoordinate[],
            decisions: ScanDecision[],
        ): Promise<augmented_decision_tree> {

            let t: augmented_decision_tree = {
                directions: "",
                root: tree,
                parent: parent,
                scan_spot: null,
                path: null,
                raw: node,
                depth: depth,
                remaining_candidates: remaining_candidates,
                decisions: decisions,
                children: []
            }

            // For triples with more than one candidate, inherit the parent's spot
            if (parent && parent.kind.pulse == 3 && remaining_candidates.length > 1) t.scan_spot = parent.node.scan_spot

            if (node.where_to != null) {
                t.scan_spot = tree.areas.find((a) => a.name == node.where_to)

                let narrowing = spot_narrowing(remaining_candidates, t.scan_spot, assumedRange(tree))

                // The node is not a leaf node, handle all relevant children
                for (let child of node.children) {
                    t.children.push({
                        key: child.key,
                        value: await helper(
                            child ? child.value : null,
                            {node: t, kind: child.key},
                            depth + 1,
                            narrowing.find(n => Pulse.equals(n.pulse, child.key)).narrowed_candidates,
                            decisions.concat([{
                                area: t.scan_spot,
                                ping: child.key
                            }])
                        )
                    })
                }
            } else {
                // TODO: Decide if this is the place to create synthetic children

                if (remaining_candidates.length > 1) {

                } else {
                    t.is_leaf = true
                    t.leaf_spot = remaining_candidates[0]

                    const path = node.paths.find(p => MapCoordinate.eq2(p.spot, t.leaf_spot))

                    t.path = path.path
                    t.directions = path.short_instruction
                }
            }

            return t
        }

        await prune_clean_and_propagate(tree)

        return helper(tree.root, null, 0, tree.clue.solution.candidates, []);
    }

    export class ScanExplanationModal extends Modal {
        protected hidden() {
            ($("#pingexplanationvideo").get(0) as HTMLVideoElement).pause();
        }
    }

    export type ScanDecision = {
        area: ScanSpot,
        ping: Pulse
    }

    export namespace ScanDecision {
        export function toString(decision: ScanDecision) {
            return `${decision.area.name}${Pulse.meta(decision.ping).shorted}`
        }
    }

    export function spot_narrowing(candidates: MapCoordinate[], area: ScanSpot, range: number): {
        pulse: Pulse,
        narrowed_candidates: MapCoordinate[]
    }[] {
        return Pulse.all.map((p) => {
            return {
                pulse: p,
                narrowed_candidates: narrow_down(candidates, {area: area, ping: p}, range)
            }
        })
    }

    export function narrow_down(candidates: MapCoordinate[], decision: ScanDecision, range: number): MapCoordinate[] {
        return candidates.filter((s) => area_pulse(s, decision.area, range).some((p2) => Pulse.equals(decision.ping, p2)))
    }

    export function template_resolvers(tree: tree, path: {}): Record<string, (args: string[]) => string> {
        return {
            "target": () => {
                if (Array.isArray(path.to)) {
                    return util.natural_join(path.to
                        .map((c) => spotNumber(tree, c))
                        .sort(natural_order)
                        .map((c) => `{{digspot ${c}}}`))
                } else if (typeof path.to == "string") {
                    return `{{scanarea ${path.to}}}`
                } else {
                    return `{{digspot ${spotNumber(tree, path.to)}}}`
                }
            }
        }
    }
}