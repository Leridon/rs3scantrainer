import {Sliders} from "../trainer/ui/neosolving/puzzles/Sliders";
import {SlideReader} from "../trainer/ui/neosolving/cluereader/SliderReader";
import {ImageDetect, ImgRefData} from "@alt1/base";
import {time} from "../lib/gamemap/GameLayer";
import SliderState = Sliders.SliderState;
import SliderPuzzle = Sliders.SliderPuzzle;

export async function test_slide_reader(): Promise<boolean> {

  await SlideReader.getReferenceSliders()

  const data: {
    file: string, expected: {
      theme: string,
      state:
        SliderState
    }
  }[] = [
    {
      file: "test_assets/sliders/castle_scrambled.png", expected:
        {
          theme: "castle", state:
            [2, 20, 6, 0, 16,
              4, 21, 1, 3, 8,
              9, 5, 13, 7, 18,
              19, 10, 14, 22, 15,
              11, 17, 23, 12, 24
            ]
        }
    },
    {file: "test_assets/sliders/castle_solved.png", expected: {theme: "castle", state: SliderState.SOLVED}},
    {file: "test_assets/sliders/tree_solved.png", expected: {theme: "tree", state: SliderState.SOLVED}},
    {file: "test_assets/sliders/troll_solved.png", expected: {theme: "troll", state: SliderState.SOLVED}},
    {
      file: "test_assets/sliders/bridge_swapped.png", expected: {
        theme: "bridge", state:
          [0, 1, 2, 3, 4,
            5, 6, 7, 8, 9,
            10, 11, 12, 13, 14,
            15, 16, 21, 18, 19,
            17, 20, 22, 23, 24]
      }
    },
  ]

  let correct = 0

  for (let test_case of data) {
    const img = new ImgRefData(await ImageDetect.imageDataFromUrl(test_case.file))

    const res = await time("reading", async () =>
      await SlideReader.read(img,
        {x: 0, y: 0},
      )
    )

    const tiles = SliderPuzzle.getState(res)

    if (res.theme == test_case.expected.theme && SliderState.equals(tiles, test_case.expected.state)) {
      correct++
      console.log(`SUCCESS ${test_case.file}`)
    } else {
      console.log(`ERROR ${test_case.file}`)
      console.log(`Expected ${test_case.expected.theme}:`)
      console.log(SliderState.toString(test_case.expected.state))
      console.log(`Got ${res.theme}:`)
      console.log(SliderState.toString(tiles))
    }
  }

  return correct == data.length
}