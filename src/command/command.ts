import {
    Uri,
    window,
    commands,
    workspace,
    ExtensionContext
} from "vscode";

import { isError } from "../lib/typeUtil";
import { HamibotConfig } from "../lib/projectConfig";
import { ERROR_DIALOG, INFO_DIALOG } from "../lib/dialog";

import {
    stopScript,
    initProject,
    uploadScript,
    uploadAndRunScript
} from "./operation";

import {
    setApiToken,
    setShowOfflineRobot,
    setDefaultExecuteRobot
} from "./globalConfig";

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
            doneInfo: "机器人显示设置已更新"
        },
        {
            id: "hamibot-assistant.setDefaultExecuteRobot",
            commandFunc: setDefaultExecuteRobot,
            doneInfo: "默认调试机器人已更新",
            requirements: [
                new VSCodeConfigRequirement('apiToken', () => {
                    commands.executeCommand('hamibot-assistant.setApiToken');
                })
            ]
        },
        {
            id: "hamibot-assistant.resetDialogs",
            commandFunc: async () => {
                for (const key of context.globalState.keys()) {
                    await context.globalState.update(key, false);
                }
                return Job.done;
            },
            doneInfo: "提示信息已重置"
        },

        // 项目设置
        {
            id: "hamibot-assistant.setProjectName",
            commandFunc: setProjectName,
            doneInfo: "项目名称已更新",
            requirements: [
                new VSCodeConfigRequirement('apiToken', () => {
                    commands.executeCommand('hamibot-assistant.setApiToken');
                }),
                new ProjectConfigRequirement('scriptId')
            ]
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
            doneInfo: "调试机器人已更新",
            requirements: [
                new VSCodeConfigRequirement('apiToken', () => {
                    commands.executeCommand('hamibot-assistant.setApiToken');
                }),
            ]
        },

        // 操作
        {
            id: "hamibot-assistant.initProject",
            commandFunc: initProject,
            doneInfo: "新项目已创建",
            requirements: [
                new VSCodeConfigRequirement('apiToken', () => {
                    commands.executeCommand('hamibot-assistant.setApiToken');
                })
            ]
        },
        {
            id: "hamibot-assistant.uploadScript",
            commandFunc: uploadScript,
            doneInfo: "脚本文件已上传",
            requirements: [
                new VSCodeConfigRequirement('apiToken', () => {
                    commands.executeCommand('hamibot-assistant.setApiToken');
                }),
                new ProjectConfigRequirement('scriptId'),
                new ProjectConfigRequirement('fileMark')
            ]
        },
        {
            id: "hamibot-assistant.uploadAndRunScript",
            commandFunc: uploadAndRunScript,
            doneInfo: "开始运行脚本",
            requirements: [
                new VSCodeConfigRequirement('apiToken', () => {
                    commands.executeCommand('hamibot-assistant.setApiToken');
                }),
                new ProjectConfigRequirement('scriptId'),
                new ProjectConfigRequirement('fileMark'),
                new ProjectConfigRequirement('executeRobot')
            ]
        },
        {
            id: "hamibot-assistant.stopScript",
            commandFunc: stopScript,
            doneInfo: "脚本已停止运行",
            requirements: [
                new VSCodeConfigRequirement('apiToken', () => {
                    commands.executeCommand('hamibot-assistant.setApiToken');
                }),
                new ProjectConfigRequirement('scriptId'),
                new ProjectConfigRequirement('executeRobot')
            ]
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
                // 指令依赖检查
                if (command.requirements) {
                    try {
                        await checkRequirements(command.requirements);
                    } catch (error) {
                        if (!isError(error)) {
                            throw error;
                        }

                        // 依赖检查异常不可隐藏
                        window.showErrorMessage(error.message);
                        return;
                    }
                }

                // 重试循环
                while (await exceptionHandler(context, uri, command)) {
                    await window.showInformationMessage('正在重试...');
                }
            })
        );
    }
}

async function checkRequirements(requirements: RequireInfo[]): Promise<void> {
    let vscodeConfig = workspace.getConfiguration('hamibot-assistant');
    let projectConfig = await global.currentConfig.getProjectConfig();
    for (const req of requirements) {
        let isSatisfied = false;
        switch (req.type) {
            case RequireType.vscodeConfig:
                isSatisfied = vscodeConfig.has(req.field);
                break;

            case RequireType.projectConfig:
                isSatisfied = (HamibotConfig.getConfigByFieldName(projectConfig, req.field)) === undefined;
                break;

            default:
                throw new Error(`依赖类型 ${req.type} 不存在`);
        }

        if (!isSatisfied) {
            if (req.onNotSatisfied) {
                req.onNotSatisfied();
            }
            throw new Error(`此指令依赖于 ${req.field} 配置项，请先设置`);
        }
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
        let jobStatus = await c.commandFunc(uri);

        if (c.doneInfo && jobStatus === Job.done) {
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
    commandFunc: (...args: any[]) => Promise<Job>;

    /**
     * @description: 指令依赖的信息
     */
    requirements?: RequireInfo[]
}

export enum Job {
    done,
    undone
};

interface RequireInfo {
    /**
     * @description: 依赖类型
     */
    type: RequireType;

    /**
     * @description: 依赖的字段
     */
    field: string;

    /**
     * @description: 不满足依赖时的回调函数
     */
    onNotSatisfied?: Function;
}

enum RequireType {
    vscodeConfig,
    projectConfig
}

abstract class ConfigRequirement implements RequireInfo {
    public abstract type: RequireType;

    public field: string;
    public onNotSatisfied: Function;

    constructor(field: string, onNotSatisfied?: Function) {
        this.field = field;
        this.onNotSatisfied = onNotSatisfied ?? this.defaultCallback;
    }

    protected async defaultCallback(): Promise<void> { }
}

class VSCodeConfigRequirement extends ConfigRequirement implements RequireInfo {
    type: RequireType = RequireType.vscodeConfig;

    protected async defaultCallback(): Promise<void> {
        await commands.executeCommand('workbench.action.openSettingsJson');
    };
}

class ProjectConfigRequirement extends ConfigRequirement implements RequireInfo {
    type: RequireType = RequireType.projectConfig;

    protected async defaultCallback(): Promise<void> {
        await window.showTextDocument(global.currentConfig.getProjectConfigFileUri());
    };
}
