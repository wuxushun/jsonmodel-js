import JsonModel from '../src/index'

test('basic', () => {
    const model = new JsonModel.define({
        title: {
            type: 'String',
        },
        count: {
            type: 'Number',
        },
        ts: 'Timestamp',
        date: 'DateString',
    })
    const json = {
        title: 'hello jsonmodel',
        count: 10,
    }
    const correct = {
        title: 'hello jsonmodel',
        count: 10,
        ts: 0,
        date: '1970-01-01 08:00:00',
    }
    // from object
    const m_model_obj = model.modelFromObject(json)
    expect(m_model_obj.title).toEqual(correct.title)
    expect(m_model_obj.count).toEqual(correct.count)

    // from jsonString
    const m_model_json = model.modelFromString(JSON.stringify(json))
    expect(m_model_json.title).toEqual(correct.title)
    expect(m_model_json.count).toEqual(correct.count)

    // from arrayOfModelsFromObject
    const m_model_arr_obj = model.arrayOfModelsFromObject([json, json])
    expect(m_model_arr_obj).toHaveLength(2)
    m_model_arr_obj.forEach(sub => {
        expect(sub.title).toEqual(correct.title)
        expect(sub.count).toEqual(correct.count)
    })

    // from arrayOfModelsFromString
    const m_model_arr_str = model.arrayOfModelsFromString(JSON.stringify([json, json]))
    expect(m_model_arr_str).toHaveLength(2)
    m_model_arr_str.forEach(sub => {
        expect(sub.title).toEqual(correct.title)
        expect(sub.count).toEqual(correct.count)
    })
});

test('default value', () => {
    const model = new JsonModel.define({
        title: {
            type: 'String',
            default: 'hello jsonmodel',
        },
        count: {
            type: 'Number',
        },
    })
    const json = {
        count: 10,
    }
    const correct = {
        title: 'hello jsonmodel',
        count: 10,
    }

    const m_model_obj = model.modelFromObject(json)
    expect(m_model_obj.title).toEqual(correct.title)
    expect(m_model_obj.count).toEqual(correct.count)
});

test('key mapper', () => {
    const model = new JsonModel.define({
        title: {
            type: "String",
            keyMapper: "data.name",
        },
        count: {
            type: "Number",
            default: 10,
        },
    })
    const json = {
        data: {
            name: 'hello jsonmodel',
        },
        count: 20,
    }
    const correct = {
        title: 'hello jsonmodel',
        count: 20,
    }

    const m_model_obj = model.modelFromObject(json)
    expect(m_model_obj.title).toEqual(correct.title)
    expect(m_model_obj.count).toEqual(correct.count)
});

test('format', () => {
    const model = new JsonModel.define({
        title: {
            type: "String",
            default: "hello jsonmodel",
        },
        count: {
            type: "Number",
            format: (value) => {
                return String(value);
            },
        },
    })
    const json = {
        title: 'hello jsonmodel',
        count: 20,
    }
    const correct = {
        title: 'hello jsonmodel',
        count: '20',
    }

    const m_model_obj = model.modelFromObject(json)
    expect(m_model_obj.title).toEqual(correct.title)
    expect(m_model_obj.count).toEqual(correct.count)
});

test('optional', () => {
    const model = new JsonModel.define({
        title: {
            type: "String",
            default: "jsonmodel",
        },
        count: {
            type: "Number",
            optional: true,
        },
    })
    const json = {
        title: 'hello jsonmodel',
    }
    const correct = {
        title: 'hello jsonmodel',
    }

    const m_model_obj = model.modelFromObject(json).toObject()
    expect(m_model_obj).toEqual(correct)
    expect(m_model_obj).not.toHaveProperty('count')
});

test('ignore null', () => {
    const model = new JsonModel.define({
        title: {
            type: "String",
        },
        count: {
            type: "Number",
            ignoreNull: true,
        },
    })
    const json = {
        title: "hello jsonmodel",
        count: null,
    }
    const correct = {
        title: 'hello jsonmodel',
        count: null,
    }

    const m_model_obj = model.modelFromObject(json)
    expect(m_model_obj.title).toEqual(correct.title)
    expect(m_model_obj.count).toEqual(null)
});

test('nest obj', () => {
    const userModel = new JsonModel.define({
        name: "String",
    });
    
    const model = new JsonModel.define({
        title: "String",
        count: "Number",
        user: userModel,
    });
    const json = {
        title: "jsonmodel",
        count: 10,
        user: {
            name: "mark",
        },
    }
    const correct = {
        title: "jsonmodel", 
        count: 10, 
        user: { 
            name: 'mark'
        },
    }

    const m_model_obj = model.modelFromObject(json)
    expect(m_model_obj.title).toEqual(correct.title)
    expect(m_model_obj.count).toEqual(correct.count)
    expect(m_model_obj.user).toEqual(correct.user)
});

test('nest arr1', () => {
    const model = new JsonModel.define({
        title: "String",
        count: "Number",
        names: ['String'],
    });
    const json = {
        title: "jsonmodel",
        count: 10,
        names: [1, '2'],
    }
    const correct = {
        title: "jsonmodel",
        count: 10,
        names: ['1', '2'],
    }

    const m_model_obj = model.modelFromObject(json)
    expect(m_model_obj.title).toEqual(correct.title)
    expect(m_model_obj.count).toEqual(correct.count)
    expect(m_model_obj.names).toEqual(correct.names)
});

test('nest arr2', () => {
    const userModel = new JsonModel.define({
        name: "String",
    });
    
    const model = new JsonModel.define({
        title: "String",
        count: "Number",
        users: [userModel],
    });
    const json = {
        title: "jsonmodel",
        count: 10,
        users: [{
            name: "mark",
        }, {
            name: "mark",
        }],
    }
    const correct = {
        title: "jsonmodel",
        count: 10,
        users: [{
            name: "mark",
        }, {
            name: "mark",
        }],
    }

    const m_model_obj = model.modelFromObject(json)
    expect(m_model_obj.title).toEqual(correct.title)
    expect(m_model_obj.count).toEqual(correct.count)
    expect(m_model_obj.users).toEqual(correct.users)
});