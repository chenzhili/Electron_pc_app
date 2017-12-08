# Electron_pc_app
try to build pc_application

整个项目搭建的步骤
1、全局安装 electron 和 electron-packager
2、在当前项目下本地开发环境 也需要安装一个 electron，不然打包成exe文件的时候 会报版本不适合

整体感受electron
就是一个基于 v8 引擎 来用 HTML和css和js来实现一个 桌面应用；
有主线程                     和          渲染线程
（main.js）                                  (主要是前端的逻辑，入口一般情况下是 index.html)
主要是electron的api                         前端的逻辑

当然这里有一个线程之间的通讯问题，好像不确定 必须都通过主线程来进行通讯