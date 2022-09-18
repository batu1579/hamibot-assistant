import { ExtensionContext, commands } from "vscode";

import {
    setProjectName,
    markConfigFile,
    markScriptFile,
    setExecuteRobot
} from "./projectConfig";

export function registerCommand(context: ExtensionContext): void {
    context.subscriptions.push(
        // 全局设置

        // 项目设置
        commands.registerCommand("hamibot-assistant.setProjectName", setProjectName),
        commands.registerCommand("hamibot-assistant.markScriptFile", markScriptFile),
        commands.registerCommand("hamibot-assistant.markConfigFile", markConfigFile),
        commands.registerCommand("hamibot-assistant.setExecuteRobot", setExecuteRobot),

        // 操作
    );
}