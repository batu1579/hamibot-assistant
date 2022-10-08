import { window, workspace } from 'vscode';

import { Job } from './command';
import { getExecuteRobotByInput } from './projectConfig';

export async function setApiToken(): Promise<Job> {
    let token = await window.showInputBox({
        title: "输入开发者令牌",
        ignoreFocusOut: true
    });

    if (!token) {
        return Job.undone;
    }

    workspace.getConfiguration("hamibot-assistant").update("ApiToken", token, true);
    return Job.done;
}

export async function setShowOfflineRobot(): Promise<Job> {
    let choose = await window.showQuickPick(["是", "否"], {
        title: "显示离线机器人"
    });

    if (!choose) {
        return Job.undone;
    }

    workspace.getConfiguration("hamibot-assistant").update("OfflineRobot", choose === "是", true);
    return Job.done;
}

export async function setDefaultExecuteRobot(): Promise<Job> {
    let robot = await getExecuteRobotByInput();

    if (!robot) {
        return Job.undone;
    }

    workspace.getConfiguration("hamibot-assistant.defaultExecuteRobot")
        .update("robotInfo", {
            name: robot.name,
            id: robot._id
        }, true);

    return Job.done;
}
