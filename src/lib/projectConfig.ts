import { workspace, Uri } from "vscode";

interface ProjectConfig {
    name?: string,
    id?: string,
    lastRobot?: RobotInfo,
    fileMark?: FileMarks
}

interface RobotInfo {
    id?: string,
    name?: string
}

interface FileMarks {
    configFile?: string,
    scriptFile?: string
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
 * @description: 更新项目设置，可以合并更深层次的设置项
 * @param {ProjectConfig} newConfig 新的设置项。
 */
export async function updateProjectConfig(newConfig: ProjectConfig, oldConfig?: ProjectConfig): Promise<void> {
    let config = oldConfig ?? await getProjectConfig();

    // 合并新旧设置
    config = mergeObj(config, newConfig);
    saveProjectConfig(config);
}

/**
 * @description: 获取设置文件的 `Uri` 。
 * @return {Uri}
 */
export function getConfigFileUri(): Uri {
    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('workspace.workspaceFolders must be provided');
    }
    return Uri.joinPath(workspaceFolders[0].uri, CONFIG_FILENAME);
}

/**
 * @description: 保存项目设置文件，会覆盖以前的设置（不存在会自动创建）。
 * @param {ProjectConfig} config 项目设置对象。
 */
async function saveProjectConfig(config: ProjectConfig): Promise<void> {
    await workspace.fs.writeFile(
        getConfigFileUri(),
        Buffer.from(JSON.stringify(config, null, 4))
    );
}

/**
 * @description: 合并两个对象，而不是像 `Object.assign()` 只拷贝第一层。
 * @param {any} target 要合并的目标。
 * @param {any} origin 要更新的数据。
 * @return {any} 合并后的 `target` 。
 */
// TODO：修改返回值类型与 target 相同
function mergeObj(target: any, origin: any): any {
    if (typeof target !== "object" || typeof origin === null) {
        return target;
    }

    for (const key in origin) {
        let copy = origin[key];

        if (typeof copy === "object" && target.hasOwnProperty(key)) {
            target[key] = mergeObj(target[key], copy);
        } else {
            target[key] = copy;
        }
    }

    return target;
}
