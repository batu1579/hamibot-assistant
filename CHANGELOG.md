# Change Log

所有对 "hamibot-assistant" 扩展的更改都会记录在这个文件中。

文档格式基于 [Keep a Changelog] ，
此项目遵循 [语义化版本号] 。

## [Unreleased]

## [0.7.5] - 2024-04-26

### Fixed

- 修复在上传文件时会出现 400 错误码的问题 [#26](https://github.com/batu1579/hamibot-assistant/issues/26)
- 修复新建脚本指令重复创建的问题 [#28](https://github.com/batu1579/hamibot-assistant/issues/28)

## [0.7.4] - 2024-04-25

### Fixed

- 修复创建项目会出现 Unexpected end of JSON input 的问题 [#21](https://github.com/batu1579/hamibot-assistant/issues/21)

### Security

- Axios 旧版本有漏洞，更新版本到 1.6.5

## [0.7.3] - 2022-11-24

### Changed

- 添加新的 eslint 规则禁止返回 await
- 更新本地模板的类型声明 [hamibot-types v0.1.2](https://github.com/batu1579/hamibot-types/releases/tag/v0.1.2)

### Fixed
  
- 修复标记两个文件时无法使用 `上传并运行标记的脚本` 指令的问题 [#16](https://github.com/batu1579/hamibot-assistant/issues/16)

## [0.7.2] - 2022-10-22

### Changed

- 修改简单模板的脚本和配置文件
- 修改模板的说明文档
- 改为默认创建前询问使用的模板
- 添加编辑 VS Code 设置文件中类型为 `object` 的设置项时的提示（但是字符串貌似不能使用正则限制，建议使用指令设置或分开设置）

## [0.7.1] - 2022-10-21

### Changed

- 优先修改远程名称，成功后再修改本地名称，防止出现名称不同步的问题
- 请求接口后返回 401 状态码时会直接要求填写新的开发者令牌
- 使用模板前验证项目是否存在
- 创建根据项目名称创建项目文件夹

  现在项目文件不是直接存储在选择的文件夹中了，而是在选择路径中创建文件夹用于存放项目文件。用来防止因为复制本地模板覆盖目标文件夹而导致潜在的风险。

- 根据不同平台调用不同的初始化脚本，使用后统一删除

  - `Windows` - `init.bat`
  - `Linux` - `init.sh`

### Fixed

- 修复请求接口失败后显示的错误信息不正确的问题 [#15](https://github.com/batu1579/hamibot-assistant/issues/15)
- 修复选择机器人时出错对话框不消失的问题

## [0.7.0] - 2022-10-20

### Added

- 添加执行模板初始化脚本的功能

  现在创建项目后打开文件夹前会自动运行模板中的初始化脚本（ `init.bat` ），用来执行一些模板自己的初始化功能。例如安装依赖，添加某些文件之类的。

- 添加自动构建功能

  在需要构建的模板中添加 `.vscode/tasks.json` 默认任务，在上传之前会自动执行任务。默认任务需要将任务配置中的 `group.isDefault` 字段设为 `true` 。

- 添加填充说明文档的功能

  插件会自动查找项目根目录下名为 `readme` 的 MarkDown 文件（大小写不限）。然后使用类似文件模板的方式填充内容，使用 `{{}}` 包裹要填充的字段，例如： `{{ projectName }}` 。目前可用的字段有：

  - `projectName` - 项目名称
  - `createDate` - 创建日期
  - `scriptId` - 脚本 ID

- 添加单文件模板的代码提示

### Changed

- 修改单文件模板的说明文档

## [0.6.4] - 2022-10-15

### Fixed

- 修复指令无法使用的问题 [#11](https://github.com/batu1579/hamibot-assistant/issues/11)

### Changed

- 当项目模板设置为 `创建时询问` 时也可以选择默认模板

## [0.6.3] - 2022-10-14

### Changed

- 修改插件激活事件为：

  - 文件夹中包含项目配置文件
  - 使用全局设置指令
  - 使用创建项目指令

## [0.6.2] - 2022-10-14

### Fixed

- 修复未打开文件夹时大部分指令无法使用的问题 [#11](https://github.com/batu1579/hamibot-assistant/issues/11)
- 修复新建项目时显示克隆模板失败的问题 [#12](https://github.com/batu1579/hamibot-assistant/issues/12)

## [0.6.1] - 2022-10-14

### Fixed

- 修复无法从空窗口中新建项目的问题 [#10](https://github.com/batu1579/hamibot-assistant/issues/10)

## [0.6.0] - 2022-10-13

### Added

- 在选择机器人时可以修改机器人名称

  ![alt](./images/gif/renameRobot.gif)

### Fixed

- 修复无法更新开发者令牌的问题 [#9](https://github.com/batu1579/hamibot-assistant/issues/9)

## [0.5.0] - 2022-10-12

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
- 修复关闭重试提示框后才会重新运行指令的问题

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
[unreleased]: https://github.com/batu1579/hamibot-assistant/compare/v0.7.5...HEAD
[0.7.5]: https://github.com/batu1579/hamibot-assistant/compare/v0.7.4..v0.7.5
[0.7.4]: https://github.com/batu1579/hamibot-assistant/compare/v0.7.3..v0.7.4
[0.7.3]: https://github.com/batu1579/hamibot-assistant/compare/v0.7.2..v0.7.3
[0.7.2]: https://github.com/batu1579/hamibot-assistant/compare/v0.7.1..v0.7.2
[0.7.1]: https://github.com/batu1579/hamibot-assistant/compare/v0.7.0..v0.7.1
[0.7.0]: https://github.com/batu1579/hamibot-assistant/compare/v0.6.4..v0.7.0
[0.6.4]: https://github.com/batu1579/hamibot-assistant/compare/v0.6.3..v0.6.4
[0.6.3]: https://github.com/batu1579/hamibot-assistant/compare/v0.6.2..v0.6.3
[0.6.2]: https://github.com/batu1579/hamibot-assistant/compare/v0.6.1..v0.6.2
[0.6.1]: https://github.com/batu1579/hamibot-assistant/compare/v0.6.0..v0.6.1
[0.6.0]: https://github.com/batu1579/hamibot-assistant/compare/v0.5.0..v0.6.0
[0.5.0]: https://github.com/batu1579/hamibot-assistant/compare/v0.4.3..v0.5.0
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
