import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'
import get from 'lodash/get'
import { IPlainObject } from './types'


function isJson(json: string): boolean {
    if (!isString(json)) {
        return false
    }
    try {
        const obj = JSON.parse(json)
        return isObject(obj)
    } catch(e) {
        return false
    }
}

function toJson(obj: IPlainObject | Array<any>):string | null {
    try {
        return JSON.stringify(obj)
    } catch(e) {
        return null
    }
}

function isBoolean(value: any): boolean {
    return value === false || value === true
}

function isNumber(value: any): boolean {
    return typeof value === 'number'
   }

function isInteger(value: any): boolean {
    return typeof isNumber(value) && value % 1 === 0
   }

function isDateString(str: any): boolean {
    if (typeof str !== 'string') return false
    return /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(str)
}

function deepFreeze(obj: IPlainObject): IPlainObject {
    Object.freeze(obj);
    Object.keys(obj).forEach((key: string) => {
        if (isObject(obj[key])) {
            deepFreeze(obj[key]);
        }
    });
    return obj;
}

function logger(...arg: any[]) {
    console.warn('jsonmodel:', ...arg)
}

export default {
    isJson,
    isString,
    isObject,
    isArray,
    isPlainObject,
    isBoolean,
    isNumber,
    isInteger,
    isDateString,

    toJson,
    deepFreeze,
    get,
    logger,
}