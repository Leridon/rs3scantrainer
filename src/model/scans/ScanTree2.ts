import {path} from "../../uicontrol/map/layers/ScanLayer";
import {eq, MapCoordinate} from "../coordinates";
import {ScanSpot} from "../methods";
import {ChildType, spot_narrowing} from "./scans";
import {ScanDecision} from "../../uicontrol/scanedit/TreeEdit";
import {ScanStep} from "../clues";

export namespace ScanTree2 {
    export type edge_path = {
        from?: string,
        to: string | MapCoordinate | MapCoordinate[],
        short_instruction: string,
        path?: path,
    }

    export type tree = {
        type: "scantree",
        clue: ScanStep | number,
        spot_ordering: MapCoordinate[],
        assumes_meerkats: boolean,
        areas: ScanSpot[],
        methods: edge_path[],
        root: decision_tree
    }

    export type indirect_tree = tree & { clue: number }
    export type resolved_tree = tree & { clue: ScanStep }

    export type decision_tree = {
        where: string,
        why?: string,
        children: {
            key: ChildType,
            value: decision_tree
        }[]
    }

    export type augmented_decision_tree = {
        parent: { node: augmented_decision_tree, kind: ChildType },
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

    function assumedRange(tree: resolved_tree): number {
        let r = tree.clue.range
        if (tree.assumes_meerkats) r += 5;
        return r
    }

    export function spotNumber(self: ScanTree2.tree, spot: MapCoordinate): number {
        return self.spot_ordering.findIndex((s) => eq(s, spot)) + 1
    }

    export function augment(tree: resolved_tree): augmented_decision_tree {

        function helper(
            node: decision_tree,
            parent: { node: augmented_decision_tree, kind: ChildType },
            depth: number,
            remaining_candidates: MapCoordinate[],
            decisions: ScanDecision[],
        ): augmented_decision_tree {

            let t: augmented_decision_tree = {
                parent: parent,
                where: null,
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

    export function gatherPaths(root_node: augmented_decision_tree): {
        from?: string,
        to: string | MapCoordinate
    }[] {
        let accumulator: {
            from?: string,
            to: string | MapCoordinate
        }[] = []

        function helper(node: augmented_decision_tree): void {
            let from = node.parent ? node.parent.node.where.name : null

            if (node.raw) {
                accumulator.push({
                    from: from,
                    to: node.where.name
                })

                node.children.forEach((c) => helper(c.value))
            } else {
                node.remaining_candidates.forEach((c) => {
                    accumulator.push({
                        from: from,
                        to: c
                    })
                })
            }
        }

        helper(root_node)

        return accumulator

    }
}