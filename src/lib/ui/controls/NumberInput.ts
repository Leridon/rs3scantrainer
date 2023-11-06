import AbstractEditWidget from "../../../trainer/ui/widgets/AbstractEditWidget";

export default class NumberInput extends AbstractEditWidget<number> {

    constructor(private min: number,
                private max: number) {
        super($(`<input type='number' class='nisinput' min='${min}' max="${max}">`));

        this.container
            .on("input", () => {
                this.changed(Number(this.container.val()))
            })

    }


    protected render() {
        this.container.val(this.value)
    }
}