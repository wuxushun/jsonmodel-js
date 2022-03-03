import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'
import get from 'lodash/get'
import { IPlainObject } from './types'


function isJson(value: any): boolean {
    if (!isString(value)) {
        return false
    }
    try {
        const obj = JSON.parse(value)
        return isObject(obj)
    } catch(e) {
        return false
    }
}

function isBoolean(value: any): boolean {
    return value === false || value === true
}

function isNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value)
   }

function isInteger(value: any): boolean {
    return isNumber(value) && value % 1 === 0
   }

function isDateString(value: any): boolean {
    if (typeof value !== 'string') return false
    return /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(value)
}

function isTimestamp(value: any): boolean {
    return isInteger(Number(value))
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

function toJson(obj: IPlainObject | Array<any>):string | null {
    try {
        return JSON.stringify(obj)
    } catch(e) {
        return null
    }
}

function logger(...arg: any[]) {
    console.log('jsonmodel:', ...arg)
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
    isTimestamp,

    toJson,
    deepFreeze,
    get,
    logger,
}