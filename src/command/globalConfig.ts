import { window, workspace } from 'vscode';

import { Job } from './command';
import { isTokenValid } from '../lib/valid';
import { getExecuteRobotByInput } from './projectConfig';
import { DEFAULT_TEMPLATES, TemplateType } from '../lib/projectTemplate';

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

export async function choseDefaultTemplate(): Promise<Job> {
    let choose = await window.showQuickPick(DEFAULT_TEMPLATES.map((value) => {
        let mark;
        switch (value.config.type) {
            case TemplateType.local:
                mark = "💻 [本地] ";
                break;
            case TemplateType.remote:
                mark = "🌏 [远程] ";
                break;
            default:
                mark = "";
        }

        return {
            label: mark + value.name,
            detail: value.description,
            config: value.config
        };
    }));

    if (!choose) {
        return Job.undone;
    }

    await workspace
        .getConfiguration("hamibot-assistant")
        .update("projectTemplate", choose.config, true);
    return Job.done;
}
