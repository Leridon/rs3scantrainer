import {Modal} from "../ui/widgets/modal";
import Widget from "../ui/widgets/Widget";
import LightButton from "../ui/widgets/LightButton";
import * as a1base from "@alt1/base";
import {Rectangle, Vector2} from "../../lib/math/Vector";
import {keys} from "lodash";
import PulsePredictor from "./PulsePredictor";

type rgb_color = [number, number, number, number]

function color_diff(a: rgb_color, b: rgb_color): number {
    return Math.sqrt(
        Math.pow(a[0] - b[0], 2) +
        Math.pow(a[1] - b[1], 2) +
        Math.pow(a[2] - b[2], 2)
    )
}

function rgb2hue(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var c = max - min;
    var hue;
    if (c == 0) {
        hue = 0;
    } else {
        switch (max) {
            case r:
                var segment = (g - b) / c;
                var shift = 0 / 60;       // R° / (360° / hex sides)
                if (segment < 0) {          // hue > 180, full rotation
                    shift = 360 / 60;         // R° / (360° / hex sides)
                }
                hue = segment + shift;
                break;
            case g:
                var segment = (b - r) / c;
                var shift = 120 / 60;     // G° / (360° / hex sides)
                hue = segment + shift;
                break;
            case b:
                var segment = (r - g) / c;
                var shift = 240 / 60;     // B° / (360° / hex sides)
                hue = segment + shift;
                break;
        }
    }
    return hue / 6
}

function get_hue(c: rgb_color): number {
    return rgb2hue(c[0], c[1], c[2])
}


function hue_distance(a: rgb_color, b: rgb_color): number {
    let a_hue = get_hue(a)
    let b_hue = get_hue(b)

    return Math.min(
        Math.abs(a_hue - b_hue),
        (1 - a_hue) + b_hue,
        (1 - b_hue) + a_hue,
    )
}

function my_distance(a: rgb_color, b: rgb_color): number {
    let cutoff = 30

    return Math.min(cutoff, color_diff(a, b)) / cutoff
}

function my_distance2(a: rgb_color, b: rgb_color): number {
    let cutoff = 0.1

    return Math.pow(Math.min(cutoff, hue_distance(a, b)) / cutoff, 2)
}

function grayscale(x: number): rgb_color {
    return [x * 255, x * 255, x * 255, 255]
}

class MyImageData {
    constructor(public raw: ImageData) {

    }

    get(pos: Vector2) {
        return this.raw.getPixel(pos.x, pos.y)
    }

    map(f: (_: rgb_color) => rgb_color): MyImageData {
        let n = new ImageData(this.raw.width, this.raw.height)

        for (let x = 0; x < this.raw.width; x++) {
            for (let y = 0; y < this.raw.height; y++) {
                n.setPixel(x, y, f(this.raw.getPixel(x, y)))
            }
        }

        return new MyImageData(n)
    }

    dataUri(): string {
        return "data:image/png;base64," + this.raw.toPngBase64()
    }
}

function capture(rect: Rectangle): MyImageData {
    return new MyImageData(a1base.captureHold(
        rect.topleft.x,
        rect.botright.y,
        Rectangle.width(rect) + 1,
        Rectangle.height(rect) + 1)
        .toData())

}

const calibration: Record<string, rgb_color> = {
    single: [16, 140, 201, 255],
    double: [194, 134, 7, 255],
    triple: [179, 23, 3, 255],
}

export class PulseReaderModal extends Modal {
    body: Widget

    interval: any = null

    content: Widget

    constructor(id: string) {
        super(id);

        new PulsePredictor({interval: 300}).start()

        this.body = Widget.wrap(this._modal.find(".modal-body"))

        this.interval = window.setInterval(() => this.update(), 100)

        new LightButton("capture").on("click", () => this.update()).appendTo(this.body)
        this.content = c().appendTo(this.body)
    }

    override hidden() {
        if (this.interval) window.clearInterval(this.interval)
    }

    private update() {

        let img = this.capture()

        this.content.empty()
        let row = c("<div></div>").appendTo(this.content)

        c(`<img src='${img.dataUri()}'>`).appendTo(row)

        let right = c().appendTo(row)

        let dist: (a: rgb_color, b: rgb_color) => number = my_distance

        for (let a of keys(calibration)) {
            c().text(a).appendTo(right)
            c(`<img>`)
                .tapRaw(r => r.attr("src", img.map(c => grayscale(1 - dist(c, calibration[a]))).dataUri()))
                .appendTo(right)
        }
    }

    private capture(): MyImageData {
        let my_center = {x: 1138, y: 558}

        //return captureHoldFullRs().toData()

        return capture(Rectangle.centered_on(my_center, {
            x: 200,
            y: 200,
        }))
    }
}