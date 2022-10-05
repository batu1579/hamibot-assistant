import { QuickInput, QuickPick, QuickPickItem, Uri, window, workspace } from "vscode";

import { Robot } from "../lib/hamibotApi";
import { RobotInfo } from "../lib/projectConfig";

export async function getProjectNameByInput(): Promise<string> {
    let projectName = await window.showInputBox({
        title: "修改项目名称",
        prompt: "请输入新的项目名称",
        placeHolder: "Untitled Project"
    });
    return projectName ?? "Untitled Project";
}

export async function setProjectName(): Promise<string> {
    let projectName = await getProjectNameByInput();
    await global.currentConfig.updateProjectConfig({ name: projectName });
    return projectName;
}

export async function markScriptFile(uri: Uri): Promise<void> {
    await global.currentConfig.updateProjectConfig({
        fileMark: {
            scriptFile: workspace.asRelativePath(uri)
        }
    });
}

export async function markConfigFile(uri: Uri): Promise<void> {
    await global.currentConfig.updateProjectConfig({
        fileMark: {
            configFile: workspace.asRelativePath(uri)
        }
    });
}

export async function getExecuteRobotByInput(): Promise<RobotInfo> {
    while (true) {
        let robot = await window.showQuickPick(
            [...(await getQuickPickList()), {
                label: "🔃 刷新",
                detail: "重新获取机器人列表",
                alwaysShow: true,
            }],
            {
                title: "选择调试机器人",
                matchOnDetail: true,
            }
        );

        if (robot && isRobotQuickPickItem(robot)) {
            return robot.robotInfo;
        }
    }
}

export async function setExecuteRobot(): Promise<RobotInfo> {
    let robot = await getExecuteRobotByInput();
    await global.currentConfig.updateProjectConfig({ executeRobot: robot });
    return robot;
}

function isRobotQuickPickItem(item: RobotQuickPickItem | QuickPickItem): item is RobotQuickPickItem {
    return "robotInfo" in item;
}

async function getQuickPickList(): Promise<RobotQuickPickItem[]> {
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
    robotInfo: RobotInfo
}
