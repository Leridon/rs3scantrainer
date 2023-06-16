import {Box, eq, MapCoordinate} from "../coordinates";
import {indirected, method_base, resolved} from "../methods";
import {area_pulse, Pulse} from "./scans";
import {Modal} from "../../ui/widgets/modal";
import {ScanStep} from "../clues";
import {util} from "../../util/util";
import type {Path} from "../pathing";

export namespace ScanTree2 {

    import natural_order = util.natural_order;
    export type ScanSpot = {
        name: string,
        is_virtual?: boolean,
        area?: Box,
        level: number,
        is_far_away?: boolean,
    }

    export type edge_path = {
        from?: string,
        to: string | MapCoordinate[],
        short_instruction?: string,
        path?: Path,
    }

    export type tree = method_base & {
        type: "scantree",
        spot_ordering: MapCoordinate[],
        assumes_meerkats: boolean,
        areas: ScanSpot[],
        methods: edge_path[],
        root: decision_tree
    }

    export type resolved_scan_tree = tree & resolved<ScanStep>
    export type indirect_scan_tree = tree & indirected

    export type decision_tree = {
        where: string,
        why?: string,
        children: {
            key: Pulse,
            value: decision_tree
        }[]
    }

    export type augmented_decision_tree = {
        root: tree,
        parent: { node: augmented_decision_tree, kind: Pulse },
        path: edge_path,
        where: ScanSpot
        raw: decision_tree,
        depth: number,
        remaining_candidates: MapCoordinate[],
        decisions: ScanDecision[],
        children: {
            key: Pulse,
            value: augmented_decision_tree
        }[]
    }

    export function assumedRange(tree: resolved_scan_tree): number {
        let r = tree.clue.range
        if (tree.assumes_meerkats) r += 5;
        return r
    }

    export function spotNumber(self: ScanTree2.tree, spot: MapCoordinate): number {
        return self.spot_ordering.findIndex((s) => eq(s, spot)) + 1
    }

    export function augment(tree: resolved_scan_tree): augmented_decision_tree {

        function helper(
            node: decision_tree,
            parent: { node: augmented_decision_tree, kind: Pulse },
            depth: number,
            remaining_candidates: MapCoordinate[],
            decisions: ScanDecision[],
        ): augmented_decision_tree {

            let edge: edge_path = {
                from: parent ? parent.node.where.name : null,
                to: node ? node.where : remaining_candidates
            }

            let path = tree.methods.find((m) => edgeSame(m, edge))

            let t: augmented_decision_tree = {
                root: tree,
                parent: parent,
                where: null,
                path: path,//tree.methods.find((m) => ((parent == null) || (m.from == parent.node.where.name)) && (node && (node.where == m.to) || remaining_candidates == m.to)),
                raw: node,
                depth: depth,
                remaining_candidates: remaining_candidates,
                decisions: decisions,
                children: []
            }

            // For triples with more than one candidate, inherit the parent's spot
            if (parent && parent.kind.pulse == 3 && remaining_candidates.length > 1) t.where = parent.node.where

            if (node != null) {
                // The node is not a leaf node, find all relevant children
                t.where = tree.areas.find((a) => a.name == node.where)

                let narrowing = spot_narrowing(remaining_candidates, t.where, assumedRange(tree))

                narrowing.forEach((v: { pulse: Pulse, narrowed_candidates: MapCoordinate[] }) => {

                    node.children

                    let child = node.children.find((c) => Pulse.equals(c.key, v.pulse))

                    if ((v.narrowed_candidates.length > 0 || child != null)) {
                        t.children.push({
                            key: v.pulse,
                            value: helper(
                                child ? child.value : null,
                                {node: t, kind: v.pulse},
                                depth + 1,
                                v.narrowed_candidates,
                                decisions.concat([{
                                    area: t.where,
                                    ping: v.pulse
                                }])
                            )
                        })
                    }
                })
            }

            return t
        }

        return helper(tree.root, null, 0, tree.clue.solution.candidates, [])
    }

    export function gatherPaths(root_node: augmented_decision_tree): edge_path[] {
        let accumulator: edge_path[] = []

        function push(edge: edge_path) {
            if (!accumulator.some((p) => edgeSame(p, edge))) accumulator.push(edge)
        }

        function helper(node: augmented_decision_tree): void {
            let from = node.parent ? node.parent.node.where.name : null

            if (node.raw) {
                push({
                    from: from,
                    to: node.where.name
                })

                node.children.forEach((c) => helper(c.value))
            } else {
                if (node.parent && node.parent.kind.pulse == 3) {
                    node.remaining_candidates.forEach((c) => {
                        push({
                            from: from,
                            to: [c]
                        })
                    })
                } else {
                    push({
                        from: from,
                        to: node.remaining_candidates
                    })
                }
            }
        }

        helper(root_node)

        return accumulator
    }

    export function edgeSame(a: edge_path, b: edge_path): boolean {
        if (a.from != b.from) return false

        if (a.to == b.to) return true

        if (Array.isArray(a.to) && Array.isArray(b.to)) {
            return a.to.length == b.to.length && a.to.every((c) => (b.to as MapCoordinate[]).some((bc) => eq(c, bc)))
        }

        return false
    }

    export function edgeTitle(self: edge_path, tree: tree): string {
        let str = self.from ? `${self.from} to ` : "To ";

        if (Array.isArray(self.to)) {
            if (self.to.length != 1) str += `(${self.to.map((c) => spotNumber(tree, c)).sort(natural_order).join(", ")})`
            else str += spotNumber(tree, self.to[0])
        } else if (typeof self.to == "string") {
            str += self.to
        } else {
            str += spotNumber(tree, self.to)
        }

        return str
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

    export function spot_narrowing(candidates: MapCoordinate[], area: ScanSpot, range: number): { pulse: Pulse, narrowed_candidates: MapCoordinate[] }[] {
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

    export function template_resolvers(tree: tree, path: edge_path): Record<string, (args: string[]) => string> {
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