import {SolvingMethods} from "./methods";

export type MethodPack = {
    id: number,
    author: String,
    description: String,
    methods: SolvingMethods.Method[]
}