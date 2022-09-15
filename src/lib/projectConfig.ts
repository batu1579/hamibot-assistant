import { workspace, Uri } from "vscode";

interface ProjectConfig {
    name?: string,
    id?: string,
    lastRobot?: RobotInfo,
    fileMark?: {
        configFile?: string,
        scriptFile?: string
    }
}

interface RobotInfo {
    id?: string,
    name?: string
}

const CONFIG_FILENAME = 'hamibot.config.json';

/**
 * @description: 获取当前项目设置。
 * @return {ProjectConfig} 项目设置对象。
 */
export async function getProjectConfig(): Promise<ProjectConfig> {
    let configDocument = await workspace.fs.readFile(getConfigFileUri());
    return JSON.parse(configDocument.toString());
}

/**
 * @description: 更新项目设置文件（不存在会自动创建）。
 * @param {ProjectConfig} config 
 */
export async function updateProjectConfig(config: ProjectConfig): Promise<void> {
    config = Object.assign(await getProjectConfig(), config);
    workspace.fs.writeFile(
        getConfigFileUri(),
        Buffer.from(JSON.stringify(config, null, 4))
    );
}

function getConfigFileUri(): Uri {
    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('workspace.workspaceFolders must be provided');
    }
    return Uri.joinPath(workspaceFolders[0].uri, CONFIG_FILENAME);
}
