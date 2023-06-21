import Widget from "./Widget";

export default abstract class Button extends Widget<{
    "click": null
}> {
    protected constructor() {
        super();
    }
}