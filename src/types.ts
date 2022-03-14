import Define from "./define";

export interface IPlainObject {
    [key: string]: any;
}

export interface IModelConfig {
    ignoreNull?: boolean;
}

export type ModelType = 'Boolean' | 'String' | 'Number' | 'DateString' | 'Timestamp' | Define
export type ModelRecordType = ModelType | Array<ModelType>

export interface IModel {
    type: ModelRecordType;
    default?: any;
    keyMapper?: string | Array<string | number> | ((data: any) => any);
    format?: (value: any) => any;
    optional?: boolean;
    ignoreNull?: boolean;
}

export type Models = Record<string, IModel | ModelRecordType>

export function isBasicTypeOf(type: ModelType): boolean {
    return ([types.Boolean, types.String, types.Number, types.DateString, types.Timestamp] as Array<ModelRecordType>).includes(type)
}

export function isTypeOf(type: ModelType): boolean {
    return isBasicTypeOf(type) || type instanceof Define
}

const types: Record<string, ModelType> = {
    Boolean: 'Boolean',
    String: 'String',
    Number: 'Number',
    DateString: 'DateString',
    Timestamp: 'Timestamp',
}

export default types
