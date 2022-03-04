

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
        if (!utils.isJson(jsonstring)) return this.modelFromObject({})
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

    public hasProperty(propertyName: string): boolean {
        return this.getProperties().includes(propertyName)
    }

    private getValue(data: any, model: IModel, property: string, defaultValue?: any) {
        return utils.get(data, (model.keyMapper || property) as any, defaultValue)
    }

    private valueHandler(data: any, model: IModel, property: string) {
        const modelType: ModelRecordType = model.type
        const modelOptional = model.optional || false
        const modelIgnoreNull = model.ignoreNull || false
        const nextValue = this.getValue(data, model, property, undefined)
        if ([undefined, null].includes(nextValue)) {
            if (modelIgnoreNull) return null
            if (modelOptional) return undefined
        }

        if (utils.isArray(modelType) && modelType.length === 1) {
            const defaultValue = model.default || []
            if(!utils.isArray(nextValue)) return defaultValue
            return nextValue
        } else if (modelType === 'Boolean') {
            const defaultValue = model.default || false
            if(!utils.isBoolean(nextValue)) return defaultValue
            return nextValue
        } else if (modelType === 'String') {
            const defaultValue = model.default || ''
            if(!utils.isString(nextValue)) {
                if (utils.isNumber(nextValue)) return String(nextValue)
                if (utils.isPlainObject(nextValue)) return utils.toJson(nextValue) || ''
                return defaultValue
            }
            return nextValue
        } else if (modelType === 'Number') {
            const defaultValue = model.default || 0
            const formattedNextValue = Number(nextValue)
            if(!utils.isNumber(formattedNextValue)) return defaultValue
            return formattedNextValue
        } else if (modelType === 'DateString') {
            const defaultValue = model.default || '1970-01-01 08:00:00'
            if(!utils.isDateString(nextValue)) return defaultValue
            return nextValue
        } else if (modelType === 'Timestamp') {
            const defaultValue = model.default || 0
            const formattedNextValue = Number(nextValue)
            if(!utils.isTimestamp(formattedNextValue)) return defaultValue
            return formattedNextValue
        } else {
            return undefined
        }
    }

    private parse(data: IPlainObject, modelRecord: IModel, property) {
        const modelType: ModelRecordType = modelRecord.type
        if ((['Boolean', 'String', 'Number', 'DateString', 'Timestamp'] as Array<ModelRecordType>).includes(modelType)) {
            return this.valueHandler(data, modelRecord, property)
        } else if (modelRecord.type instanceof Define) {
            const value: IPlainObject = this.getValue(data, modelRecord, property)
            return modelRecord.type.parseObject(value).toObject()
        } else if (utils.isArray(modelRecord.type)) {
            const values: Array<any> = this.valueHandler(data, modelRecord, property)
            if (utils.isArray(values)) { 
                return values.map((sub, index) => this.parse(values, {type: modelRecord.type[0]}, String(index)))
            }
        }
        return null
    }

    private parseObject(data: IPlainObject) {
        const nextData: IPlainObject = {}

        const properties = this.getProperties()
        properties.forEach((property: string) => {
            const modelRecord: IModel = this.model[property] as IModel
            const modelOptional = modelRecord.optional || false
            const _formatter = utils.get(modelRecord, 'format', (_next: any) => _next)
            const finalData = this.parse(data, modelRecord, property)
            if (finalData === undefined && modelOptional) {
                return
            }
            nextData[property] = _formatter(finalData)
        })
        return new Model(this, nextData);
    }

    private verifyType(type: any): boolean {
        if (utils.isArray(type) && type.length === 1) {
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