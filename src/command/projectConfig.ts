import {
    Uri,
    window,
    workspace,
    ThemeIcon,
    QuickPick,
    QuickPickItem,
} from "vscode";

import { Job } from "./command";
import { RobotInfo } from "../lib/projectConfig";
import { Robot, Script } from "../lib/hamibotApi";

export async function getProjectNameByInput(): Promise<string | undefined> {
    let projectName = await window.showInputBox({
        title: "设置项目名称",
        prompt: "请输入新的项目名称"
    });
    return projectName;
}

export async function setProjectName(): Promise<Job> {
    let projectName = await getProjectNameByInput();
    let { scriptId } = await global.currentConfig.getProjectConfig();

    if (!projectName) {
        return Job.undone;
    }

    // 更新远程名称
    await Script.changeScriptName(scriptId!, projectName);

    // 更新本地名称
    await global.currentConfig.updateProjectConfig({ name: projectName });

    return Job.done;
}

export async function markScriptFile(uri: Uri): Promise<Job> {
    await global.currentConfig.updateProjectConfig({
        fileMark: {
            scriptFile: workspace.asRelativePath(uri)
        }
    });
    return Job.done;
}

export async function markConfigFile(uri: Uri): Promise<Job> {
    await global.currentConfig.updateProjectConfig({
        fileMark: {
            configFile: workspace.asRelativePath(uri)
        }
    });
    return Job.done;
}

async function loadQuickPickItem(dialog: QuickPick<RobotQuickPickItem>): Promise<void> {
    dialog.items = [];
    dialog.busy = true;

    await getQuickPickRobot().then((items) => {
        dialog.items = [...items, {
            label: "🔃 刷新",
            detail: "重新获取机器人列表",
            alwaysShow: true,
            robotInfo: undefined
        }];
        dialog.busy = false;
    }).catch((error) => {
        dialog.hide();
        throw error;
    });
}

export async function getExecuteRobotByInput(): Promise<RobotInfo | undefined> {
    const dialog = window.createQuickPick<RobotQuickPickItem>();
    dialog.title = "选择调试机器人";
    dialog.matchOnDetail = true;

    dialog.onDidTriggerItemButton(async (event) => {
        let robotInfo = event.item.robotInfo!;
        let name = await window.showInputBox({
            title: "新机器人名称",
            value: robotInfo.name
        });

        if (name) {
            Robot.rename(robotInfo._id!, name);
        }

        dialog.show();
        await loadQuickPickItem(dialog);
    });

    dialog.onDidAccept(() => {
        let item = dialog.selectedItems[0];
        if (item.alwaysShow === true) {
            loadQuickPickItem(dialog);
        } else {
            dialog.hide();
        }
    });

    // 第一次显示时获取选项
    dialog.show();
    await loadQuickPickItem(dialog);

    return new Promise<RobotInfo | undefined>((resolve) => {
        dialog.onDidHide(() => {
            if (dialog.selectedItems.length !== 0) {
                resolve(dialog.selectedItems[0].robotInfo);
            } else {
                resolve(undefined);
            }
            dialog.dispose();
        });
    });
}

export async function setExecuteRobot(): Promise<Job> {
    let robot = await getExecuteRobotByInput();

    if (!robot) {
        return Job.undone;
    }

    await global.currentConfig.updateProjectConfig({ executeRobot: robot });
    return Job.done;
}

async function getQuickPickRobot(): Promise<RobotQuickPickItem[]> {
    let robotList: RobotQuickPickItem[] = [];
    let showOffline: boolean = workspace.getConfiguration("hamibot-assistant").get("showOfflineRobot")!;

    for (let item of (await Robot.getRobotList()).items) {
        // 设置为不显示离线时跳过离线的机器人
        if (!showOffline && !item.online) {
            continue;
        }

        let { _id, name, tags } = item;
        robotList.push({
            label: `${item.online ? "🟢 [在线]" : "🔴 [离线]"} ${name}`,
            detail: `${tags.length === 0 ? "" : "[ " + tags + " ]"}${item.brand} ${item.model}`,
            robotInfo: {
                _id: _id,
                name: name,
            },
            buttons: [{
                iconPath: new ThemeIcon("settings-edit")
            }]
        });
    }

    return robotList;
}

interface RobotQuickPickItem extends QuickPickItem {
    robotInfo?: RobotInfo
}
