import AbstractEditWidget from "../../../trainer/ui/widgets/AbstractEditWidget";
import Widget from "../Widget";

export default class NumberSlider extends AbstractEditWidget<number> {
  private input: Widget
  private preview_container: Widget

  constructor(private min: number,
              private max: number,
              private step: number = 1) {
    super();

    this.css("display", "flex")

    this.append(
      this.input = c(`<input style="flex-grow: 1" type='range' min='${min}' max="${max}" step="${step}">`)
        .on("input", () => {
          this.commit(Number(this.input.container.val()))
          this.preview_container.text(this.get())
        }),
      this.preview_container = c().css("min-width", "30px").css("margin-left", "3px")
    )
  }

  protected render() {
    this.preview_container.text(this.get())
    this.input.container.val(this.get())
  }
}