import { window, workspace } from 'vscode';

export function setApiToken(): void {
    window.showInputBox({
        title: "输入开发者令牌",
        ignoreFocusOut: true
    }).then((token) => {
        workspace.getConfiguration("hamibot-assistant").update("ApiToken", token);
    });
}

export function setShowOfflineRobot(): void {
    window.showQuickPick(["是", "否"], {
        title: "显示离线机器人"
    }).then((value) => {
        let choose: boolean = value === "是" ? true : false;
        workspace.getConfiguration("hamibot-assistant").update("OfflineRobot", choose);
    });
}
