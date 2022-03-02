# JsonModel

JsonModel js 版本实现

## 前言

前端的数据来源绝大部分是来自于接口，我们经常能在前端项目里面看到这种操作：

一个从后端获取的对象数据，经过层层传递，到最后面使用的时候，已经不知道里面到底是什么数据结构了。

一个对象里面嵌套有对象，后端经常不返回某些空的数据，前端要用的时候，需要使用丑陋的链式判空操作，例如 `data?.address?.city`。

一个后端返回的数据类型，前端在使用的时候时常需要进行格式化或者转码。

## 安装

从 npm 安装：

```bash
npm i --save jsonmodel-js
```

发布的包中包含 3 种类型的产物：

- `umd`: 适合浏览器环境

  引入目录：node_modules/jsonmodel-js/dist/jsonmodel.umd.js

- `cjs`: 适合 Node.js 环境

  引入目录：node_modules/jsonmodel-js/dist/cjs

- `esm`: 适合 ES Module 环境

  引入目录：node_modules/jsonmodel-js/dist/esm

#### 浏览器

引入 jsonmodel 库文件(请使用 umd 包)：

```js
<script src="/path/to/dist/umd/jsonmodel.umd.js"></script>
```

然后可以使用全局变量 `JsomModel`：

```html
<script type="text/javascript">
  const model = new JsonModel.define({
    title: "String",
  });
</script>
```

#### Node.js(cjs)

```js
const JsonModel = require("jsonmodel-js/dist/cjs");

const model = new JsonModel.define({
  title: "String",
});
```

#### ES Module

```js
import JsonModel from "jsonmodel-js/dist/esm";

const model = new JsonModel.define({
  title: "String",
});
```

## 使用

#### 基础用法

定义一个前端数据模型：

```js
const JsonModel = require("jsonmodel-js/dist/cjs");

const dataModel = new JsonModel.define({
  title: "String",
  count: "Number",
});
```

将后端的数据转换为前端数据模型：

```js
const data = dataModel.modelFromObject({
  title: "jsonmodel",
  count: 10,
  xxx: "xxx",
});

console.log(data); // { title: 'jsonmodel', count: 10 } xxx未定义将被忽略
```

From 数组：

```js
const JsonModel = require("jsonmodel-js/dist/cjs");

const dataModel = new JsonModel.define({
  title: {
    type: "String",
    default: "jsonmodel",
  },
  count: {
    type: "Number",
    default: 10,
  },
});

const data = dataModel.arrayOfModelsFromObject([
  {
    title: "hello jsonmodel",
    count: 20,
  },
  {
    count: 30,
  },
]);

console.log(data);
// [{ count: 20, title: 'hello jsonmodel' }, { count: 30, title: 'jsonmodel' }]
```

#### 填充默认值

有时候后端返回的数据中会缺少一些字段，前端需要指定默认值，如果直接通过 `.` 点操作符取值，可能会存在 `undefined is not an Object` 的错误，这种情况通过指定 `default` 默认值可以很好的解决问题：

```js
const JsonModel = require("jsonmodel-js/dist/cjs");

const dataModel = new JsonModel.define({
  title: {
    type: "String",
    default: "jsonmodel",
  },
  count: {
    type: "Number",
    default: 10,
  },
});

const data = dataModel.modelFromObject({
  count: 20,
});

console.log(data); // { count: 20, title: 'jsonmodel' }
```

#### 字段名映射

有时候同一个数据，因为使用的场景不一样，后端和前端的命名也不一样，这种情况我们可以通过 `keyMapper` 映射到另一个字段的值：

```js
const JsonModel = require("jsonmodel-js/dist/cjs");

const dataModel = new JsonModel.define({
  title: {
    type: "String",
    keyMapper: "name",
  },
  count: {
    type: "Number",
    default: 10,
  },
});

const data = dataModel.modelFromObject({
  name: "jsonmodel",
  count: 20,
});

console.log(data); // { title: 'jsonmodel', count: 20 }
```

#### 格式化

后端返回的数据通常是数据库中保存的原始值，前端需要将它转换为合适的格式，这种情况我们可以通过 `format` 格式化很好的解决这个问题：

```js
const JsonModel = require("jsonmodel-js/dist/cjs");

const dataModel = new JsonModel.define({
  title: {
    type: "String",
    default: "jsonmodel",
  },
  count: {
    type: "Number",
    default: 10,
    keyMapper: "num",
    format: (value) => {
      return Number(value);
    },
  },
});

const data = dataModel.modelFromObject({
  num: "20",
});

console.log(data); // { title: 'jsonmodel', count: 20 }
```

#### 可选值

有的时候后端返回的字段是可选的，我们可以这样定义：

```js
const JsonModel = require("jsonmodel-js/dist/cjs");

const dataModel = new JsonModel.define({
  title: {
    type: "String",
    default: "jsonmodel",
  },
  count: {
    type: "Number",
    optional: true,
  },
});

const data = dataModel.modelFromObject({
  title: "jsonmodel",
});

console.log(data); // { title: 'jsonmodel' }
```

#### 忽略 null 处理

默认情况下，被定义的 model 将被强制设置指定类型的默认值，如需忽略可以设置该字段：

```js
const JsonModel = require("jsonmodel-js/dist/cjs");

const dataModel = new JsonModel.define({
  title: {
    type: "String",
    default: "jsonmodel",
  },
  count: {
    type: "Number",
    ignoreNull: true,
  },
});

const data = dataModel.modelFromObject({
  title: "jsonmodel",
  count: null,
});

console.log(data); // { title: 'jsonmodel', count: null, }
```

#### 嵌套数据模型

除了基本的 JavaScript 类型外，还支持嵌套数据模型，这种场景非常常见：

```js
const JsonModel = require("jsonmodel-js/dist/cjs");

const userModel = new JsonModel.define({
  name: "String",
});

const dataModel = new JsonModel.define({
  title: "Number",
  count: "String",
  user: userModel,
});

const data = dataModel.modelFromObject({
  title: "jsonmodel",
  count: 10,
  user: {
    name: "mark",
  },
});

console.log(data); // { title: "jsonmodel", count: 10, user: { name: 'mark' } }
```

### 特征

- [x] 完善单元测试
- [ ] 实现所有 oc-jsonmodel api
- [ ] 包体积优化
