import Define from "./define"
import { IPlainObject } from "./types"
import utils from "./utils"

const symbolData = Symbol('_data')
const symbolModel = Symbol('_model')

class Model {
    constructor(definedModel: Define, parsedData: IPlainObject) {
        if (!(definedModel instanceof Define)) {
            throw new TypeError('The Define Type Error.')
        }

        this[symbolModel] = definedModel
        this[symbolData] = utils.deepFreeze(parsedData)
        this.init()
    }

    private init() {
        this.getModel().getProperties().forEach((propertyName: string) => {
            Object.defineProperty(this, propertyName, {
                get: function() {
                    return utils.get(this.getData(), propertyName)
                },
            })
        })
        utils.deepFreeze(this)
    }

    private getModel() {
        return this[symbolModel]
    }

    private getData() {
        return this[symbolData]
    }

    public toObject(): IPlainObject {
        return utils.cloneDeep(this.getData())
    }

    public toJSONString(): string {
        return utils.toJson(this.getData()) || ''
    }

    public toJSONStringWithKeys(propertyNames: Array<string>): string {
        return utils.toJson(this.toObjectWithKeys(propertyNames)) || ''
    }

    public toObjectWithKeys(propertyNames: Array<string>): IPlainObject {
        const next: IPlainObject = {}
        const tmp: IPlainObject = this.toObject()
        if (!utils.isArray(propertyNames)) return next
        propertyNames.forEach((propertyName: string) => {
            if (!utils.isString(propertyName)) {
                throw new TypeError('The propertyName must be String.')
            }
            if (this.getModel().hasProperty(propertyName)) {
                next[propertyName] = utils.get(tmp, propertyName)
            }
        })
        return next
    }
}

export default Model