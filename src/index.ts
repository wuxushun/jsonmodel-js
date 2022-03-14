import Define from "./define"
import types, { ModelType } from "./types"

function ArrayOf(type: ModelType) {
    return [type]
}

export default {
    Define,
    Types: types,
    ArrayOf,

}