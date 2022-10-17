import { existsSync } from "fs";
import { isAbsolute } from "path";
import { isNativeError } from "util/types";
import {
    Uri,
    Task,
    tasks,
    window,
    TaskScope,
    workspace,
    extensions,
    QuickPickItem,
    ShellExecution,
    TaskDefinition,
} from "vscode";

import { Job } from "../command/command";
import {
    isGithubUrlValid,
    validGithubUrl,
    validLocalpath
} from "./valid";

interface TemplateConfig {
    type: TemplateType;
    path?: string;
}

interface LocalTemplateConfig extends TemplateConfig {
    type: TemplateType.local;
    path: string;
}

interface RemoteTemplateConfig extends TemplateConfig {
    type: TemplateType.remote;
    path: string;
}

interface TemporaryTemplateConfig extends TemplateConfig {
    type: TemplateType.askWhenCreate;
}

interface GitTaskDefinition extends TaskDefinition {
    type: "clone-template";
    repoUrl: string;
    targetPath: string;
}

type ExistTemplateConfig = LocalTemplateConfig | RemoteTemplateConfig;

interface ProjectTemplate {
    name: string;
    description: string;
    config: ExistTemplateConfig;
}

interface QuickPickTemplate extends QuickPickItem {
    config?: TemplateConfig;
}

export enum TemplateType {
    disable = "disabled",
    local = "local",
    remote = "remote",
    askWhenCreate = "askWhenCreate"
}

function isLocalTemplateConfig(value: TemplateConfig): value is LocalTemplateConfig {
    return value.type === TemplateType.local && value.path !== undefined;
}

function isRemoteTemplateConfig(value: TemplateConfig): value is RemoteTemplateConfig {
    return value.type === TemplateType.remote && value.path !== undefined;
}

function isTemporaryTemplateConfig(value: TemplateConfig): value is TemporaryTemplateConfig {
    return value.type === TemplateType.askWhenCreate && value.path !== undefined;
}

export async function useTemplate(targetFolder: Uri): Promise<Job> {
    let config = await getTemplateConfig();

    if (!config) {
        return Job.undone;
    }

    try {
        if (isLocalTemplateConfig(config)) {
            await copyLocalFolder(config, targetFolder);
        } else if (isRemoteTemplateConfig(config)) {
            await cloneGithubRepo(config, targetFolder);
        } else if (config.path === undefined) {
            throw new Error("未设置模板路径");
        } else {
            throw new Error("无效的模板类型：" + config.type);
        }
    } catch (error) {
        if (!isNativeError(error)) {
            throw error;
        }
        window.showErrorMessage("无法使用模板，因为" + error.message);
        return Job.undone;
    }

    return Job.done;
}

/**
 * @description: 获取模板配置对象。
 * @return {Promise<TemplateConfig | undefined>} 如果设置可能可用会返回配置对象，否则返回 `undefined` 。
 */
async function getTemplateConfig(): Promise<TemplateConfig | undefined> {
    let config: TemplateConfig | undefined = await workspace
        .getConfiguration("hamibot-assistant")
        .get("projectTemplate");

    if (!config || config.type === "disabled") {
        return undefined;
    }

    if (isTemporaryTemplateConfig(config)) {
        config = (await getTemplateConfigByInput())?.config;
    }

    return config;
}

async function copyLocalFolder(config: LocalTemplateConfig, targetFolder: Uri): Promise<void> {
    let sourceFolder: Uri = Uri.file("");

    // 路径检查格式
    validLocalpath(config.path);

    if (isAbsolute(config.path)) {
        sourceFolder = Uri.file(config.path);
    } else {
        let extensionUri = extensions
            .getExtension("batu1579.hamibot-assistant")
            ?.extensionUri!;
        sourceFolder = Uri.joinPath(extensionUri, config.path);
    }

    // 检查模板文件夹是否存在
    if (!existsSync(sourceFolder.fsPath)) {
        throw new Error(`模板文件夹不存在`);
    }

    await workspace.fs.copy(sourceFolder, targetFolder, {
        overwrite: true,
    });
}

function isCloneTask(task: Task) {
    return task.definition.type === "clone-template";
}

async function executeCloneTask(task: Task): Promise<void> {
    const EXECUTION = await tasks.executeTask(task);

    return new Promise<void>((resolve) => {
        let disposable = tasks.onDidEndTask((event) => {
            if (isCloneTask(event.execution.task)) {
                disposable.dispose();
                resolve();
            }
        });
    });
}

async function cloneGithubRepo(config: RemoteTemplateConfig, targetFolder: Uri): Promise<void> {
    // 检查仓库路径格式
    config.path = validGithubUrl(config.path);

    let taskDefinition: GitTaskDefinition = {
        type: "clone-template",
        repoUrl: config.path,
        targetPath: targetFolder.fsPath
    };

    let task = new Task(taskDefinition, TaskScope.Workspace, "克隆项目模板", "git",
        new ShellExecution(
            `git clone ${config.path} .`,
            { cwd: targetFolder.fsPath }
        )
    );

    await executeCloneTask(task);
}

export async function getTemplateConfigByInput(...extraOptions: QuickPickTemplate[]): Promise<QuickPickTemplate | undefined> {
    let options: QuickPickTemplate[] = TEMPLATE_OPTIONS.map((v) => ({
        label: (v.config.type === TemplateType.local ? "💻 [本地] " : "🌏 [远程] ") + v.name,
        detail: v.description,
        config: v.config
    }));
    let manualOption: QuickPickTemplate = {
        label: "👋 手动输入",
        detail: "手动输入模板地址"
    };
    options.push(manualOption, ...extraOptions);

    let choice = await window.showQuickPick(options, { title: "选择模板" });

    if (choice && choice.label === manualOption.label) {
        choice.config = await getTemporaryTemplateByInput();
    }

    return choice;
}

async function getTemporaryTemplateByInput(): Promise<ExistTemplateConfig | undefined> {
    let type = await window.showQuickPick([
        {
            label: "💻 [本地模板]",
            detail: "存放本地模板的绝对路径",
            type: TemplateType.local,
        },
        {
            label: "🌏 [远程模板]",
            detail: "存放远程模板的 Github 仓库地址（ SSH/HTTPS ）",
            type: TemplateType.remote,
        }
    ], { title: "选择模板类型" });

    if (!type) {
        return undefined;
    }

    let isInputRemote = type.type === TemplateType.remote;
    let path = await window.showInputBox({
        title: isInputRemote ? "输入远程模板地址" : "输入本地模板路径",
        ignoreFocusOut: true,
        validateInput: isInputRemote ? validateGithubUrl : validateLocalPath
    });

    if (!path) {
        return undefined;
    }

    return {
        type: isInputRemote ? TemplateType.remote : TemplateType.remote,
        path: path
    };
}

async function validateGithubUrl(value: string): Promise<string | null> {
    return isGithubUrlValid(value) ? null : "只接受远程 Github 仓库地址（ SSH/HTTPS ）";
}

async function validateLocalPath(value: string): Promise<string | null> {
    return isAbsolute(value) ? null : "只接受本地绝对路径";
}

const TEMPLATE_OPTIONS: ProjectTemplate[] = [
    {
        name: "单文件模板（ JS ）",
        description: "简易的单文件项目模板",
        config: {
            type: TemplateType.local,
            path: "./template/simpleJS"
        }
    },
    {
        name: "多文件模板（ TS ）",
        description: "远程多文件模板，但是需要配置过 npm 和 Git",
        config: {
            type: TemplateType.remote,
            path: "git@github.com:batu1579/hamibot-starter.git"
        }
    },
];
