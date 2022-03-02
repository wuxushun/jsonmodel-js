import Define from "./define"
import { IPlainObject } from "./types"
import utils from "./utils"

class Model {
    private readonly data: IPlainObject = {}
    private readonly model: Define

    constructor(definedModel: Define, parsedData: IPlainObject) {
        if (!(definedModel instanceof Define)) {
            throw new TypeError('The Define Type Error.')
        }

        this.model = definedModel
        this.data = parsedData
        this.init()
    }

    private init() {
        this.model.getProperties().forEach((propertyName: string) => {
            Object.defineProperty(this, propertyName, {
                get: function() {
                    return utils.get(this.data, propertyName)
                },
            })
        })
        Object.freeze(this)
    }

    public toObject(): IPlainObject {
        return this.data
    }

    public toJSONString(): string {
        return utils.toJson(this.data) || ''
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
            next[propertyName] = utils.get(this.data, propertyName)
        })
        return next
    }
}

export default Model