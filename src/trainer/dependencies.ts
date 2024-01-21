import {Observable, observe} from "../lib/reactive";
import {type Application} from "./application";

export default class Dependencies {
    app: Observable<Application> = observe(null)
    //template_resolver: Observable<TemplateResolver> = observe(null)

    private static _instance: Dependencies = null

    static instance(): Dependencies {
        if (!Dependencies._instance) Dependencies._instance = new Dependencies()

        return Dependencies._instance
    }
}