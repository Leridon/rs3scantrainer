import * as lodash from "lodash";
import {Sliders} from "../lib/cluetheory/Sliders";
import {ScuffedTesting} from "./test_framework";
import assert = ScuffedTesting.assert;

export async function test_slider_move_attachment(): Promise<void> {
  const test_cases: {
    existing: Sliders.MoveList,
    attachment: Sliders.MoveList,
    expected_result: Sliders.MoveList
  }[] = [
    {existing: [-2, -10], attachment: [-5, 2], expected_result: [-2, -15, 2]},
    {existing: [1, 5, 1], attachment: [-1, 5], expected_result: [1, 10]}
  ]

  let success = true

  for (const test_case of test_cases) {
    const combined = Sliders.MoveList.combine(test_case.existing, test_case.attachment, true)

    if (!lodash.isEqual(combined, test_case.expected_result)) {
      console.log(`Expected ${test_case.expected_result.join(",")}`)
      console.log(`Got ${combined.join(",")}`)

      success = false
    }
  }

  assert(success)
}