import { commands, Uri, window, workspace } from "vscode";

import { Job } from "./command";
import { buildScript } from "../lib/task";
import { Script } from "../lib/hamibotApi";
import { isRobotIdValid } from "../lib/valid";
import { HamibotConfig, RobotInfo } from "../lib/projectConfig";
import { initTemplate, useTemplate } from "../lib/projectTemplate";
import { getExecuteRobotByInput, getProjectNameByInput } from "./projectConfig";

export async function uploadScript(): Promise<Job> {
    let { scriptId, fileMark } = await global.currentConfig.getProjectConfig();

    // 保存文件
    await window.activeTextEditor?.document.save();
    // 执行构建任务
    await buildScript();

    let fileList: Uri[] = [];

    for (let mark in fileMark) {
        fileList.push(Uri.joinPath(
            global.currentConfig.getWorkspaceUri(),
            Object.getOwnPropertyDescriptor(fileMark, mark)?.value
        ));
    }

    // 上传
    await Script.uploadScript(scriptId!, fileList);

    return Job.done;
}

export async function uploadAndRunScript(): Promise<Job> {
    let { scriptId, executeRobot } = await global.currentConfig.getProjectConfig();

    executeRobot = executeRobot ?? await getDefaultExecuteRobot();

    if (!executeRobot) {
        throw new Error("未找到可用的调试机器人设置");
    }

    await uploadScript();
    await Script.runScript(scriptId!, [executeRobot]);

    return Job.done;
}

export async function initProject(): Promise<Job> {
    let folderUri = await getFolderUriByInput();
    if (!folderUri) {
        return Job.undone;
    }

    // 使用项目模板
    await useTemplate(folderUri);

    global.currentConfig = await HamibotConfig.newConfigFile(folderUri);

    // 设置项目名称
    let newProjectName = await getProjectNameByInput();
    if (!newProjectName) {
        return Job.undone;
    }

    let { _id: scriptId } = await Script.createNewScript(newProjectName);
    if (!scriptId) {
        throw new Error('使用接口创建脚本失败');
    }

    // 设置调试机器人
    let robot = (await getDefaultExecuteRobot()) ?? (await getExecuteRobotByInput());

    // 保存设置
    await global.currentConfig.updateProjectConfig({
        name: newProjectName,
        scriptId: scriptId,
        executeRobot: robot
    });

    // 初始化模板
    await initTemplate(folderUri);

    // 打开文件夹
    commands.executeCommand('vscode.openFolder', global.currentConfig.getWorkspaceUri());

    return Job.done;
}

async function getFolderUriByInput(): Promise<Uri | undefined> {
    let select = await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "在此新建项目",
        title: "选择项目路径"
    });
    return select ? select[0] : select;
}

export async function stopScript(): Promise<Job> {
    let { scriptId, executeRobot } = await global.currentConfig.getProjectConfig();
    await Script.stopScript(scriptId!, [executeRobot!]);
    return Job.done;
}

async function getDefaultExecuteRobot(): Promise<RobotInfo | undefined> {
    let enableDefaultRobot: boolean | undefined = await workspace
        .getConfiguration("hamibot-assistant.defaultExecuteRobot")
        .get("enable");

    if (!enableDefaultRobot) {
        return undefined;
    }

    let robotName: string | undefined = await workspace
        .getConfiguration("hamibot-assistant.defaultExecuteRobot")
        .get("robotInfo.name");
    let robotId: string | undefined = await workspace
        .getConfiguration("hamibot-assistant.defaultExecuteRobot")
        .get("robotInfo.id");

    if (!robotId || !isRobotIdValid(robotId)) {
        return undefined;
    }

    return {
        _id: robotId,
        name: robotName
    };
}
