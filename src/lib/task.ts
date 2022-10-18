import {
    Uri,
    Task,
    tasks,
    TaskScope,
    TaskDefinition,
    ShellExecution,
} from "vscode";
import { existsSync } from "fs";

import { validGithubUrl } from "./valid";

export async function cloneGithubRepo(templatePath: string, targetFolder: Uri): Promise<void> {
    // 检查仓库路径格式
    templatePath = validGithubUrl(templatePath);

    let taskDefinition: GitTaskDefinition = {
        type: "clone-template",
        repoUrl: templatePath,
        targetPath: targetFolder.fsPath
    };

    let task = new Task(taskDefinition, TaskScope.Workspace, "clone", "git",
        new ShellExecution(
            `git clone ${templatePath} .`,
            { cwd: targetFolder.fsPath }
        )
    );

    await executeTask(task, (task) => task.definition.type === "clone-template");
}

export async function executeTemplateScript(scriptPath: string, targetFolder: Uri): Promise<void> {
    if (!existsSync(scriptPath) || !/\.bat/.test(scriptPath)) {
        return;
    }

    let taskDefinition: ScriptTaskDefinition = {
        type: "execute-script",
        scriptPath: scriptPath,
    };

    let task = new Task(taskDefinition, TaskScope.Workspace, "execute-script", "cmd",
        new ShellExecution(
            scriptPath,
            { cwd: targetFolder.fsPath }
        )
    );

    await executeTask(task, (task) => task.definition.type === "execute-script");
}

async function executeTask(task: Task, isTargetTask: TaskIdentifier): Promise<void> {
    const EXECUTION = await tasks.executeTask(task);

    return new Promise<void>((resolve) => {
        let disposable = tasks.onDidEndTask((event) => {
            if (isTargetTask(event.execution.task)) {
                disposable.dispose();
                resolve();
            }
        });
    });
}

type TaskIdentifier = (task: Task) => boolean;

interface GitTaskDefinition extends TaskDefinition {
    type: "clone-template";
    repoUrl: string;
    targetPath: string;
}

interface ScriptTaskDefinition extends TaskDefinition {
    type: "execute-script";
    scriptPath: string;
}
