import { Uri, window, workspace } from "vscode";
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