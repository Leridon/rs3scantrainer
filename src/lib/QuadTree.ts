import {TileRectangle} from "./runescape/coordinates";
import {Rectangle, Vector2} from "./math";

export class QuadTree<T extends QuadTree.Element<T>> {
    private elements: T[] =[]
    private subdivisions: QuadTree<T>[] = []
    private is_dirty = false

    private constructor(private parent: QuadTree<T>,
                        private rect: Rectangle) {

    }

    private createSubdivisions() {
        const center = Rectangle.center(this.rect)

        const sub: Rectangle[] = [
            Rectangle.from(this.rect.topleft, Vector2.add(center, {x: 0, y: 1})),
            Rectangle.from(Rectangle.topRight(this.rect), Vector2.add(center, {x: 1, y: 1})),
            Rectangle.from(this.rect.botright, Vector2.add(center, {x: 1, y: 0})),
            Rectangle.from(Rectangle.bottomLeft(this.rect), center),
        ]

        this.subdivisions = sub.map(s => new QuadTree<T>(this, s))

        // Resort elements
        const elements = this.elements
        this.elements = []
        elements.forEach(e => this.insert(e))
    }

    insert(...elements: T[]) {
        const affectedNodes = elements.map(element => {
            const bounds = element.bounds()

            function pushDown(self: QuadTree<T>): QuadTree<T> {
                // Find eligible subdivision
                const next = self.subdivisions.find(s => Rectangle.containsRect(s.rect, bounds))

                if (next) return pushDown(next)
                else {
                    self.elements.push(element)

                    element.spatial = self

                    self.is_dirty = true

                    return self
                }
            }

            return pushDown(this)
        })

        affectedNodes.forEach(node => {
            if (node.is_dirty) {
                if (node.elements.length > 10) node.createSubdivisions()
            }
        })
    }

    iterate(rect: Rectangle, f: (_: T) => any, do_element_check: boolean = false) {

        {
            const els = do_element_check
                ? this.elements.filter(el => Rectangle.overlaps(rect, el.bounds()))
                : this.elements

            els.forEach(f)
        }

        this.subdivisions
            .filter(child => Rectangle.overlaps(rect, child.rect))
            .forEach(child => {
                child.iterate(rect, f, do_element_check)
            })
    }

    static init<T extends QuadTree.Element<T>>(rect: Rectangle): QuadTree<T> {
        return new QuadTree<T>(null, rect)
    }
}

export namespace QuadTree {
    export interface Element<T> {
        spatial: QuadTree<Element<T>>

        bounds(): Rectangle
    }
}