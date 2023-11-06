import * as a1lib from "@alt1/base"
import * as OCR from "@alt1/ocr";
import {ImgRef} from "@alt1/base";
import {ScanStep} from "lib/runescape/clues";
import {byType} from "data/clues";
import * as oldlib from "./oldlib";

let font = require("@alt1/ocr/fonts/aa_8px_new.js");

export class ScantextReader {
    pos: a1lib.PointLike | null = null;

    read(img: ImgRef) {
        if (!this.pos) {
            throw new Error("not found");
        }
        const lineheight = 12;
        let lines: string[] = [];
        let capty = this.pos.y;
        let data = img.toData(this.pos.x - 20, capty, 180, 190);
        for (let lineindex = 0; lineindex < 13; lineindex++) {
            let y = this.pos.y - capty + lineindex * lineheight;
            let str = OCR.findReadLine(data, font, [[255, 255, 255]], 70, y, 40, 1);
            lines.push(str.text);
        }
        let text = "";
        let lastempty = false;
        for (let line of lines) {
            if (line) {
                if (lastempty) {
                    text += "\n";
                } else if (text) {
                    text += " ";
                }
                text += line;
            }
            lastempty = !line && !!text;
        }

        return this.findByText(text)
    }

    private findByText(text: string) {
        let str = text.split("\n")[0];

        let bestscore = 0;
        let best: ScanStep | null = null;

        for (let clue of byType("scan") as ScanStep[]) {
            let score = oldlib.strcomparescore(str, clue.scantext);
            if (score > bestscore) {
                best = clue;
                bestscore = score;
            }
        }

        if (bestscore < 0.5 || !best) {
            return null;
        }

        return best;
    }
}