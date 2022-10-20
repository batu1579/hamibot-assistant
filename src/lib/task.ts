import {
    Uri,
    Task,
    tasks,
    TaskScope,
    TaskDefinition,
    ShellExecution,
} from "vscode";

import { validBatchFilePath, validGithubUrl } from "./valid";

export async function cloneGithubRepo(templatePath: string, targetFolder: Uri): Promise<void> {
    // 检查仓库路径格式
    validGithubUrl(templatePath);

    let taskDefinition: GitTaskDefinition = {
        type: "clone-template",
        repoUrl: templatePath,
        targetPath: targetFolder.fsPath
    };

    let cloneTask = new Task(taskDefinition, TaskScope.Workspace, "clone", "git",
        new ShellExecution(
            `git clone ${templatePath} .`,
            { cwd: targetFolder.fsPath }
        )
    );

    await executeTask(cloneTask, (task) => task.definition.type === "clone-template");
}

export async function executeTemplateScript(batchFilePath: string, targetFolder: Uri): Promise<void> {
    // 检查批处理文件路径格式
    validBatchFilePath(batchFilePath);

    let taskDefinition: ScriptTaskDefinition = {
        type: "execute-batch",
        batchFilePath: batchFilePath,
        targetPath: targetFolder.fsPath
    };

    let batchTask = new Task(taskDefinition, TaskScope.Workspace, "execute-batch", "bash",
        new ShellExecution(
            batchFilePath,
            { cwd: targetFolder.fsPath }
        )
    );

    await executeTask(batchTask, (task) => task.definition.type === "execute-batch");
}

const BUILD_TASK_IDENTIFIER = (task: Task) => task.group?.isDefault === true;

async function getBuildTasks(): Promise<Task[]> {
    return new Promise<Task[]>(resolve => {
        tasks.fetchTasks().then((tasks) => {
            resolve(tasks.filter(BUILD_TASK_IDENTIFIER));
        });
    });
}

export async function buildScript(): Promise<void> {
    let bulidTasks: Task[] = await getBuildTasks();

    if (bulidTasks.length <= 0) {
        return;
    }

    await executeTask(bulidTasks[0], BUILD_TASK_IDENTIFIER);
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
    type: "execute-batch";
    batchFilePath: string;
    targetPath: string;
}
