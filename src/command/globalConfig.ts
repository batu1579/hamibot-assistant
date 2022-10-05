import { window, workspace } from 'vscode';
import { getExecuteRobotByInput } from './projectConfig';

export async function setApiToken(): Promise<void> {
    let token = await window.showInputBox({
        title: "输入开发者令牌",
        ignoreFocusOut: true
    });
    workspace.getConfiguration("hamibot-assistant").update("ApiToken", token);
}

export async function setShowOfflineRobot(): Promise<void> {
    let choose = await window.showQuickPick(["是", "否"], {
        title: "显示离线机器人"
    });
    workspace.getConfiguration("hamibot-assistant").update("OfflineRobot", choose === "是");
}

export async function setDefaultExecuteRobot(): Promise<void> {
    let robot = await getExecuteRobotByInput();
    workspace.getConfiguration("hamibot-assistant").update("defaultExecuteRobot", robot);
}
