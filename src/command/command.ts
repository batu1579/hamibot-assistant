import { ExtensionContext, commands, Uri } from "vscode";
import { updateProjectConfig } from '../lib/projectConfig';

export function registerCommand(context: ExtensionContext): void {
    context.subscriptions.push(
        // 全局设置

        // 项目设置
        commands.registerCommand("hamibot-assistant.markScriptFile", markScriptFile),
        commands.registerCommand("hamibot-assistant.markConfigFile", markConfigFile),

        // 操作
    );
}
