import { workspace, Uri } from "vscode";

interface ProjectConfig {
    name?: string,
    scriptId?: string,
    executeRobot?: RobotInfo,
    fileMark?: FileMarks
}

export interface RobotInfo {
    _id?: string,
    name?: string
}

interface FileMarks {
    configFile?: string,
    scriptFile?: string
}

type ConfigField = keyof ProjectConfig;

export class HamibotConfig {
    private workspaceUri: Uri | undefined;
    private static readonly configFileName = 'hamibot.config.json';
    private static readonly defaultConfig = {};

    private constructor(workspaceUri?: Uri) {
        this.workspaceUri = workspaceUri ?? HamibotConfig.getCurrentWorkspaceUri();
    }

    public static async newConfigFile(workspaceUri?: Uri, config?: ProjectConfig): Promise<HamibotConfig> {
        let configObject = new HamibotConfig(workspaceUri);

        if (configObject.workspaceUri) {
            // 检查是否存在配置文件（不存在则创建）
            await configObject.checkConfigFile(config ?? HamibotConfig.defaultConfig);
        }

        return configObject;
    }

    public isInProjectFolder(): boolean {
        return this.workspaceUri !== undefined;
    }

    public getWorkspaceUri(): Uri {
        if (!this.workspaceUri) {
            throw new Error('workspaceUri is required');
        }
        return this.workspaceUri;
    }

    /**
     * @description: 获取完整的项目设置对象。
     * @return {Promise<ProjectConfig>} 项目设置对象。
     */
    public async getProjectConfig(): Promise<ProjectConfig>;
    /**
     * @description: 获取项目设置中 `field` 字段对应的设置。
     * @param {T extends ConfigField} field 要获取的字段。
     * @return {Promise<ProjectConfig[T]>} `field` 字段对应的设置。
     */
    public async getProjectConfig<T extends ConfigField>(field: T): Promise<ProjectConfig[T]>;
    public async getProjectConfig<T extends ConfigField>(field?: T): Promise<ProjectConfig | ProjectConfig[T]> {
        let config = await this.readProjectConfig();
        return field ? config[field] : config;
    }

    /**
     * @description: 通过合并从配置文件中读取的项目设置，更新相应设置。
     * @param {ProjectConfig} newConfig 新的设置项。
     */
    public async updateProjectConfig(newConfig: ProjectConfig): Promise<void>;
    /**
     * @description: 通过合并传入的 `oldConfig` 和 `newConfig` 对象来更新配置文件中的设置。
     * @param {ProjectConfig} newConfig 新的设置项。
     * @param {ProjectConfig} oldConfig 原有的设置项，主要用来避免频繁读取配置文件。但是如果读取时间和使用时间相隔很久，则建议直接从文件中重新读取，防止期间手动修改过配置文件。
     */
    public async updateProjectConfig(newConfig: ProjectConfig, oldConfig: ProjectConfig): Promise<void>;
    public async updateProjectConfig(newConfig: ProjectConfig, oldConfig?: ProjectConfig): Promise<void> {
        oldConfig = oldConfig ?? await this.getProjectConfig();
        this.writeProjectConfig(HamibotConfig.mergeConfig(oldConfig, newConfig));
    }

    /**
     * @description: 获取当前工作区的 `Uri` 。
     * @return {Uri} 工作区 `Uri` 。
     */
    private static getCurrentWorkspaceUri(): Uri | undefined {
        const workspaceFolders = workspace.workspaceFolders;
        return workspaceFolders ? workspaceFolders[0].uri : undefined;
    }

    /**
     * @description: 从配置文件中读取项目设置。
     * @return {Promise<ProjectConfig>} 项目设置对象。
     */
    private async readProjectConfig(): Promise<ProjectConfig> {
        let configDocument = await workspace.fs.readFile(
            Uri.joinPath(this.getWorkspaceUri(), HamibotConfig.configFileName)
        );
        return JSON.parse(configDocument.toString());
    }

    /**
     * @description: 保存设置到项目配置文件。
     * @param {ProjectConfig} config 项目设置对象。
     */
    private async writeProjectConfig(config: ProjectConfig): Promise<void> {
        await workspace.fs.writeFile(
            Uri.joinPath(this.getWorkspaceUri(), HamibotConfig.configFileName),
            Buffer.from(JSON.stringify(config, null, 4))
        );
    }

    private async checkConfigFile(config: ProjectConfig): Promise<void> {
        try {
            let oldConfig = await this.getProjectConfig();
            await this.updateProjectConfig(config, oldConfig);
        } catch (error: any) {
            if (error.code !== 'FileNotFound') {
                throw error;
            }
            await this.writeProjectConfig(config);
        }
    }

    /**
     * @description: 合并两个对象，而不是像 `Object.assign()` 只拷贝第一层。
     * @param {any} target 要合并的目标。
     * @param {any} origin 要更新的数据。
     * @return {any} 合并后的 `target` 。
     */
    // TODO：修改返回值类型与 target 相同
    private static mergeConfig(target: any, origin: any): any {
        if (typeof target !== "object" || typeof origin === null) {
            return target;
        }

        for (const key in origin) {
            let copy = origin[key];

            if (typeof copy === "object" && target.hasOwnProperty(key)) {
                target[key] = HamibotConfig.mergeConfig(target[key], copy);
            } else {
                target[key] = copy;
            }
        }

        return target;
    }
}
