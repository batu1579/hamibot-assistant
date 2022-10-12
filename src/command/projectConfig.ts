import {
    Uri,
    window,
    workspace,
    QuickPick,
    QuickPickItem,
} from "vscode";

import { Job } from "./command";
import { Robot, Script } from "../lib/hamibotApi";
import { RobotInfo } from "../lib/projectConfig";

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

    // 更新本地名称
    await global.currentConfig.updateProjectConfig({ name: projectName });

    // 更新远程名称
    await Script.changeScriptName(scriptId!, projectName);

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

async function createQuickPickRobot(): Promise<QuickPick<RobotQuickPickItem>> {
    const dialog = window.createQuickPick<RobotQuickPickItem>();
    dialog.title = "选择调试机器人";
    dialog.matchOnDetail = true;

    const refreshItem = async () => {
        dialog.items = [];
        dialog.busy = true;
        dialog.items = [...(await getQuickPickRobot()), {
            label: "🔃 刷新",
            detail: "重新获取机器人列表",
            alwaysShow: true,
            robotInfo: undefined
        }];
        dialog.busy = false;
    };

    dialog.onDidAccept(() => {
        if (dialog.activeItems[0].robotInfo !== undefined) {
            dialog.hide();
        } else {
            refreshItem();
        }
    });

    dialog.show();
    await refreshItem();
    return dialog;
}

export async function getExecuteRobotByInput(): Promise<RobotInfo | undefined> {
    let dialog = await createQuickPickRobot();
    return new Promise<RobotInfo | undefined>((resolve) => {
        let disposable = dialog.onDidHide(() => {
            let select = dialog.selectedItems;
            dialog.dispose();
            resolve(select ? select[0].robotInfo : select);
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
            }
        });
    }

    return robotList;
}

interface RobotQuickPickItem extends QuickPickItem {
    robotInfo?: RobotInfo
}
