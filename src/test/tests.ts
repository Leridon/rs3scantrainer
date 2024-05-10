import {ScuffedTesting} from "./test_framework";
import {test_slide_reader} from "./test_slide_reader";
import {test_slider_move_attachment} from "./test_slider_moves";
import testset = ScuffedTesting.testset;
import {test_knot_solver} from "./test_knot_solver";

export const clue_trainer_test_set = testset("Cluetrainer",
  test_slide_reader,
  test_slider_move_attachment,
  test_knot_solver
)