import { commands, Uri, window, workspace } from "vscode";

import { Script } from "../lib/hamibotApi";
import { HamibotConfig, RobotInfo } from "../lib/projectConfig";
import { Job } from "./command";
import { getExecuteRobotByInput, getProjectNameByInput } from "./projectConfig";

export async function uploadScript(): Promise<Job> {
    let { scriptId, fileMark } = await global.currentConfig.getProjectConfig();

    if (!fileMark) {
        throw new Error("未标记脚本相关文件");
    }

    if (!scriptId) {
        throw new Error("请填入脚本 ID 后重试");
    }

    let fileList: Uri[] = [];

    for (let mark in fileMark) {
        fileList.push(Uri.joinPath(
            global.currentConfig.getWorkspaceUri(),
            Object.getOwnPropertyDescriptor(fileMark, mark)?.value
        ));
    }

    // 保存文件并上传
    await window.activeTextEditor?.document.save();
    await Script.uploadScript(scriptId, fileList);

    return Job.done;
}

export async function uploadAndRunScript(): Promise<Job> {
    let { scriptId, executeRobot } = await global.currentConfig.getProjectConfig();

    executeRobot = executeRobot ?? await workspace.getConfiguration("hamibot-assistant").get("defaultExecuteRobot");

    if (!executeRobot) {
        throw new Error("请填入测试脚本机器人的信息");
    }

    await uploadScript();
    await Script.runScript(scriptId!, [executeRobot]);

    return Job.done;
}

export async function initProject(): Promise<Job> {
    let select = await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "新建项目",
        title: "选择项目路径"
    });
    if (!select) {
        return Job.undone;
    }

    global.currentConfig = await HamibotConfig.newConfigFile(select[0]);

    // 设置项目名称
    let newProjectName = await getProjectNameByInput();
    if (!newProjectName) {
        return Job.undone;
    }

    let { _id } = await Script.createNewScript(newProjectName);
    if (!_id) {
        throw new Error('使用接口创建脚本失败');
    }

    // 设置调试机器人
    let defaultRobot: RobotInfo | undefined = await workspace.getConfiguration("hamibot-assistant").get("defaultExecuteRobot");
    let robot = defaultRobot ? defaultRobot : await getExecuteRobotByInput();

    // 保存设置
    await global.currentConfig.updateProjectConfig({
        name: newProjectName,
        scriptId: _id,
        executeRobot: robot
    });

    // 打开文件夹
    commands.executeCommand('vscode.openFolder', global.currentConfig.getWorkspaceUri());

    return Job.done;
}
