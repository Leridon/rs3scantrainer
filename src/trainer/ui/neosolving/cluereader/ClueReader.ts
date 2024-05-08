import {Clues} from "../../../../lib/runescape/clues";
import * as a1lib from "@alt1/base";
import {captureHoldFullRs, ImgRef} from "@alt1/base";
import {AnchorImages} from "./AnchorImages";
import {Rectangle, Vector2} from "../../../../lib/math";
import {ModalUI} from "../../../../skillbertssolver/cluesolver/modeluireader";
import {util} from "../../../../lib/util/util";
import {coldiff} from "../../../../skillbertssolver/oldlib";
import * as OCR from "@alt1/ocr";
import ClueFont from "./ClueFont";
import * as oldlib from "../../../../skillbertssolver/cluesolver/oldlib";
import {comparetiledata} from "../../../../skillbertssolver/cluesolver/oldlib";
import {clue_data} from "../../../../data/clues";
import {SlideReader} from "./SliderReader";
import {Notification} from "../../NotificationBar";
import {CompassReader} from "./CompassReader";
import {KnotReader} from "./KnotReader";
import {CapturedImage, CapturedModal} from "../../../../lib/alt1/ImageCapture";
import {OverlayGeometry} from "../../../../lib/alt1/OverlayGeometry";
import {Sliders} from "../puzzles/Sliders";
import stringSimilarity = util.stringSimilarity;
import ScanStep = Clues.ScanStep;
import notification = Notification.notification;
import findBestMatch = util.findBestMatch;

const CLUEREADERDEBUG = false
const CLUEREADERDEBUG_READ_SCREEN_INSTEAD_OF_RS = false // This is broken

let CLUEREADER_DEBUG_OVERLAY: OverlayGeometry = null

export class ClueReader {

  private initialized: Promise<void>

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
    this.initialized = this.init()
  }

  async init() {
    this.anchors = await AnchorImages.getAnchorImages()
    console.log("Initialized anchors")
  }

  async read(img: ImgRef): Promise<ClueReader.Result> {
    await this.initialized

    if (CLUEREADERDEBUG) {
      if (!CLUEREADER_DEBUG_OVERLAY) CLUEREADER_DEBUG_OVERLAY = new OverlayGeometry().withTime(5000)

      CLUEREADER_DEBUG_OVERLAY.clear()
    }

    const modal = await CapturedModal.findIn(new CapturedImage(img))

    if (modal) {
      if (CLUEREADERDEBUG) {
        CLUEREADER_DEBUG_OVERLAY.rect(Rectangle.fromOriginAndSize(modal.body.screenRectangle().origin, modal.body.screenRectangle().size), {
          width: 1,
          color: a1lib.mixColor(255, 0, 0, 255)
        }).render()
      }

      const modal_type = (() => {
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

        const title = modal.title().toLowerCase()

        const best = findBestMatch(modal_type_map.map(
          m => ({value: m, score: findBestMatch(m.possible_titles, possible_title => stringSimilarity(title, possible_title)).score})
        ), m => m.score).value

        // Minimum score to avoid unrelated modals to be matched as something
        if (best.score < 0.7) return null

        return best.value.type
      })()

      if (modal_type) {
        switch (modal_type) {
          case "textclue":
            const text = ClueReader.readTextClueModalText(modal)

            if (text.length >= 10) {
              const best = findBestMatch(
                clue_data.all.flatMap<Clues.StepWithTextIndex>(c => c.text.map((text, text_index) => {
                  return {step: c, text_index: text_index}
                })),
                ({step, text_index}) => {
                  let reference_text = step.text[text_index]

                  if (step.type == "skilling") {
                    reference_text = `Complete the action to solve the clue: ${reference_text}`
                  }

                  return stringSimilarity(text, reference_text)
                }
              )

              if (best.score < 0.7) return null

              return {
                type: "textclue",
                modal: modal,
                step: best.value
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
                type: "textclue",
                modal: modal,
                step: {step: best, text_index: 0}
              }
            }
          case "knot":
            const reader = new KnotReader.KnotReader(modal)

            if (await reader.getPuzzle()) {
              return {
                type: "puzzle",
                puzzle: {
                  type: "knot",
                  reader: reader,
                },
              }
            } else {
              return null
            }


        }
      }

    }

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
            type: "scan", anchors: [{
              img: this.anchors.scanfartext,
              origin_offset: {x: 20, y: -5 + 12 * 4}
            }, {
              img: this.anchors.scanfartext_pt,
              origin_offset: {x: 20, y: -5 + 12 * 4}
            }, {
              img: this.anchors.scanleveltext,
              origin_offset: {x: 20, y: -7 + 12 * 6}
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
              origin_offset: {x: 78, y: 20},
            }]
          },
        ]

      for (let ui_type of ui_type_map) {
        for (let anchor of ui_type.anchors) {
          let locs = img.findSubimage(anchor.img)

          if (locs.length > 0) {
            switch (ui_type.type) {
              case "scan":
                return {
                  type: "scan",
                  image: img,
                  rect: Rectangle.fromOriginAndSize(Vector2.sub(locs[0], anchor.origin_offset), {x: 180, y: 190})
                }
              case "slider":
                return {
                  type: "slider",
                  image: img,
                  rect: Rectangle.fromOriginAndSize(
                    Vector2.sub(locs[0], anchor.origin_offset),
                    {x: 273, y: 273}
                  )
                }
              case "compass":
                return {
                  type: "compass",
                  image: img,
                  rect: Rectangle.fromOriginAndSize(Vector2.sub(locs[0], anchor.origin_offset), CompassReader.UI_SIZE)
                }
            }
          }
        }
      }
    })()

    if (found_ui) {

      if (CLUEREADERDEBUG) {
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
        /*case "modal":
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
              notification(`Modal type ${modal_type}`).show()
            } else {
              notification(`No modal type identified'`).show()
            }
          }

          if (modal_type) {
            switch (modal_type) {
              case "textclue":
                const text = ClueReader.readTextClueModalText(found_ui.modal)

                if (text.length >= 10) {
                  let best: Clues.StepWithTextIndex = null
                  let best_score = 0

                  for (let clue of clue_data.all) {

                    for (let text_index = 0; text_index < clue.text.length; text_index++) {

                      let reference_text = clue.text[text_index]

                      if (clue.type == "skilling") {
                        reference_text = `Complete the action to solve the clue: ${reference_text}`
                      }

                      const score = stringSimilarity(text, reference_text)

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
              case "knot":

                return {
                  found_ui: found_ui,
                  knot: await KnotReader.read(found_ui)
                }
            }
          }

          break*/
        case "scan": {
          const scan_text_full = ClueReader.readScanPanelText(
            img, Rectangle.screenOrigin(found_ui.rect)
          )

          if (CLUEREADERDEBUG) notification(`Scan ${scan_text_full}`).show()

          const scan_text = scan_text_full.split("\n")[0]

          if (CLUEREADERDEBUG)
            notification(`Scan ${scan_text}`).show()

          let bestscore = 0;
          let best: ScanStep | null = null;

          for (let clue of clue_data.scan) {
            let score = stringSimilarity(scan_text, clue.scantext);

            if (score > bestscore) {
              best = clue;
              bestscore = score;
            }
          }

          return {type: "scan", step: best}
        }
        case "slider":
          const res = await SlideReader.read(
            img,
            Rectangle.bottomLeft(found_ui.rect),
          )

          if (CLUEREADERDEBUG) {
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

            notification(`Found theme ${res.theme}`).show()
          }

          if (res.match_score >= SlideReader.DETECTION_THRESHOLD_SCORE) {
            return {
              type: "legacy",
              found_ui: found_ui,
              puzzle: {type: "slider", ui: found_ui, puzzle: res},
            }
          } else {
            return {
              type: "legacy",
              found_ui: found_ui,
              puzzle: null,
            }
          }
        case "compass": {
          const compass_state = CompassReader.readCompassState(found_ui)

          if (compass_state?.type != "success") {
            return null
          }

          if (CLUEREADERDEBUG)
            notification(`Compass ${JSON.stringify(compass_state)}`).show()

          if (compass_state.state.isArc) return {
            type: "legacy", found_ui: found_ui, step: {step: clue_data.arc_compass, text_index: 0}
          }
          else return {
            type: "legacy", found_ui: found_ui, step: {step: clue_data.gielinor_compass, text_index: 0}
          }
        }
      }
    }
  }

  async readScreen(): Promise<ClueReader.Result> {
    const img = CLUEREADERDEBUG_READ_SCREEN_INSTEAD_OF_RS
      ? a1lib.captureHoldScreen(alt1.rsX, alt1.rsY, alt1.rsWidth, alt1.rsHeight) as ImgRef
      : captureHoldFullRs()

    return this.read(img)
  }
}

export namespace ClueReader {
  export type UIType = "modal" | "scan" | "slider" | "compass"

  export type MatchedUI =
    MatchedUI.Slider | MatchedUI.Modal | MatchedUI.Scan | MatchedUI.Compass

  export namespace MatchedUI {
    export type Type = "modal" | "scan" | "slider" | "compass"

    export type base = {
      type: Type,
      image: ImgRef,
      rect: Rectangle
    }

    export type Slider = base & {
      type: "slider"
    }

    export type Scan = base & { type: "scan" }
    export type Compass = base & { type: "compass" }
    export type Modal = base & {
      type: "modal",
      modal: ModalUI
    }
  }

  export type ModalType = "towers" | "lockbox" | "textclue" | "knot"

  export namespace Result {
    export type Kind = "textclue" | "legacy" | "scan" | "compass" | "puzzle"

    export namespace Puzzle {
      export type Type = "slider" | "knot" | "tower" | "lockbox"

      import SliderPuzzle = Sliders.SliderPuzzle;
      type puzzle_base = {
        type: Type
      }

      export type Slider = puzzle_base & {
        type: "slider",
        ui: MatchedUI.Slider
        puzzle: SliderPuzzle
      }

      export type Knot = puzzle_base & {
        type: "knot",
        reader: KnotReader.KnotReader,
      }

      export type Puzzle = Slider | Knot
    }

    type base = { type: Kind }

    export type TextClue = base & {
      type: "textclue",
      modal: CapturedModal,
      step: Clues.StepWithTextIndex,
    }

    export type ScanClue = base & {
      type: "scan",
      step: Clues.Scan,
    }

    export type CompassClue = base & {
      type: "compass",
      step: Clues.Compass,
    }

    export type Puzzle = base & {
      type: "puzzle",
      puzzle: Puzzle.Puzzle,
    }

    export type Legacy = base & {
      type: "legacy",
      found_ui: MatchedUI,
      puzzle?: Puzzle.Puzzle,
      knot?: KnotReader.Result,
      step?: Clues.StepWithTextIndex,
    }
  }

  export type Result = Result.TextClue | Result.Legacy | Result.ScanClue | Result.CompassClue | Result.Puzzle


  /**
   * Reads the text in the modal from a text clue.
   * Taken pretty much verbatim from skillbert's solver.
   * @param modal The read modal
   */
  export function readTextClueModalText(modal: CapturedModal): string {

    modal.body.getData()

    let buf = modal.body.getData()
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
  export function getImageClueImage(modal: CapturedModal): number[] {
    let buf = modal.body.getData();

    return oldlib.computeImageFingerprint(buf, 20, 20, 90, 25, 300, 240);
  }

  export function readScanPanelText(img: ImgRef, pos: Vector2) {
    const font = require("@alt1/ocr/fonts/aa_8px_new.js");
    const lineheight = 12;
    let data = img.toData(pos.x, pos.y, 180, 190);

    let lines: string[] = [];
    for (let lineindex = 0; lineindex < 13; lineindex++) {
      const y = lineindex * lineheight;
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
}