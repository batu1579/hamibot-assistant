import { Uri, window, workspace } from "vscode";
import { updateProjectConfig } from "../lib/projectConfig";

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