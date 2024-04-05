import {Clues} from "../../../../lib/runescape/clues";
import * as a1lib from "@alt1/base";
import {ImgRef} from "@alt1/base";
import {AnchorImages} from "./AnchorImages";
import {Rectangle, Vector2} from "../../../../lib/math";
import {deps} from "../../../dependencies";
import {ModalUI, ModalUIReader} from "../../../../skillbertssolver/cluesolver/modeluireader";
import {util} from "../../../../lib/util/util";
import {coldiff} from "../../../../skillbertssolver/oldlib";
import * as OCR from "@alt1/ocr";
import ClueFont from "./ClueFont";
import * as oldlib from "../../../../skillbertssolver/cluesolver/oldlib";
import {comparetiledata} from "../../../../skillbertssolver/cluesolver/oldlib";
import {clue_data} from "../../../../data/clues";
import {getdirection, isArcClue} from "../../../../skillbertssolver/cluesolver/compassclue";
import {SlideReader} from "./SliderReader";
import {Sliders} from "../puzzles/Sliders";
import stringSimilarity = util.stringSimilarity;
import ScanStep = Clues.ScanStep;

const CLUEREADERDEBUG = true

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
              origin_offset: {x: 297, y: -15},
            }, {
              img: this.anchors.slidelegacy,
              origin_offset: {x: 297, y: -15}
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
            switch (ui_type.type) {
              case "modal":
                const modal = ModalUIReader.detectEoc(img, locs[0]);

                return {
                  type: "modal",
                  rect: Rectangle.fromRectLike(modal.rect),
                  modal: modal,
                }
                break;
              case "scan":

                return {
                  type: "scan",
                  rect: Rectangle.fromOriginAndSize(locs[0], {x: 1, y: 1})
                }
              case "slider":
                return {
                  type: "slider",
                  rect: Rectangle.fromOriginAndSize(
                    Vector2.sub(locs[0], anchor.origin_offset),
                    {x: 273, y: 273}
                  )
                }
              case "compass":
                return {
                  type: "compass",
                  rect: Rectangle.fromOriginAndSize(locs[0], {x: 1, y: 1})
                }
            }
          }
        }
      }
    })()

    if (CLUEREADERDEBUG) {
      if (found_ui) {
        deps().app.notifications.notify({}, `Found '${found_ui.type} at ${Vector2.toString(found_ui.rect.topleft)}'`)
      } else {
        deps().app.notifications.notify({type: "error"}, `Nothing found'`)
      }
    }

    if (found_ui) {

      if (CLUEREADERDEBUG) {
        console.log(found_ui)

        alt1.overLayRect(a1lib.mixColor(255, 0, 0, 255),
          found_ui.rect.topleft.x,
          found_ui.rect.botright.y,
          Rectangle.width(found_ui.rect),
          Rectangle.height(found_ui.rect),
          5000,
          1
        )

        alt1.overLayText(
          found_ui.type,
          a1lib.mixColor(255, 0, 0, 255),
          10,
          found_ui.rect.topleft.x,
          found_ui.rect.botright.y,
          5000)
      }

      switch (found_ui.type) {
        case "modal":

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
            let best_score: number = 0

            for (let type of modal_type_map) {
              for (let title of type.possible_titles) {
                const score = stringSimilarity(found_ui.modal.title, title)

                if (score > best_score) {
                  best_score = score
                  best = type.type
                }
              }
            }

            // Minimum score to avoid unrelated modals to be matched as something
            if (best_score < 0.7) return null

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
                const text = ClueReader.readTextClueModalText(found_ui.modal)

                console.log(text)

                if (text.length >= 10) {
                  let best: Clues.StepWithTextIndex = null
                  let best_score = 0

                  for (let clue of clue_data.all) {

                    for (let text_index = 0; text_index < clue.text.length; text_index++) {

                      const score = stringSimilarity(text, clue.text[text_index])

                      if (score > best_score) {
                        best_score = score
                        best = {step: clue, text_index: text_index}
                      }
                    }
                  }

                  if (best_score < 0.7) return null

                  return {
                    found_ui: found_ui,
                    step: best
                  }
                } else {
                  const tiled_img = ClueReader.getImageClueImage(found_ui.modal)

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
                    found_ui: found_ui,
                    step: {step: best, text_index: 0}
                  }
                }
            }
          }

          break
        case "scan": {
          const scan_text_full = ClueReader.readScanPanelText(
            img, found_ui.rect.topleft
          )

          if (CLUEREADERDEBUG) deps().app.notifications.notify({},
            `Scan ${scan_text_full}`)

          const scan_text = scan_text_full.split("\n")[0]

          if (CLUEREADERDEBUG)
            deps().app.notifications.notify({},
              `Scan ${scan_text}`)

          let bestscore = 0;
          let best: ScanStep | null = null;

          for (let clue of clue_data.scan) {
            let score = stringSimilarity(scan_text, clue.scantext);
            if (score > bestscore) {
              best = clue;
              bestscore = score;
            }
          }

          return {found_ui: found_ui, step: {step: best, text_index: 0}}
        }
        case "slider":
          const res = await SlideReader.read(
            img,
            Rectangle.bottomLeft(found_ui.rect),
          )

          res.tiles.forEach((tile, i) => {
            const pos = Vector2.add(
              Rectangle.screenOrigin(found_ui.rect),
              {x: Math.floor(i % 5) * 56, y: Math.floor(i / 5) * 56}
            )

            alt1.overLayText(`${res.theme}\n${tile.position}`,
              a1lib.mixColor(0, 255, 0),
              10,
              pos.x,
              pos.y,
              5000
            )
          })

          deps().app.notifications.notify({}, `Found theme ${res.theme}`)

          return {
            found_ui: found_ui,
            slider: res
          }
        case "compass": {
          const compass_state = ClueReader.readCompassState(img, Vector2.add(found_ui.rect.topleft, {x: -53, y: 54}))

          if (CLUEREADERDEBUG)
            deps().app.notifications.notify({},
              `Compass ${JSON.stringify(compass_state)}`)

          if (compass_state.isArc) return {found_ui: found_ui, step: {step: clue_data.arc_compass, text_index: 0}}
          else return {found_ui: found_ui, step: {step: clue_data.gielinor_compass, text_index: 0}}
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
    rect: Rectangle
  } & ({
    type: "slider"
  } | {
    type: "modal",
    modal: ModalUI
  }
    | { type: "scan" }
    | { type: "compass" }
    )

  export type ModalType = "towers" | "lockbox" | "textclue" | "knot"

  export type Result = {
    found_ui: MatchedUI,
    step?: Clues.StepWithTextIndex,
    slider?: Sliders.SliderPuzzle
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

    return oldlib.computeImageFingerprint(buf, 20, 20, 90, 25, 300, 240);
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