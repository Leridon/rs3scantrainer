import {MapCoordinate, MapRectangle} from "../coordinates";
import {indirected, method_base, resolved} from "../methods";
import {area_pulse, Pulse} from "./scans";
import {Modal} from "../../ui/widgets/modal";
import {ScanStep} from "../clues";
import {util} from "../../util/util";
import {Path} from "../pathing";
import * as lodash from "lodash";
import {TextRendering} from "../../ui/TextRendering";
import {Rectangle, Vector2} from "../../util/math";

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

    // There is world in which this type isn't needed and scan trees are just a tree of paths.
    // There are some drawbacks in this idea, so for now it stays how it is.
    //  - pro: Would make sections that are like "check the remaining spots" simpler
    //  - pro: Cleaner implementation as a whole
    //  - con: People are used to the format
    //  - con: Would maybe exclude the ability to mark area with leeway
    //  - con: Having dedicated areas incentivizes to make keep the tree simple instead of having a million decision points
    //  - con: How would that work with non-deterministic paths/teleports?

    export type ScanSpot = {
        name: string
        area: MapRectangle
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
            directions: string,
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
        raw_root: tree,
        root: augmented_decision_tree,
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

    export function init_leaf(candidates: MapCoordinate[]): decision_tree {
        return {
            where_to: null,
            children: [],
            paths: candidates.map(c => {
                return {
                    spot: c,
                    directions: "Dig at {{target}}",
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
            let area = tree.areas.find((a) => a.name == node.where_to)

            if (area) {
                let area = tree.areas.find((a) => a.name == node.where_to)

                if (!area) node.where_to = null

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
                    directions: "Move to {{target}}"
                }]
            } else {
                node.where_to = null
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
                // Find the path to here, and propagate previous state to it.
                let to_here = node.paths.find(p => p.spot == null)

                let fixed_pre_state = pre_state

                if (to_here) {
                    to_here.path.start_state = lodash.cloneDeep(pre_state)
                    to_here.path.start_state.tick += 1 // Simulate a waiting tick between steps
                    to_here.path.target = tree.areas.find((a) => a.name == node.where_to).area

                    let ap = await Path.augment(to_here.path)

                    // Propagate post_state to all children
                    if (node.children.length > 0) {
                        let area = tree.areas.find((a) => a.name == node.where_to)

                        for (const c of node.children) {
                            await helper(c.value, narrow_down(candidates, {area: area, ping: c.key}, assumedRange(tree)), lodash.cloneDeep(ap.post_state))
                        }
                    }

                    fixed_pre_state = ap.post_state
                }

                // Set proper target for every other path from here to a dig spot.
                node.paths.filter(p => p.spot != null).forEach(p => {
                    p.path.start_state = lodash.cloneDeep(fixed_pre_state)
                    p.path.start_state.tick += 1 // Simulate a waiting tick between steps

                    p.path.target = dig_area(p.spot)
                })
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
                directions: null,
                raw_root: tree,
                root: null,
                parent: parent,
                scan_spot: null,
                path: null,
                raw: node,
                depth: depth,
                remaining_candidates: remaining_candidates,
                decisions: decisions,
                children: []
            }

            t.root = parent == null ? t : parent.node.root

            // For triples with more than one candidate, inherit the parent's spot, TODO: Is this sensible?
            if (parent && parent.kind.pulse == 3 && remaining_candidates.length > 1) t.scan_spot = parent.node.scan_spot

            if (node.where_to != null) {
                t.scan_spot = tree.areas.find((a) => a.name == node.where_to)

                let path = node.paths.find((p) => p.spot == null)

                if (path) {
                    t.path = path.path
                    t.directions = path.directions
                }

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
                if (remaining_candidates.length > 1) {
                    t.children = []

                    remaining_candidates.forEach((c) => {

                        let p = node.paths.find((p) => MapCoordinate.eq2(p.spot, c))

                        t.children.push({
                            key: null,
                            value: {
                                children: [],
                                root: t.root,
                                decisions: t.decisions,
                                depth: t.depth + 1,
                                directions: p.directions,
                                is_leaf: true,
                                leaf_spot: c,
                                parent: {kind: null, node: t},
                                path: p.path,
                                raw: null,
                                remaining_candidates: [c],
                                raw_root: t.raw_root,
                            }
                        })
                    })

                } else {
                    t.is_leaf = true
                    t.leaf_spot = remaining_candidates[0]

                    const path = node.paths.find(p => MapCoordinate.eq2(p.spot, t.leaf_spot))

                    t.path = path.path
                    t.directions = path.directions
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
        return candidates.filter((s) => area_pulse(s, decision.area.area, range).some((p2) => Pulse.equals(decision.ping, p2)))
    }

    export function template_resolvers(node: ScanTree.augmented_decision_tree, spot?: MapCoordinate): Record<string, (args: string[]) => string> {
        return {
            "target": () => {
                if (node.is_leaf) {
                    return render_digspot(spotNumber(node.raw_root, node.leaf_spot))
                } else if (spot) {
                    return render_digspot(spotNumber(node.raw_root, spot))
                } else if (node.scan_spot) {
                    return `{{scanarea ${node.scan_spot.name}}}`
                } else {
                    return "{ERROR: No target}"
                }
            },
            "candidates":
                () => {
                    return util.natural_join(
                        shorten_integer_list((spot ? [spot] : node.remaining_candidates)
                                .map(c => spotNumber(node.raw_root, c)),
                            render_digspot
                        ))
                }
        }
    }
}