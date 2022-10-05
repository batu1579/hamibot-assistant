import { Uri } from "vscode";

import { Script } from "../lib/hamibotApi";

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

    Script.uploadScript(scriptId, fileList);
}
