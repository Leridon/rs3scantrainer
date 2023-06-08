import {path} from "../../ui/map/layers/ScanLayer";
import {Box, eq, MapCoordinate} from "../coordinates";
import {indirect, indirected, method_base, resolved} from "../methods";
import {area_pulse, ChildType} from "./scans";
import {Modal} from "../../ui/widgets/modal";
import {ScanStep} from "../clues";
import {util} from "../../util/util";

export namespace ScanTree2 {

    import natural_order = util.natural_order;
    export type ScanSpot = {
        name: string,
        is_virtual?: boolean,
        area?: Box,
        is_far_away?: boolean,
        overrides?: {
            single?: MapCoordinate[]
            double?: MapCoordinate[]
            triple?: MapCoordinate[]
            toofar?: MapCoordinate[]
            differentlevel?: MapCoordinate[]
        }
    }

    export namespace ScanSpot {
        export function override(s: ScanSpot, type: ChildType): MapCoordinate[] | null {
            switch (type) {
                case ChildType.SINGLE:
                    return s.overrides ? s.overrides.single : null;
                case ChildType.DOUBLE:
                    return s.overrides ? s.overrides.double : null;
                case ChildType.TRIPLE:
                    return s.overrides ? s.overrides.triple : null;
                case ChildType.DIFFERENTLEVEL:
                    return s.overrides ? s.overrides.differentlevel : null;
                case ChildType.TOOFAR:
                    return s.overrides ? s.overrides.toofar : null;

            }
        }

        export function setOverride(s: ScanSpot, type: ChildType, override: MapCoordinate[]): void {
            if (!s.overrides) s.overrides = {}

            switch (type) {
                case ChildType.SINGLE:
                    s.overrides.single = override;
                    break;
                case ChildType.DOUBLE:
                    s.overrides.double = override;
                    break;
                case ChildType.TRIPLE:
                    s.overrides.triple = override;
                    break;
                case ChildType.DIFFERENTLEVEL:
                    s.overrides.differentlevel = override;
                    break;
                case ChildType.TOOFAR:
                    s.overrides.toofar = override;
                    break;

            }
        }
    }

    export type edge_path = {
        from?: string,
        to: string | MapCoordinate[],
        short_instruction?: string,
        path?: path,
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
            key: ChildType,
            value: decision_tree
        }[]
    }

    export type augmented_decision_tree = {
        root: tree,
        parent: { node: augmented_decision_tree, kind: ChildType },
        path: edge_path,
        where: ScanSpot
        raw: decision_tree,
        depth: number,
        remaining_candidates: MapCoordinate[],
        decisions: ScanDecision[],
        children: {
            key: ChildType,
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
            parent: { node: augmented_decision_tree, kind: ChildType },
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

            if (node != null) {
                // The node is not a leaf node, find all relevant children
                t.where = tree.areas.find((a) => a.name == node.where)

                let narrowing = spot_narrowing(remaining_candidates, t.where, assumedRange(tree))

                narrowing.forEach((v, k) => {
                    let child = node.children.find((c) => c.key == k)

                    if ((v.length > 0 || child != null)) {
                        t.children.push({
                            key: k,
                            value: helper(
                                child ? child.value : null,
                                {node: t, kind: k},
                                depth + 1,
                                narrowing.get(k),
                                decisions.concat([{
                                    area: t.where,
                                    ping: k
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
            if(!accumulator.some((p) => edgeSame(p, edge))) accumulator.push(edge)
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
                if (node.parent && node.parent.kind == ChildType.TRIPLE) {
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
        ping: ChildType
    }

    export namespace ScanDecision {
        export function toString(decision: ScanDecision) {
            function postfix(kind: ChildType) {
                switch (kind) {
                    case ChildType.SINGLE:
                        return "1"
                    case ChildType.DOUBLE:
                        return "2"
                    case ChildType.TRIPLE:
                        return "3"
                    case ChildType.DIFFERENTLEVEL:
                        return "\"DL\""
                    case ChildType.TOOFAR:
                        return "\"TF\""
                }
            }

            return `${decision.area.name}${postfix(decision.ping)}`
        }
    }

    export function spot_narrowing(candidates: MapCoordinate[], area: ScanSpot, range: number): Map<ChildType, MapCoordinate[]> {
        let m = new Map<ChildType, MapCoordinate[]>()

        ChildType.all.forEach((c) => {
            let override = ScanSpot.override(area, c)

            m.set(c, override || (area.is_virtual ? [] : candidates.filter((s) => area_pulse(s, area.area, range).map(ChildType.fromPulse).includes(c))))
        })

        return m
    }

    export function narrow_down(candidates: MapCoordinate[], decision: ScanDecision, range: number): MapCoordinate[] {
        return spot_narrowing(candidates, decision.area, range).get(decision.ping)
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