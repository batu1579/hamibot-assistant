import { Uri, window, workspace } from "vscode";
import { updateProjectConfig } from "../lib/projectConfig";

export async function setProjectName() {
    let newName = await window.showInputBox({
        title: "项目名称",
        prompt: "请输入新的项目名称"
    });
    if (newName) {
        updateProjectConfig({ name: newName });
    }
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