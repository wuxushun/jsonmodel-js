

import { IModelConfig, Models, IPlainObject, ModelRecordType, IModel } from './types'
import utils from './utils'

const defaultConfig: IModelConfig = {
    ignoreNull: false,
}

class Define {

    private readonly config: IModelConfig = {}
    private readonly model: Models = {}

    constructor(model: Models, config: Partial<IModelConfig> = {}) {
        if (!utils.isPlainObject(model)) {
            throw new TypeError('The model must be an Object.')
        }

        this.model = this.verifyModel(model)
        this.config = {
            ...defaultConfig,
            ...config,
        }
    }

    public modelFromString(jsonstring: string): IPlainObject {
        if (!utils.isJson(jsonstring)) return {}
        const object = JSON.parse(jsonstring)
        return this.modelFromObject(object)
    }

    public modelFromObject(object: IPlainObject): IPlainObject {
        return this.parseObject(object)
    }

    public arrayOfModelsFromString(jsonstring: string): Array<IPlainObject> {
        if (!utils.isJson(jsonstring)) return []
        const array = JSON.parse(jsonstring)
        return this.arrayOfModelsFromObject(array)
    }

    public arrayOfModelsFromObject(array: Array<IPlainObject>): Array<IPlainObject> {
        return array.map(sub => this.parseObject(sub))
    }

    public getProperties(): Array<string> {
        if (!utils.isObject(this.model)) return []
        return Object.keys(this.model)
    }

    private getValue(data: any, model: IModel, property: string, defaultValue: any) {
        return utils.get(data, (model.keyMapper || property) as any, defaultValue)
    }

    private valueHandler(data: any, model: IModel, property: string) {
        let modelType: ModelRecordType = model.type
        if (Array.isArray(modelType) && modelType.length === 1) {
            modelType = modelType[0]
        }
        if (modelType === 'Boolean') {
            const defaultValue = false
            const value = this.getValue(data, model, property, defaultValue)
            if(!utils.isBoolean(value)) return defaultValue
            return value
        } else if (modelType === 'String') {
            const defaultValue = ''
            const value = this.getValue(data, model, property, defaultValue)
            if(!utils.isString(value)) {
                if (utils.isNumber(value)) return String(value)
                if (utils.isPlainObject(value)) return utils.toJson(value) || ''
                return defaultValue
            }
            return value
        } else if (modelType === 'Number') {
            const defaultValue = 0
            const value = this.getValue(data, model, property, defaultValue)
            if(!utils.isNumber(Number(value))) return defaultValue
            return value
        } else if (modelType === 'DateString') {
            const defaultValue = '1970-01-01 08:00:00'
            const value = this.getValue(data, model, property, defaultValue)
            if(!utils.isDateString(value)) return defaultValue
            return value
        } else if (modelType === 'Timestamp') {
            const defaultValue = 0
            const value = this.getValue(data, model, property, defaultValue)
            if(!utils.isInteger(Number(value))) return defaultValue
            return value
        } else {
            return undefined
        }
    }

    private parseObject(data: IPlainObject) {
        const nextData: IPlainObject = {}
        if (!utils.isObject(data)) return nextData

        const properties = Object.keys(data)
        properties.forEach((property: string) => {
            const modelRecord: IModel = this.model[property] as IModel
            const modelType: ModelRecordType = modelRecord.type
            const modelOptional = modelRecord.optional || false
            const modelIgnoreNull = modelRecord.ignoreNull || false
            const _formatter = utils.get(modelRecord, 'format')
            const _setValue = (value: any) => {
                if (![undefined, null].includes(value)) {
                    if (typeof _formatter === 'function') {
                        nextData[property] = _formatter(value) || value
                    } else {
                        nextData[property] = value
                    }
                    return
                }
                if (modelOptional) return
                if (modelIgnoreNull) nextData[property] = null

            }

            if ((['Boolean', 'String', 'DateString', 'Timestamp'] as Array<ModelRecordType>).includes(modelType)) {
                const value = this.valueHandler(data, modelRecord, property)
                if (value === undefined) {
                    utils.logger(property, ' may not be a valid type.')
                    return
                }
                _setValue(value)
            }  else if (Array.isArray(modelType) && modelType.length === 1) {
                const values: Array<any> = this.getValue(data, modelRecord, property, [])
                if (!Array.isArray(values)) { 
                    utils.logger(property, ' type is Array, but get different value.')
                    _setValue([])
                    return
                }
                const nextValue: any[] = []
                const arrModel: Define = modelType[0] as Define
                values.forEach((sub) => {
                    const next = arrModel.parseObject(sub)
                    if (next !== undefined) nextValue.push(next)
                })
                _setValue(nextValue)
            } else if (modelRecord.type instanceof Define) {
                const value: any = this.getValue(data, modelRecord, property, [])
                const jsonmodel = modelRecord.type.parseObject(value)
                _setValue(jsonmodel)
            } else {
                utils.logger(property, ' may not be a valid type.')
            }
        })
    }

    private verifyModel(data: any): Models {
        const nextData: IPlainObject = {}
        if (!utils.isPlainObject(data)) return nextData
    
        Object.keys(data).forEach((propertyName: string) => {
            const property = data[propertyName]
            if (!property) return
    
            if ([Boolean, String, Number, Define].includes(property)) {
                nextData[propertyName] = {
                    type: property,
                }
            } else if (utils.isObject(property)) {
                const keys = Object.keys(property);
                const isNotSettingKeys = keys.some((item: string) => ['type', 'default', 'optional', 'ignoreNull'].indexOf(item) == -1);
                if (!isNotSettingKeys) {
                    nextData[propertyName] = property
                }
            }
        })
        return utils.deepFreeze(nextData) as Models
    }
}

export default Define