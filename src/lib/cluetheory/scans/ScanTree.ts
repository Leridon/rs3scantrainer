import {MapCoordinate, MapRectangle} from "lib/runescape/coordinates";
import {Path} from "lib/runescape/pathing";
import {Vector2} from "lib/math/Vector";
import {Scans} from "lib/runescape/clues/scans";
import * as lodash from "lodash";
import {Clues, ScanStep} from "../../runescape/clues";
import {util} from "../../util/util";
import {ScanTheory} from "./Scans";

export namespace ScanTree {
    import Pulse = Scans.Pulse;

    import movement_state = Path.movement_state;

    import digSpotArea = Clues.digSpotArea;
    import PulseInformation = ScanTheory.PulseInformation;
    import spot_narrowing = ScanTheory.spot_narrowing;

    export type ScanRegion = {
        name: string
        area: MapRectangle
    }

    export type ScanTree = {
        spot_ordering: MapCoordinate[],
        assumes_meerkats: boolean,
        root: ScanTreeNode
    }

    export type TreeWithClue = ScanTree & {
        clue: ScanStep
    }

    export type ScanTreeNode = {
        path: Path,
        region?: ScanRegion,
        directions: string,
        children: {
            key: PulseInformation,
            value: ScanTreeNode
        }[]
    }

    export namespace Augmentation {
        export type AugmentedDecisionTree = {
            raw: ScanTreeNode,
            raw_root: ScanTree,
            root: AugmentedDecisionTree,
            parent: {
                key: PulseInformation
                node: AugmentedDecisionTree,
            } | null,
            region?: ScanRegion,
            path: Path.augmented,
            depth: number,
            remaining_candidates: MapCoordinate[],
            information: ScanInformation[],
            children: {
                key: Scans.Pulse,
                value: AugmentedDecisionTree
            }[],
            completeness?: completeness_t,
            correctness?: correctness_t,
        }

        export type completeness_t = "complete" | "incomplete_children" | "incomplete"
        export type correctness_t = "correct" | "correct_with_warnings" | "error" | "error_in_children"

        export function completeness_meta(completeness: completeness_t | correctness_t): { char: string, cls: string, desc: string } {
            let meta: Record<completeness_t | correctness_t, { char: string, cls: string, desc: string }> = {
                complete: {char: "\u2713", cls: "ctr-correct", desc: "This branch is complete."},
                correct: {char: "\u2713", cls: "ctr-correct", desc: "All paths are correct."},
                correct_with_warnings: {char: "\u2713", cls: "ctr-semicorrect", desc: "All paths are correct, but some have warnings."},
                error: {char: "\u2715", cls: "ctr-incorrect", desc: "There is an error in this path."},
                error_in_children: {char: "\u2715", cls: "ctr-semiincorrect", desc: "A child path has errors."},
                incomplete: {char: "?", cls: "ctr-incorrect", desc: "This branch is incomplete."},
                incomplete_children: {char: "?", cls: "ctr-semiincorrect", desc: "Branch has incomplete children."}
            }

            return meta[completeness]
        }

        export async function augment(tree: TreeWithClue, options: {
            analyze_completeness?: boolean
        } = {}): Promise<AugmentedDecisionTree> {
            async function helper(
                node: ScanTreeNode,
                parent: { node: AugmentedDecisionTree, key: PulseInformation },
                depth: number,
                remaining_candidates: MapCoordinate[],
                information: ScanInformation[],
                start_state: Path.movement_state
            ): Promise<AugmentedDecisionTree> {

                let region = node.region

                let augmented_path = await Path.augment(node.path, start_state, remaining_candidates.length == 1 ? digSpotArea(remaining_candidates[0]) : region?.area)

                let t: AugmentedDecisionTree = {
                    //directions: null,
                    raw_root: tree,
                    root: null,
                    parent: parent,
                    region: null,
                    path: augmented_path,
                    raw: node,
                    depth: depth,
                    remaining_candidates: remaining_candidates,
                    information: information,
                    children: []
                }

                let cloned_state = lodash.cloneDeep(t.path.post_state)
                cloned_state.tick += 1 // Assume 1 tick reaction time between steps. Approximation, but may help to make timings and cooldowns more realistic

                t.root = parent == null ? t : parent.node.root
                t.region = node.region || {
                    area: MapRectangle.fromTile(t.path.post_state.position.tile),
                    name: ""
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

            normalize(tree)    // TODO: This is probably something that can (and should) be combined

            let aug_tree = await helper(tree.root, null, 0, tree.clue.solution.candidates, [], movement_state.start())

            if (options.analyze_completeness) aug_tree = analyze_correctness(aug_tree)

            return aug_tree
        }

        export function analyze_correctness(tree: AugmentedDecisionTree): AugmentedDecisionTree {
            tree.children.forEach(c => analyze_correctness(c.value))

            let cs = tree.children.map(c => c.value)

            let issues = Path.collect_issues(tree.path)

            if (issues.some(i => i.level == 0)) tree.correctness = "error"
            else if (cs.some(c => c.correctness == "error" || c.correctness == "error_in_children")) tree.correctness = "error_in_children"
            else if (issues.some(i => i.level == 1) || cs.some(c => c.correctness == "correct_with_warnings")) tree.correctness = "correct_with_warnings"
            else tree.correctness = "correct"

            if (tree.remaining_candidates.length > 1 && cs.length == 0) tree.completeness = "incomplete"
            else if (cs.some(c => c.completeness == "incomplete" || c.completeness == "incomplete_children")) tree.completeness = "incomplete_children"
            else tree.completeness = "complete"

            return tree
        }

        export namespace AugmentedDecisionTree {
            export function decision_string(node: AugmentedDecisionTree): string {
                if (!node.parent) return "Start"
                else {
                    let type = node.parent.key
                    let context = node.parent.node.children.map(c => c.key)

                    // Use the full word when it's not "different level"
                    if (!type.different_level) {
                        if (util.count(context, (p => p.different_level)) == context.length - 1) return "Far" // Is the only non-different level
                        else return type.pulse.toString()
                    } else {
                        let counterpart_exists = context.some(p => p.pulse == type.pulse && !p.different_level)

                        if (!counterpart_exists) return type.pulse.toString() // If the non-different level counterpart does not exist, just use the pretty string

                        if (util.count(context, (p => p.different_level)) == 1) return "Different level" // Is the only different level
                        else return `${type.pulse}DL`
                    }
                }
            }

            export function collect_parents(node: AugmentedDecisionTree, include_node: boolean = true): AugmentedDecisionTree[] {
                if (!node) return []

                let par = collect_parents(node.parent?.node, true)

                if (include_node) par.push(node)

                return par
            }

            export function traverse(tree: AugmentedDecisionTree, f: (_: AugmentedDecisionTree) => any, include_root: boolean = true): void {
                if (include_root && tree) f(tree)

                tree.children.forEach(c => traverse(c.value, f, true))
            }

            export function traverse_parents(node: AugmentedDecisionTree, f: (_: AugmentedDecisionTree) => void): void {
                if (node.parent == null) return

                f(node.parent.node)
                traverse_parents(node.parent.node, f)
            }
        }
    }

    export function traverse(tree: ScanTreeNode, f: (_: ScanTreeNode) => void): void {
        if (tree) f(tree)

        tree.children.forEach(c => traverse(c.value, f))
    }

    export function init_leaf(): ScanTreeNode {
        return {
            children: [],
            directions: "Missing directions",
            path: [],
        }
    }

    export function normalize(tree: TreeWithClue): TreeWithClue {
        function helper(node: ScanTreeNode, candidates: MapCoordinate[], last_known_position: MapRectangle) {
            let region = node.region

            let area = region?.area || MapRectangle.fromTile(Path.ends_up(node.path)) || last_known_position

            // Update children to remove all dead branches and add missing branches
            let pruned_children: {
                child: {
                    key: PulseInformation,
                    value: ScanTreeNode
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
                helper(child.value, candidates, area)
            })
        }

        if (!tree.root) tree.root = init_leaf()

        helper(tree.root, tree.clue.solution.candidates, null)

        return tree
    }

    export function assumedRange(tree: TreeWithClue): number {
        let r = tree.clue.range
        if (tree.assumes_meerkats) r += 5;
        return r
    }

    export function spotNumber(self: ScanTree.ScanTree, spot: MapCoordinate): number {
        return self.spot_ordering.findIndex((s) => Vector2.eq(s, spot)) + 1
    }

    export type ScanInformation = PulseInformation & {
        area: MapRectangle
    }
}