import { ExtensionContext, commands, Uri, window, workspace } from "vscode";
import { ERROR_DIALOG, INFO_DIALOG } from "../lib/dialog";
import { isError } from "../lib/typeUtil";

import { setApiToken, setDefaultExecuteRobot, setShowOfflineRobot } from "./globalConfig";
import { initProject, uploadAndRunScript, uploadScript } from "./operation";
import {
    setProjectName,
    markConfigFile,
    markScriptFile,
    setExecuteRobot
} from "./projectConfig";

export function registerCommand(context: ExtensionContext): void {
    commandsHandler(context,
        // 全局设置
        {
            id: "hamibot-assistant.setApiToken",
            commandFunc: setApiToken,
            doneInfo: "开发者令牌已更新"
        },
        {
            id: "hamibot-assistant.setShowOfflineRobot",
            commandFunc: setShowOfflineRobot,
            doneInfo: "显示离线机器人设置已更新"
        },
        {
            id: "hamibot-assistant.setDefaultExecuteRobot",
            commandFunc: setDefaultExecuteRobot,
            doneInfo: "默认调试机器人已更新"
        },
        {
            id: "hamibot-assistant.resetDialogs",
            commandFunc: async () => {
                for (const key of context.globalState.keys()) {
                    await context.globalState.update(key, false);
                }
            },
            doneInfo: "提示信息已重置"
        },

        // 项目设置
        {
            id: "hamibot-assistant.setProjectName",
            commandFunc: setProjectName,
            doneInfo: "项目名称已更新"
        },
        {
            id: "hamibot-assistant.markScriptFile",
            commandFunc: markScriptFile,
            doneInfo: "脚本文件标记已更新"
        },
        {
            id: "hamibot-assistant.markConfigFile",
            commandFunc: markConfigFile,
            doneInfo: "配置文件标记已更新"
        },
        {
            id: "hamibot-assistant.setExecuteRobot",
            commandFunc: setExecuteRobot,
            doneInfo: "调试机器人已更新"
        },

        // 操作
        {
            id: "hamibot-assistant.initProject",
            commandFunc: initProject
        },
        {
            id: "hamibot-assistant.uploadScript",
            commandFunc: uploadScript,
            doneInfo: "脚本文件已上传"
        },
        {
            id: "hamibot-assistant.uploadAndRunScript",
            commandFunc: uploadAndRunScript,
            doneInfo: "开始运行脚本"
        }
    );
}

/**
 * @description: 注册所有指令，并添加异常处理装饰器。
 * @param {ExtensionContext} context 扩展上下文。
 * @param {Command} commandList 要包装的指令对象。
 */
async function commandsHandler(context: ExtensionContext, ...commandList: Command[]): Promise<void> {
    for (const command of commandList) {
        context.subscriptions.push(
            commands.registerCommand(command.id, async (uri: Uri) => {
                while (await exceptionHandler(context, uri, command)) {
                    window.showInformationMessage('正在重试...');
                }
            })
        );
    }
}

/**
 * @description: 包装指令对应的函数，发生异常后使用错误提示框输出异常，并提供重试和不再提示选项。
 * @param {ExtensionContext} context 扩展上下文。
 * @param {Uri} uri 调用指令时传入的 Uri 。
 * @param {Command} c 在指令对应的函数外添加异常处理。
 * @return {Promise<boolean>} 是否需要重试。
 */
async function exceptionHandler(context: ExtensionContext, uri: Uri, c: Command): Promise<boolean> {
    let needRetry = false;

    try {
        await c.commandFunc(uri);

        if (c.doneInfo) {
            await INFO_DIALOG.showDialog(context, c.doneInfo);
        }
    } catch (error) {
        if (!isError(error)) {
            throw error;
        }

        needRetry = await ERROR_DIALOG.showDialog(context, error.message);
    };

    return needRetry;
}

interface Command {
    /**
     * @description: 指令 ID
     */
    id: string;

    /**
     * @description: 完成指令操作后显示的信息
     */
    doneInfo?: string;

    /**
     * @description: 指令对应的函数
     */
    commandFunc: Function;
}
