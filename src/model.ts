import Define from "./define"
import { IPlainObject } from "./types"
import utils from "./utils"

class Model {
    private readonly __data: IPlainObject = {}
    private readonly __model: Define

    constructor(definedModel: Define, parsedData: IPlainObject) {
        if (!(definedModel instanceof Define)) {
            throw new TypeError('The Define Type Error.')
        }

        this.__model = definedModel
        this.__data = utils.deepFreeze(parsedData)
        this.init()
    }

    private init() {
        this.__model.getProperties().forEach((propertyName: string) => {
            Object.defineProperty(this, propertyName, {
                get: function() {
                    return utils.get(this.__data, propertyName)
                },
            })
        })
        utils.deepFreeze(this)
    }

    public toObject(): IPlainObject {
        return this.__data
    }

    public toJSONString(): string {
        return utils.toJson(this.__data) || ''
    }

    public toJSONStringWithKeys(propertyNames: Array<string>): string {
        return utils.toJson(this.toObjectWithKeys(propertyNames)) || ''
    }

    public toObjectWithKeys(propertyNames: Array<string>): IPlainObject {
        const next: IPlainObject = {}
        if (!utils.isArray(propertyNames)) return next
        propertyNames.forEach((propertyName: string) => {
            if (!utils.isString(propertyName)) {
                throw new TypeError('The propertyName must be String.')
            }
            if (this.__model.hasProperty(propertyName)) {
                next[propertyName] = utils.get(this.__data, propertyName)
            }
        })
        return next
    }
}

export default Model