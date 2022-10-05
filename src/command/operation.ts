import { commands, Uri, window } from "vscode";

import { Script } from "../lib/hamibotApi";
import { HamibotConfig } from "../lib/projectConfig";
import { getExecuteRobotByInput, getProjectNameByInput } from "./projectConfig";

export async function uploadScript(): Promise<void> {
    let { scriptId, fileMark } = await global.currentConfig.getProjectConfig();

    if (!fileMark || !scriptId) {
        return;
    }

    let fileList: Uri[] = [];

    for (let mark in fileMark) {
        fileList.push(Uri.joinPath(
            global.currentConfig.workspaceUri,
            Object.getOwnPropertyDescriptor(fileMark, mark)?.value
        ));
    }

}

export async function initProject(): Promise<void> {
    let select = await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "新建项目",
        title: "选择项目路径"
    });

    if (!select) {
        return;
    }

    global.currentConfig = await HamibotConfig.newConfigFile(select[0]);

    // 设置项目名称
    let newProjectName = await getProjectNameByInput();
    let { _id } = await Script.createNewScript(newProjectName);

    if (!_id) {
        throw new Error('使用接口创建脚本失败');
    }

    // 设置调试机器人
    let robot = await getExecuteRobotByInput();

    // 保存设置
    global.currentConfig.updateProjectConfig({
        name: newProjectName,
        scriptId: _id,
        executeRobot: robot
    });

    // 打开文件夹
    await commands.executeCommand('vscode.openFolder', global.currentConfig.workspaceUri);
}
