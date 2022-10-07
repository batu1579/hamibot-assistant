import { QuickPickItem, Uri, window, workspace } from "vscode";

import { Robot } from "../lib/hamibotApi";
import { RobotInfo } from "../lib/projectConfig";
import { isError } from "../lib/typeUtil";
import { Job } from "./command";

export async function getProjectNameByInput(): Promise<string | undefined> {
    let projectName = await window.showInputBox({
        title: "修改项目名称",
        prompt: "请输入新的项目名称"
    });
    return projectName;
}

export async function setProjectName(): Promise<Job> {
    try {
        let projectName = await getProjectNameByInput();
        await global.currentConfig.updateProjectConfig({ name: projectName });
        return Job.done;
    } catch (error) {
        if (!isError(error) || error.message !== "必须提供项目名称") {
            throw error;
        }
        return Job.undone;
    }
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

export async function getExecuteRobotByInput(): Promise<RobotInfo | undefined> {
    while (true) {
        let select = await window.showQuickPick(
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

        if (!select) {
            return undefined;
        } else if (isRobotQuickPickItem(select)) {
            return select.robotInfo;
        }
    }
}

export async function setExecuteRobot(): Promise<Job> {
    let robot = await getExecuteRobotByInput();
    if (robot) {
        await global.currentConfig.updateProjectConfig({ executeRobot: robot });
    }
    return Job.done;
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
