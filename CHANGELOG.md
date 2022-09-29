# Change Log

所有对 "hamibot-assistant" 扩展的更改都会记录在这个文件中。

文档格式基于 [Keep a Changelog] ，
此项目遵循 [语义化版本号].

## [Unreleased]

### Added

- 全局设置指令:
  - `hamibot-assistant.setApiToken` : 设置用于访问 Hamibot API 的开发者令牌
  - `hamibot-assistant.setShowOfflineRobot` : 设置是否显示离线机器人
- 更详细的请求失败报错

### Changed

- 项目设置的指令分类修改为: `Hamibot Project`
- 项目设置的机器人id字段修改为: `_id`

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
[unreleased]: https://github.com/batu1579/hamibot-assistant/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/batu1579/hamibot-assistant/compare/v0.0.1..v0.1.0
[0.0.1]: https://github.com/batu1579/hamibot-assistant/releases/tag/v0.0.1
