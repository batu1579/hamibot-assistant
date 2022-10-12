# Change Log

所有对 "hamibot-assistant" 扩展的更改都会记录在这个文件中。

文档格式基于 [Keep a Changelog] ，
此项目遵循 [语义化版本号] 。

## [Unreleased]

### Added

- 添加了使用本地模板的功能
- 添加了使用 Github 远程模板的功能
- 全局设置指令：

  - `hamibot-assistant.setProjectTemplate` : 从默认提供的模板中选择

- 添加了创建时使用手动指定模板的功能

### Changed

- 使用指令设置开发者令牌时会检查格式
- 加载机器人列表时显示加载动画

### Fixed

- 修复创建项目时输入框标题的错误

## [0.4.3] - 2022-10-09

### Changed

- 在修改项目名称的同时修改远程脚本名称

### Fixed

- 修复依赖检查失效的问题

## [0.4.2] - 2022-10-09

### Changed

- 更改了默认机器人的存储方式，现在可以在设置界面直接修改了

### Fixed

- 修复提示令牌格式错误的问题
- 重试指令提示信息显示顺序错误的问题

## [0.4.1] - 2022-10-08

### Fixed

- 修复不能重置提示信息的问题

## [0.4.0] - 2022-10-08

### Added

- 项目操作指令：

  - `hamibot-assistant.stopScript` : 停止脚本运行

- 更详细的错误描述
- 在指令运行前检查依赖的设置项

### Fixed

- 未执行指令时显示完成信息
- 无法加载远程 JSON schema 的问题

## [0.3.1] - 2022-10-07

### Fixed

- 无法取消设置项目名称的问题
- 找不到项目配置文件校验文件的问题

## [0.3.0] - 2022-10-06

### Added

- 全局设置指令:

  - `hamibot-assistant.resetDialogs` : 重置跳过提示信息记录

- 执行指令后显示提示信息
- 捕获全局异常以对话框展示
- 所有对话框提供 `不再显示` 选项

## [0.2.1] - 2022-10-06

### Fixed

- 未打开工作区时新建项目失败的问题
- 修改设置后保存的范围错误
- 未隐藏不能使用的指令

## [0.2.0] - 2022-10-06

### Added

- 全局设置指令:

  - `hamibot-assistant.setApiToken` : 设置用于访问 Hamibot API 的开发者令牌
  - `hamibot-assistant.setShowOfflineRobot` : 设置是否显示离线机器人
  - `hamibot-assistant.setDefaultExecuteRobot` : 设置默认调试机器人

- 项目操作指令：

  - `hamibot-assistant.initProject` : 创建新项目
  - `hamibot-assistant.uploadScript` : 上传标记的脚本文件
  - `hamibot-assistant.uploadAndRunScript` : 上传并运行标记的脚本文件

- 更详细的请求失败报错
- 访问接口前检查请求参数
- 上传文件接口
- 创建项目和上传时使用默认机器人信息

### Fixed

- 无法访问国内站接口的问题

### Changed

- 项目设置的指令分类修改为: `Hamibot Project`
- 项目设置的机器人 id 字段修改为: `_id`
- 项目设置的机器人字段修改为: `executeRobot`
- 项目设置的脚本 id 字段修改为: `scriptId`

## [0.1.0] - 2022-09-18

### Added

- 项目设置 Schema ( `hamibot.config.json` )
- 项目设置操作接口
- 项目设置指令:

  - `hamibot-assistant.setProjectName` : 设置项目名称
  - `hamibot-assistant.setExecuteRobot` : 设置调试机器人

- 文件树右键菜单快捷方式:

  - 标记脚本文件（ `.js` ）
  - 标记配置文件（ `.json` ）

- 除上传文件以外全部 Hamibot 接口的封装
- 服务器错误时尝试使用备用的域名请求

## [0.0.1] - 2022-09-11

- initial release

<!-- Links -->
[keep a changelog]: https://keepachangelog.com/en/1.0.0/
[语义化版本号]: https://semver.org/spec/v2.0.0.html

<!-- Versions -->
[unreleased]: https://github.com/batu1579/hamibot-assistant/compare/v0.4.3...HEAD
[0.4.3]: https://github.com/batu1579/hamibot-assistant/compare/v0.4.2..v0.4.3
[0.4.2]: https://github.com/batu1579/hamibot-assistant/compare/v0.4.1..v0.4.2
[0.4.1]: https://github.com/batu1579/hamibot-assistant/compare/v0.4.0..v0.4.1
[0.4.0]: https://github.com/batu1579/hamibot-assistant/compare/v0.3.1..v0.4.0
[0.3.1]: https://github.com/batu1579/hamibot-assistant/compare/v0.3.0..v0.3.1
[0.3.0]: https://github.com/batu1579/hamibot-assistant/compare/v0.2.1..v0.3.0
[0.2.1]: https://github.com/batu1579/hamibot-assistant/compare/v0.2.0..v0.2.1
[0.2.0]: https://github.com/batu1579/hamibot-assistant/compare/v0.0.1..v0.2.0
[0.1.0]: https://github.com/batu1579/hamibot-assistant/compare/v0.0.1..v0.1.0
[0.0.1]: https://github.com/batu1579/hamibot-assistant/releases/tag/v0.0.1
