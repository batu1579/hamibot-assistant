import { QuickPickItem, Uri, window, workspace } from "vscode";

import { Robot } from "../lib/hamibotApi";
import { updateProjectConfig } from "../lib/projectConfig";

export async function setProjectName(step: number, totalStep: number): Promise<void> {
    let widget = window.createInputBox();
    widget.title = "项目名称";
    widget.prompt = "请输入新的项目名称";
    widget.step = step;
    widget.totalSteps = totalStep;

    widget.onDidAccept(() => {
        if (widget.value) {
            updateProjectConfig({name: widget.value});
        }
        widget.dispose();
    });

    widget.show();
}

export async function markScriptFile(uri: Uri): Promise<void> {
    updateProjectConfig({
        fileMark:
        {
            scriptFile: workspace.asRelativePath(uri)
        }
    });
}

export async function markConfigFile(uri: Uri): Promise<void> {
    updateProjectConfig({
        fileMark:
        {
            configFile: workspace.asRelativePath(uri)
        }
    });
}

export function setExecuteRobot(step: number, totalStep: number): void {
    let widget = window.createQuickPick<RobotQuickPickItem | QuickPickItem>();
    widget.title = "选择调试机器人";
    widget.matchOnDetail = true;
    widget.step = step;
    widget.totalSteps = totalStep;
    widget.show();

    const refreshItems = async () => {
        widget.items = [];
        widget.busy = true;
        widget.items = [...(await getQuickPickList()), {
            label: "🔃 刷新",
            detail: "重新获取机器人列表",
            alwaysShow: true,
        }];
        widget.busy = false;
    };

    widget.onDidAccept(() => {
        let item = widget.activeItems[0];

        if (isRobotQuickPickItem(item)) {
            updateProjectConfig({ lastRobot: item.robotInfo });
            widget.dispose();
        } else {
            refreshItems();
        }
    });

    refreshItems();
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

        robotList.push({
            label: `${item.online ? "🟢 [在线]" : "🔴 [离线]"} ${item.name}`,
            detail: `${item.tags.length === 0 ? "" : "[ " + item.tags + " ]"}${item.brand} ${item.model}`,
            robotInfo: item
        });
    }

    return robotList;
}

interface RobotQuickPickItem extends QuickPickItem {
    robotInfo: {
        _id: string;
        name: string;
    }
}
