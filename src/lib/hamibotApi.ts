import * as FormData from "form-data";
import { Uri, workspace } from "vscode";
import { basename, extname } from "path";

import { Request } from "./request";
import { RobotInfo } from "./projectConfig";
import { validRobotId, validScriptId } from "./valid";

export class Robot {
    private constructor() {}

    /**
     * @description: 获取机器人列表。
     * @return {Promise<RobotList>} 机器人列表。
     */
    static async getRobotList(): Promise<RobotList> {
        return Request.get<RobotList>("/v1/robots");
    }

    /**
     * @description: 获取机器人信息。
     * @param {string} robotId 机器人 ID 。
     * @return {Promise<RobotList>} 机器人的详细信息。
     */
    static async getRobotById(robotId: string): Promise<RobotItem> {
        // 校验机器人 ID 格式
        validRobotId(robotId);
        return Request.get<RobotItem>(`/v1/robots/${robotId}`);
    }

    /**
     * @description: 停止指定机器人正在运行的所有脚本。
     * @param {string} robotId 机器人 ID 。
     */
    static async stopRobotById(robotId: string): Promise<void> {
        // 校验机器人 ID 格式
        validRobotId(robotId);
        await Request.put(`/v1/robots/${robotId}/stop`);
    }

    /**
     * @description: 向机器人推送消息。
     * @param {string} robotId 机器人 ID 。
     * @param {PostMessage} msg 要推送的消息对象。
     * - `title` - 推送标题，最大长度为 128 。
     * - `text` - 推送内容，最大长度为 512 。
     */
    static async sendMessage(robotId: string, msg: PostMessage): Promise<void> {
        // 校验机器人 ID 格式
        validRobotId(robotId);
        await Request.post(`/v1/robots/${robotId}/messages`, msg);
    }

    /**
     * @description: 重命名机器人。
     * @param {string} robotId 机器人 ID 。
     * @param {string} newName 机器人的新名称。
     */
    static async rename(robotId: string, newName: string): Promise<void> {
        // 校验机器人 ID 格式
        validRobotId(robotId);
        await Request.put(`/v1/robots/${robotId}`, { name: newName });
    }
}

export interface RobotList {
    count: number;
    items: RobotItem[];
}

export interface RobotItem {
    /**
     * @description: 机器人 ID 。24 位 16 进制字符串。
     * @example 'a51d237e9af41ecc021c9ff6'
     */
    _id: string;

    /**
     * @description: 当前机器人是否在线。
     */
    online: boolean;

    /**
     * @description: 机器人标签。
     */
    tags: string[];

    /**
     * @description: 机器人名称。
     */
    name: string;

    /**
     * @description: 机器人生产厂家。
     * @example 'Xiaomi'
     */
    brand: string;

    /**
     * @description: 机器人型号。
     * @example 'MI 11'
     */
    model: string;
}

interface PostMessage {
    title: string;
    text: string;
}

export class Script {
    private constructor() {}

    /**
     * @description: 获取正在开发中的脚本列表。
     * @return {Promise<ScriptList>} 开发中的脚本列表。
     */
    static async getScriptList(): Promise<ScriptList> {
        return Request.get<ScriptList>("/v1/devscripts");
    }

    /**
     * @description: 获取脚本信息。
     * @param {string} scriptId 脚本 ID 。
     * @return {Promise<ScriptItem>} 脚本的详细信息。
     */
    static async getScriptById(scriptId: string): Promise<ScriptItem> {
        // 校验脚本 ID 格式
        validScriptId(scriptId);
        return Request.get<ScriptItem>(`/v1/devscripts/${scriptId}`);
    }

    /**
     * @description: 让指定机器人运行脚本。
     * @param {string} scriptId 脚本 ID 。
     * @param {RobotInfo} robots 机器人标记。
     * @param {object} scriptConfig 运行时加载的脚本配置。
     */
    static async runScript(
        scriptId: string,
        robots: RobotInfo[],
        scriptConfig?: object
    ): Promise<void> {
        // 校验脚本 ID 格式
        validScriptId(scriptId);

        // 校验机器人 ID 格式
        robots.forEach((value) => validRobotId(value._id));

        let data: any = { robots: robots };

        if (scriptConfig) {
            data.vars = scriptConfig;
        }

        await Request.post(`/v1/devscripts/${scriptId}/run`, data);
    }

    /**
     * @description: 让指定机器人停止运行脚本。
     * @param {string} scriptId 脚本 ID 。
     * @param {RobotInfo} robots 机器人标记。
     */
    static async stopScript(
        scriptId: string,
        robots: RobotInfo[]
    ): Promise<void> {
        // 校验脚本 ID 格式
        validScriptId(scriptId);

        // 校验机器人 ID 格式
        robots.forEach((value) => validRobotId(value._id));

        await Request.del(`/v1/devscripts/${scriptId}/run`, { robots: robots });
    }

    /**
     * @description: 创建新脚本。
     * @param {string} scriptName 脚本名称。
     * @return {Promise<ScriptItem>} 创建脚本的详细信息。
     */
    static async createNewScript(scriptName: string): Promise<ScriptItem> {
        return Request.post<ScriptItem>(`/v1/devscripts`, { name: scriptName });
    }

    /**
     * @description: 修改脚本名称。
     * @param {string} scriptId 脚本 ID 。
     * @param {string} scriptName 新的脚本名称。
     */
    static async changeScriptName(
        scriptId: string,
        scriptName: string
    ): Promise<void> {
        await Request.put(`/v1/devscripts/${scriptId}`, { name: scriptName });
    }

    /**
     * @description: 上传脚本文件。
     * @param {string} scriptId 脚本 ID 。
     * @param {Uri} filesUri 要上传的文件的 Uri 。
     */
    static async uploadScript(
        scriptId: string,
        filesUri: Uri[]
    ): Promise<void> {
        // 校验脚本 ID 格式
        validScriptId(scriptId);

        const fileData = new FormData();

        let jobs: Promise<any>[] = [];
        for (let i = 0; i < filesUri.length; i++) {
            let file = Script.transUriToFileInfo(filesUri[i]);
            jobs.push(
                (async () => {
                    fileData.append(
                        "file",
                        await workspace.fs.readFile(file.uri),
                        {
                            contentType: file.fileType,
                            filename: basename(file.uri.fsPath),
                        }
                    );
                })()
            );
        }
        await Promise.all(jobs);

        await Request.put(`/v1/devscripts/${scriptId}/files`, fileData);
    }

    /**
     * @description: 删除指定脚本。
     * @param {string} scriptId 脚本 ID 。
     */
    static async deleteScript(scriptId: string): Promise<void> {
        // 校验脚本 ID 格式
        validScriptId(scriptId);
        await Request.del(`/v1/devscripts/${scriptId}`);
    }

    private static transUriToFileInfo(fileUri: Uri): FileInfo {
        let fileType: string;

        switch (extname(fileUri.fsPath)) {
            case ".json":
                fileType = "application/json";
                break;
            case ".js":
                fileType = "application/javascript";
                break;
            default:
                throw new Error(
                    `不支持上传文件类型： ${extname(fileUri.fsPath)} 。`
                );
        }

        return {
            uri: fileUri,
            fileType: fileType,
        };
    }
}

interface ScriptList {
    count: number;
    items: ScriptItem[];
}

interface ScriptItem {
    _id: string;
    name: string;
}

interface FileInfo {
    uri: Uri;
    fileType: string;
}
