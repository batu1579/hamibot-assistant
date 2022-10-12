import { window, workspace } from 'vscode';

import { Job } from './command';
import { isTokenValid } from '../lib/valid';
import { getExecuteRobotByInput } from './projectConfig';
import { TemplateType, getTemplateConfigByInput } from '../lib/projectTemplate';

export async function setApiToken(): Promise<Job> {
    let token = await window.showInputBox({
        title: "输入开发者令牌",
        ignoreFocusOut: true,
        validateInput: (value) => {
            return isTokenValid(value) ? null : "需要是一个以 'hmp_' 开头加 64 位 16 进制字符串。";
        }
    });

    if (!token) {
        return Job.undone;
    }

    await workspace
        .getConfiguration("hamibot-assistant")
        .update("ApiToken", token, true);
    return Job.done;
}

export async function setShowOfflineRobot(): Promise<Job> {
    let choose = await window.showQuickPick(["是", "否"], {
        title: "显示离线机器人"
    });

    if (!choose) {
        return Job.undone;
    }

    await workspace
        .getConfiguration("hamibot-assistant")
        .update("OfflineRobot", choose === "是", true);
    return Job.done;
}

export async function setDefaultExecuteRobot(): Promise<Job> {
    let robot = await getExecuteRobotByInput();

    if (!robot) {
        return Job.undone;
    }

    await workspace
        .getConfiguration("hamibot-assistant.defaultExecuteRobot")
        .update("robotInfo", {
            name: robot.name,
            id: robot._id
        }, true);

    return Job.done;
}

export async function setProjectTemplate(): Promise<Job> {
    let options = await getTemplateConfigByInput({
        label: "⌨️ 创建时输入",
        detail: "每次创建新项目时手动输入",
        config: { type: TemplateType.askWhenCreate }
    },
    {
        label: "❌ 禁用模板",
        detail: "在创建新项目时不使用项目模板",
        config: { type: TemplateType.disable }
    });

    if (!options || !options.config) {
        return Job.undone;
    }

    await workspace
        .getConfiguration("hamibot-assistant")
        .update("projectTemplate", options.config, true);
    return Job.done;
}
