<h1 align="center">Welcome to Hamibot 开发助手 👋</h1>
<p align="center">
    <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/batu1579/hamibot-assistant">
    <img src="https://img.shields.io/badge/vscode-%5E1.70.0-blue.svg" />
    <a href="https://github.com/batu1579/hamibot-assistant/blob/main/LICENSE" target="_blank">
        <img alt="GitHub" src="https://img.shields.io/github/license/batu1579/hamibot-assistant">
    </a>
</p>

> 辅助开发 Hamibot 脚本的 VSCode 插件

## 🎉 特性

- 自动在远程创建脚本
- 可视化选择机器人
- 指令上传和运行
- 同时上传脚本文件和配置文件

## 🚀 使用方法

> 因为此插件依赖于 Hamibot API ，所以在使用之前请先设置开发者令牌，见 [全局设置](#全局设置-hamibot-config-) 。

1. 使用 `新建 Hamibot 项目` 指令创建新的脚本。
2. 编写代码。
3. 初次上传需要标记所需上传的文件：

   1. 在资源管理器界面找到需要上传的文件
   2. 在文件上点击右键选择标记选项

4. 使用 `上传标记的脚本文件` 或 `上传并运行标记的脚本文件` 指令上传。

## 📟 可用指令

> 此插件提供的所有指令都可以通过命令面板（ `Ctrl` + `p` 或 `F1` ）搜索 `hamibot` 关键字找到。

### 全局设置（ `Hamibot Config` ）

- `hamibot-assistant.setApiToken`: 设置 Hamibot API 令牌，在开始使用前请务必设置好。
- `hamibot-assistant.setShowOfflineRobot`: 设置是否显示离线机器人（默认为 `false` ）。
- `hamibot-assistant.setDefaultExecuteRobot`: 设置默认调试机器人，在创建新项目时会选择，自动使用这个作为调试机器人。
- `hamibot-assistant.resetDialogs`: 重置提示信息，用于恢复所有不再显示的提示信息。

### 项目设置（ `Hamibot Project` ）

- `hamibot-assistant.setProjectName`: 设置项目名称，同时修改远程脚本名称。
- `hamibot-assistant.setExecuteRobot`: 设置用于当前项目中调试脚本的机器人。

### 可用操作（ `Hamibot Operation` ）

- `hamibot-assistant.initProject`: 新建 Hamibot 项目，会自动在远程创建对应名称的脚本。
- `hamibot-assistant.uploadScript`: 上传标记的脚本文件。
- `hamibot-assistant.uploadAndRunScript`: 上传并运行标记的脚本文件。
- `hamibot-assistant.stopScript`: 强制停止脚本运行。在运行前不必使用，因为 hamibot 会自动结束上一次执行的脚本。

## ⚙️ 扩展设置

此扩展提供以下设置:

- `hamibot-assistant.ApiToken`: 用于使用 Hamibot Api 的开发者令牌。
- `hamibot-assistant.showOfflineRobot`: 选择调试机器人时显示离线机器人（默认不显示）。
- `hamibot-assistant.defaultExecuteRobot.enable` : 启用默认调试机器人。启用后在创建项目时会使用此机器人，当项目设置中没有配置机器人时也会使用默认调试机器人代替。
- `hamibot-assistant.defaultExecuteRobot.robotInfo` : 默认调试机器人信息，只有在启用默认调试机器人后才会生效。此设置包含两个字段：

  - `id` : 默认调试机器人 ID 。
  - `name` : 默认调试机器人名称。

## 📋 更新日志

查看 [更新日志]

## ✅ TODO List

- [ ] 跟踪要发送的文件
- [ ] 在新建项目时使用模板
- [ ] 在控制台显示脚本调试信息
- [ ] 在调试时加载指定的脚本配置项
- [ ] 更多可视化方式代替指令操作

## 🤝 贡献

欢迎提交 [PR] ， [问题] 和 [功能请求] ！查看 [问题页面] 。

## ✨ 支持

如果有帮到你的话，帮我点颗小星星叭~ ⭐️

***

_This README was generated with ❤️ by [readme-md-generator]_

<!-- Links -->

[更新日志]: https://github.com/batu1579/hamibot-assistant/blob/main/CHANGELOG.md
[PR]: https://github.com/batu1579/hamibot-assistant/compare
[问题]: https://github.com/batu1579/hamibot-assistant/issues/new?assignees=batu1579&labels=bug&template=---bug.md&title=%5BBUG%5D
[功能请求]: https://github.com/batu1579/hamibot-assistant/issues/new?assignees=batu1579&labels=enhancement&template=----.md&title=%5BFeature%5D
[问题页面]: https://github.com/batu1579/hamibot-assistant/issues
[readme-md-generator]: https://github.com/kefranabg/readme-md-generator
