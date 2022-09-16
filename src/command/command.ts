import { ExtensionContext, commands, Uri } from "vscode";
import { updateProjectConfig } from '../lib/projectConfig';

export function registerCommand(context: ExtensionContext): void {
    context.subscriptions.push(
        // 全局设置

        // 项目设置
        commands.registerCommand("hamibot-assistant.markScriptFile", (uri: Uri) => {
            updateProjectConfig({ fileMark: { scriptFile: uri.fsPath } });
        }),
        commands.registerCommand("hamibot-assistant.markConfigFile", (uri: Uri) => {
            updateProjectConfig({ fileMark: { configFile: uri.fsPath } });
        }),

        // 操作
    );
}
