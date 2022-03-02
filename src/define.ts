

import { IModelConfig, Models, IPlainObject, ModelRecordType, IModel } from './types'
import Model from './model'
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
        const modelOptional = model.optional || false
        const modelIgnoreNull = model.ignoreNull || false
        const _formatter = utils.get(model, 'format', (_next: any) => _next)
        const _getValue = (defaultValue: any) => {
            const nextValue = this.getValue(data, model, property, undefined)
            if (![undefined, null].includes(nextValue)) {
                if (typeof _formatter === 'function') {
                    return _formatter(nextValue) || nextValue
                }
                return nextValue
            }
            if (modelOptional) return undefined
            if (modelIgnoreNull) return null
            return defaultValue
        }
        let modelType: ModelRecordType = model.type
        if (Array.isArray(modelType) && modelType.length === 1) {
            modelType = modelType[0]
        }
        if (modelType === 'Boolean') {
            const defaultValue = model.default || false
            const value = _getValue(defaultValue)
            if(!utils.isBoolean(value)) return defaultValue
            return _formatter(value)
        } else if (modelType === 'String') {
            const defaultValue = model.default || ''
            const value = _getValue(defaultValue)
            if(!utils.isString(value)) {
                if (utils.isNumber(value)) return String(value)
                if (utils.isPlainObject(value)) return utils.toJson(value) || ''
                return defaultValue
            }
            return value
        } else if (modelType === 'Number') {
            const defaultValue = model.default || 0
            const value = _getValue(defaultValue)
            if(!utils.isNumber(Number(value))) return defaultValue
            return value
        } else if (modelType === 'DateString') {
            const defaultValue = model.default || '1970-01-01 08:00:00'
            const value = _getValue(defaultValue)
            if(!utils.isDateString(value)) return defaultValue
            return value
        } else if (modelType === 'Timestamp') {
            const defaultValue = model.default || 0
            const value = _getValue(defaultValue)
            if(!utils.isInteger(Number(value))) return defaultValue
            return value
        } else {
            return undefined
        }
    }

    private parseObject(data: IPlainObject) {
        const nextData: IPlainObject = {}
        if (!utils.isObject(data)) return nextData

        const properties = this.getProperties()
        properties.forEach((property: string) => {
            const modelRecord: IModel = this.model[property] as IModel
            const modelType: ModelRecordType = modelRecord.type

            if ((['Boolean', 'String', 'Number', 'DateString', 'Timestamp'] as Array<ModelRecordType>).includes(modelType)) {
                const value = this.valueHandler(data, modelRecord, property)
                nextData[property] = value
            }  else if (Array.isArray(modelType) && modelType.length === 1) {
                const values: Array<any> = this.getValue(data, modelRecord, property, [])
                if (!Array.isArray(values)) { 
                    utils.logger(property, ' type is Array, but get different value.')
                    nextData[property] = []
                    return
                }
                const nextValue: any[] = []
                const arrModel: Define = modelType[0] as Define
                values.forEach((sub) => {
                    const next = arrModel.parseObject(sub).toObject()
                    if (next !== undefined) nextValue.push(next)
                })
                nextData[property] = nextValue
            } else if (modelRecord.type instanceof Define) {
                const value: any = this.getValue(data, modelRecord, property, [])
                const jsonmodel = modelRecord.type.parseObject(value).toObject()
                nextData[property] = jsonmodel
            } else {
                utils.logger(property, ' may not be a valid type.')
            }
        })
        return new Model(this, nextData);
    }

    private verifyType(type: any): boolean {
        if (Array.isArray(type) && type.length === 1) {
            return this.verifyType(type[0])
        } else if (['Boolean', 'String', 'Number', 'DateString', 'Timestamp'].includes(type) || type instanceof Define) {
            return true
        }
        return false
    }

    private verifyModel(data: any): Models {
        const nextData: IPlainObject = {}
        if (!utils.isPlainObject(data)) return nextData
    
        Object.keys(data).forEach((propertyName: string) => {
            const property = data[propertyName]
            if (!property) return
    
            if (this.verifyType(property)) {
                nextData[propertyName] = {
                    type: property,
                }
            } else if (utils.isObject(property)) {
                const keys = Object.keys(property);
                const isNotSettingKeys = keys.some((item: string) => ['type', 'default', 'optional', 'ignoreNull', 'keyMapper', 'format'].indexOf(item) == -1);
                if (!isNotSettingKeys) {
                    nextData[propertyName] = property
                }
            }
        })
        return utils.deepFreeze(nextData) as Models
    }
}

export default Define