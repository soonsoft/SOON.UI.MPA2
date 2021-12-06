[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg?style=flat-square)](https://996.icu/#/zh_CN)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

## SOON.UI 多页应用工程目标，基于Vite2

### 安装依赖
```
npm install
```

### 运行
```
npm run dev
```

### 构建
```
npm run build
```

构建完成后内容放于工程根目录的 dist 中。

工程目录说明
* src
> 存放js代码文件
* public
> 存放html、css或js等文件中直接硬编码应用等文件
* vendor
> 存放第三方js文件，如SOON.UI
* view
> 存放html文件，工程会自动扫描该目录下的 `*.html` 文件，并创建出enter
* resource
> 存放js中用 `import` 或 `new URL()` 方式导入的文件

