import ClueScrollReader from "./cluesolver/cluereader";
import {ClueStep} from "lib/runescape/clues";
import {ImgRef} from "@alt1/base";

export class ClueReader {
    reader = new ClueScrollReader();

    async find(img: ImgRef): Promise<ClueStep> {
        let match = await this.reader.find()

        if (!match) return null

        if (match.intf.type == "scan") {
            return this.reader.scantextreader.read(img);
        }

        return null
    }
}