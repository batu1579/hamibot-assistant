import { ExtensionContext, commands } from "vscode";

import { setApiToken, setShowOfflineRobot } from "./globalConfig";
import { initProject, uploadAndRunScript, uploadScript } from "./operation";
import {
    setProjectName,
    markConfigFile,
    markScriptFile,
    setExecuteRobot
} from "./projectConfig";

export function registerCommand(context: ExtensionContext): void {
    context.subscriptions.push(
        // 全局设置
        commands.registerCommand("hamibot-assistant.setApiToken", setApiToken),
        commands.registerCommand("hamibot-assistant.setShowOfflineRobot", setShowOfflineRobot),

        // 项目设置
        commands.registerCommand("hamibot-assistant.setProjectName", setProjectName),
        commands.registerCommand("hamibot-assistant.markScriptFile", markScriptFile),
        commands.registerCommand("hamibot-assistant.markConfigFile", markConfigFile),
        commands.registerCommand("hamibot-assistant.setExecuteRobot", setExecuteRobot),

        // 操作
        commands.registerCommand("hamibot-assistant.initProject", initProject),
        commands.registerCommand("hamibot-assistant.uploadScript", uploadScript),
        commands.registerCommand("hamibot-assistant.uploadAndRunScript", uploadAndRunScript),
    );
}
