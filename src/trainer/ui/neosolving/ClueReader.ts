import {Clues} from "../../../lib/runescape/clues";
import * as a1lib from "@alt1/base";
import {ImgRef} from "@alt1/base";
import {AnchorImages} from "./cluereader/AnchorImages";
import {Vector2} from "../../../lib/math";
import {deps} from "../../dependencies";
import {ModalUI, ModalUIReader} from "../../../skillbertssolver/cluesolver/modeluireader";
import {util} from "../../../lib/util/util";
import {coldiff} from "../../../skillbertssolver/oldlib";
import * as OCR from "@alt1/ocr";
import ClueFont from "./cluereader/ClueFont";
import * as oldlib from "../../../skillbertssolver/cluesolver/oldlib";
import {clue_data} from "../../../data/clues";
import stringSimilarity = util.stringSimilarity;

export class ClueReader {
  anchors: {
    slide: ImageData;
    slidelegacy: ImageData;
    legacyx: ImageData;
    eocx: ImageData;
    scanleveltext: ImageData;
    scanfartext: ImageData;
    scanfartext_pt: ImageData;
    compassnorth: ImageData;
  }

  constructor() {
    this.init()
  }

  async init() {
    this.anchors = await AnchorImages.getAnchorImages()
  }

  async read(img: ImgRef): Promise<ClueReader.Result> {
    const found_ui = await (async (): Promise<ClueReader.FoundUI> => {
      const ui_type_map: {
        type: ClueReader.UIType,
        anchors: ImageData[]
      }[] =
        [
          {type: "modal", anchors: [this.anchors.legacyx, this.anchors.eocx]},
          {type: "scan", anchors: [this.anchors.scanfartext, this.anchors.scanleveltext, this.anchors.scanfartext_pt]},
          {type: "slider", anchors: [this.anchors.slide, this.anchors.slidelegacy]},
          {type: "compass", anchors: [this.anchors.compassnorth]},
        ]

      for (let ui_type of ui_type_map) {
        for (let anchor of ui_type.anchors) {
          let locs = img.findSubimage(anchor)

          if (locs.length > 0) {
            return {
              type: ui_type.type,
              pos: locs[0]
            }
          }
        }
      }
    })()

    if (found_ui) {
      deps().app.notifications.notify({}, `Found '${found_ui.type} at ${Vector2.toString(found_ui.pos)}'`)
    } else {
      deps().app.notifications.notify({type: "error"}, `Nothing found'`)
    }

    if (found_ui) {
      switch (found_ui.type) {
        case "modal":

          let modal = ModalUIReader.detectEoc(img, found_ui.pos);

          const modal_type = ((): ClueReader.ModalType => {

            const modal_type_map: {
              type: ClueReader.ModalType,
              possible_titles: string[]
            }[] =
              [
                {
                  type: "textclue", possible_titles: [
                    "mysterious clue scroll", "treasure map",
                    "pergaminho de dicas mister", "mapa do tesouro",
                    "..:se hinweis-schriftp", ""
                  ]
                }, {
                type: "towers", possible_titles: [
                  "towers",
                  "torres",
                  ", ( rme"//t"urme
                ]
              }, {
                type: "lockbox", possible_titles: [
                  "lockbox",
                  "gica",//Caixa M`agica,
                  "schlie. .;fach"//schliessfach
                ]
              },
                {
                  type: "knot", possible_titles: [
                    "celtic knot",
                    "..: celta",//N~o celta
                    "keltischer knoten"
                  ]
                }
              ]

            let best: ClueReader.ModalType = null
            let best_score: number = Number.MAX_VALUE

            for (let type of modal_type_map) {
              for (let title of type.possible_titles) {
                const score = stringSimilarity(modal.title, title)

                if (score < best_score) {
                  best_score = score
                  best = type.type
                }
              }
            }

            return best
          })()


          if (modal_type) {
            deps().app.notifications.notify({},
              `Modal type ${modal_type}`)
          } else {
            deps().app.notifications.notify({type: "error"},
              `No modal type identified'`)
          }

          if (modal_type) {
            switch (modal_type) {
              case "textclue":

                const text = ClueReader.readTextClueModalText(modal)

                if (text.length > 0) {

                  let best: Clues.StepWithTextIndex = null
                  let best_score = Number.MAX_VALUE

                  for (let clue of clue_data.all) {

                    for(let text_index = 0; text_index < clue.text.length; text_index++) {

                      const score = stringSimilarity(clue.text[text_index], text)

                      if (score < best_score) {
                        best_score = score
                        best = {step: clue, text_index: text_index}
                      }
                    }
                  }

                  return {
                    step: best
                  }
                }

                deps().app.notifications.notify({},
                  text)
            }
          }
      }
    }
  }

  async readScreen(): Promise<ClueReader.Result> {
    return this.read(a1lib.captureHoldFullRs())
  }
}

export namespace ClueReader {
  export type UIType = "modal" | "scan" | "slider" | "compass"

  export type FoundUI = {
    type: UIType,
    pos: Vector2
  }

  export type ModalType = "towers" | "lockbox" | "textclue" | "knot"

  export type Result = {
    step?: Clues.StepWithTextIndex,
    compass?: {
      angle: number,
      arc?: boolean
    },
  }

  /**
   * Reads the text in the modal from a text clue.
   * Taken pretty much verbatim from skillberts solver.
   * @param modal The read modal
   */
  export function readTextClueModalText(modal: ModalUI): string {
    let buf = modal.img.toData(modal.rect.x, modal.rect.y, 496, 293);
    let lines: string[] = [];
    let linestart = 0;

    for (let y = 60; y < 290; y++) {
      let linescore = 0;
      let a: number = null

      for (let x = 220; x < 320; x++) {
        let i = 4 * x + 4 * buf.width * y;
        let a = coldiff(buf.data[i], buf.data[i + 1], buf.data[i + 2], 84, 72, 56);
        if (a < 80) { linescore++; }
      }

      if (linescore >= 3) {
        if (linestart == 0) {
          linestart = y;
        }
      } else if (linestart != 0) {
        a = Math.abs(linestart - y);
        linestart = 0;
        if (a >= 6 && a <= 18) {
          let b = OCR.findReadLine(buf, ClueFont, [[84, 72, 56]], 255, y - 4)
            || OCR.findReadLine(buf, ClueFont, [[84, 72, 56]], 265, y - 4);
          if (b) { lines.push(b.text); }
        }
      }
    }
    return lines.join(" ");
  }

  /**
   * Get the image of an image clue from the modal as tiled data.
   * Taken pretty much verbatim from skillberts solver.
   * @param modal The read modal
   */
  export function getImageClueImage(modal: ModalUI): number[] {
    let buf = modal.img.toData(modal.rect.x, modal.rect.y, 496, 293);

    return oldlib.tiledata(buf, 20, 20, 90, 25, 300, 240);
  }
}