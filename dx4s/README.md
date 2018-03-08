# DX4S

`DX4S` is short for `DuoXue For Student`.

## Installation

First of all, make sure you have installed **nodejs** which version is bigger than **v6.2.1**. 
Then using npm to install global module:

```bash
$ npm install -g node-dev webpack
```

After that, installing npm module locally:

```bash
$ npm install
```

## 第一次来
```bash
npm install
npm run deploy-dll
npm run dev-mobile(desktop)
```
或者你可以来问我，如果我不忙的话。

## 可能的坑
- 开发移动版时，先把浏览器模式改成模拟移动设备的模式，相对的，开发PC版不要用移动浏览器。

## Scripts
- deploy-mobile: 构建移动版本，生成静态文件在dist文件夹下
- deploy-desktop: 构建PC版本，生成静态文件在dist文件夹下
- **deploy-dll**: 生成常用库文件，在开发之前一般请先运行这个命令，如果有新的npm包，也请重新运行该命令
- deploy-mobile-source: 构建移动版本，但不会构建常用库，通常用于快速的hot fix
- deploy-mobile-source: 构建PC版本，但不会构建常用库，通常用于快速的hot fix
- dev-mobile: 开发移动版本时运行
- dev-desktop: 开发PC版本时运行
- lint: 检查代码格式是否良好
- storybook: 纯component例子

## Q&A

### 部署之后，在钉钉环境下页面白了，为什么会这样呢？明明……
一定要很熟练地怀疑是钉钉又双叒叕缓存了，
用Fiddler看看，是不是首页HTML请求都没发起。
如果是这样，找服务端的人索取钉钉后台的帐号密码，
把钉钉图标链接地址加上一个无所谓的参数，如duoxue.91yong.com?**v=0.0.1**

### 各环境的代理接口的IP都是啥？
- pre: http://121.207.244.142:5555
- local: http://192.168.70.218:5555
- dev: http://192.168.70.212:5555

### 如何调试钉钉PC版？
1. 下载[钉钉RC版](https://open-doc.dingtalk.com/doc2/detail?spm=0.0.0.0.MNvABA&treeId=176&articleId=104958&docType=1)
2. fiddler Tools -> HOSTS -> 127.0.0.1:8888 duoxue.91yong.com
3. 修改`config/index.js`下的代理目标，举个栗子，pre环境修改proxy成以下例子
```javascript
proxy: {
    '/training/*': {
      target: 'http://121.207.244.142:5555',
      pathRewrite: { '^/training': '/elearning-training' },
    },
    '/account/*': {
      target: 'http://121.207.244.142:5555',
      pathRewrite: { '^/account': '/elearning-account' },
    },
    '/mall/*': {
      target: 'http://121.207.244.142:5555',
      // pathRewrite: { '^/mall': '/mall' },
    },
    '/pre/*': {
      target: 'http://127.0.0.1:8888',
      pathRewrite: { '^/pre': '/' },
    },
  }
```
这样，你就能本地调试钉钉

## 关于HTTPS服务器
Windows下，如果发现由于443端口被占用，导致无法启动项目，按以下步骤操作
```bash
cmd (管理员模式 ctrl+x -> a)
netstat -a -n -o | find "443"
Taskkill /PID xxxx /F (xxxx代表上一个命令找到的占用443端口的PID，一般是第一个)
```
以上操作提示成功后，即可启动项目

## Reference Documentation

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript/blob/master/README.md)
- [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/blob/master/react/README.md)
- [Stylus Documentation](http://stylus-lang.com/)
- [Webpack Configuration](http://webpack.github.io/docs/configuration.html)
- [ESLint User Guide](http://eslint.org/docs/user-guide/)
- [Axios Usage](https://www.npmjs.com/package/axios)

