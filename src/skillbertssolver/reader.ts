import ClueScrollReader from "./cluesolver/cluereader";
import {ClueStep} from "../clues";
import * as a1lib from "@alt1/base";

export class ClueReader {
    reader = new ClueScrollReader();

    async find(): Promise<ClueStep> {
        let img = a1lib.captureHoldFullRs();

        let match = await this.reader.find()

        if (match.intf.type == "scan") {
            return this.reader.scantextreader.read(img);
        }

        return null
    }
}