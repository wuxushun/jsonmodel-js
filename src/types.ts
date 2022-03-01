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
