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
import {comparetiledata} from "../../../skillbertssolver/cluesolver/oldlib";
import {clue_data} from "../../../data/clues";
import {getdirection, isArcClue} from "../../../skillbertssolver/cluesolver/compassclue";
import stringSimilarity = util.stringSimilarity;
import ScanStep = Clues.ScanStep;

const CLUEREADERDEBUG = false

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
    const found_ui = await (async (): Promise<ClueReader.MatchedUI> => {
      const ui_type_map: {
        type: ClueReader.UIType,
        anchors: {
          img: ImageData,
          origin_offset: Vector2
        }[]
      }[] =
        [
          {
            type: "modal", anchors: [{
              img: this.anchors.legacyx,
              origin_offset: {x: 484, y: 21},
            }, {
              img: this.anchors.eocx,
              origin_offset: {x: 483, y: 17}
            }]
          },
          {
            type: "scan", anchors: [{
              img: this.anchors.scanfartext,
              origin_offset: {x: 0, y: -5 + 12 * 4}
            }, {
              img: this.anchors.scanfartext_pt,
              origin_offset: {x: 0, y: -5 + 12 * 4}
            }, {
              img: this.anchors.scanleveltext,
              origin_offset: {x: 0, y: -7 + 12 * 6}
            }]
          },
          {
            type: "slider", anchors: [{
              img: this.anchors.slide,
              origin_offset: {x: 484, y: 19},

            }, {
              img: this.anchors.slidelegacy,
              origin_offset: {x: 484, y: 19}
            }]
          },
          {
            type: "compass", anchors: [{
              img: this.anchors.compassnorth,
              origin_offset: {x: 56, y: 19}
            }]
          },
        ]

      for (let ui_type of ui_type_map) {
        for (let anchor of ui_type.anchors) {
          let locs = img.findSubimage(anchor.img)

          if (locs.length > 0) {
            return {
              type: ui_type.type,
              pos: locs[0],
              origin_offset: anchor.origin_offset
            }
          }
        }
      }
    })()


    if (CLUEREADERDEBUG) {
      if (found_ui) {
        deps().app.notifications.notify({}, `Found '${found_ui.type} at ${Vector2.toString(found_ui.pos)}'`)
      } else {
        deps().app.notifications.notify({type: "error"}, `Nothing found'`)
      }
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

          if (CLUEREADERDEBUG) {
            if (modal_type) {
              deps().app.notifications.notify({},
                `Modal type ${modal_type}`)
            } else {
              deps().app.notifications.notify({type: "error"},
                `No modal type identified'`)
            }
          }

          if (modal_type) {
            switch (modal_type) {
              case "textclue":
                const text = ClueReader.readTextClueModalText(modal)

                if (text.length > 0) {

                  let best: Clues.StepWithTextIndex = null
                  let best_score = Number.MAX_VALUE

                  for (let clue of clue_data.all) {

                    for (let text_index = 0; text_index < clue.text.length; text_index++) {

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
                } else {
                  const tiled_img = ClueReader.getImageClueImage(modal)

                  let best: Clues.Step = null
                  let best_score = Number.MAX_VALUE

                  for (let clue of clue_data.map) {
                    const score = comparetiledata(clue.ocr_data, tiled_img)

                    if (score < best_score) {
                      best_score = score
                      best = clue
                    }
                  }

                  return {
                    step: {step: best, text_index: 0}
                  }
                }
            }
          }

          break
        case "scan": {
          const scan_text_full = ClueReader.readScanPanelText(
            img, Vector2.sub(found_ui.pos, found_ui.origin_offset)
          )

          if (CLUEREADERDEBUG) deps().app.notifications.notify({},
            `Scan ${scan_text_full}`)

          const scan_text = scan_text_full.split("\n")[0]

          if (CLUEREADERDEBUG)
            deps().app.notifications.notify({},
              `Scan ${scan_text}`)

          let bestscore = Number.MAX_VALUE;
          let best: ScanStep | null = null;

          for (let clue of clue_data.scan) {
            let score = stringSimilarity(scan_text, clue.scantext);
            if (score < bestscore) {
              best = clue;
              bestscore = score;
            }
          }

          return {step: {step: best, text_index: 0}}
        }
        case "compass": {
          const compass_state = ClueReader.readCompassState(img, Vector2.add(found_ui.pos, {x: -53, y: 54}))

          if (CLUEREADERDEBUG)
            deps().app.notifications.notify({},
              `Compass ${JSON.stringify(compass_state)}`)

          if (compass_state.isArc) return {step: {step: clue_data.arc_compass, text_index: 0}}
          else return {step: {step: clue_data.gielinor_compass, text_index: 0}}
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

  export type MatchedUI = {
    type: UIType,
    pos: Vector2,
    origin_offset: Vector2
  }

  export type ModalType = "towers" | "lockbox" | "textclue" | "knot"

  export type Result = {
    step?: Clues.StepWithTextIndex,
  }

  /**
   * Reads the text in the modal from a text clue.
   * Taken pretty much verbatim from skillbert's solver.
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
   * Taken pretty much verbatim from skillbert's solver.
   * @param modal The read modal
   */
  export function getImageClueImage(modal: ModalUI): number[] {
    let buf = modal.img.toData(modal.rect.x, modal.rect.y, 496, 293);

    return oldlib.tiledata(buf, 20, 20, 90, 25, 300, 240);
  }

  export function readScanPanelText(img: ImgRef, pos: Vector2) {
    const font = require("@alt1/ocr/fonts/aa_8px_new.js");
    const lineheight = 12;
    const capty = pos.y;
    let data = img.toData(pos.x - 20, capty, 180, 190);

    let lines: string[] = [];
    for (let lineindex = 0; lineindex < 13; lineindex++) {
      const y = pos.y - capty + lineindex * lineheight;
      const line = OCR.findReadLine(data, font, [[255, 255, 255]], 70, y, 40, 1);
      lines.push(line.text);
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

    return text
  }

  export type CompassState = {
    angle: number,
    isArc: boolean
  }

  export function readCompassState(img: ImgRef, pos: Vector2): CompassState {
    let data = img.toData(pos.x, pos.y, 130, 170);
    let dir = getdirection(data);

    if (dir == null) { return null; }

    let isArc = isArcClue(data);
    return {angle: dir, isArc: isArc};
  }
}