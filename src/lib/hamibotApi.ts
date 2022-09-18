import { extname } from 'path';
import * as request from "./request";

export namespace Robot {
    /**
     * @description: 获取机器人列表。
     * @return {Promise<RobotList>} 机器人列表。
     */
    export async function getRobotList(): Promise<RobotList> {
        return await request.get<RobotList>('/v1/robots');
    }

    /**
     * @description: 获取机器人信息。
     * @param {string} robotId 机器人 ID 。
     * @return {Promise<RobotList>} 机器人的详细信息。
     */
    export async function getRobotById(robotId: string): Promise<RobotItem> {
        return await request.get<RobotItem>(`/v1/robots/${robotId}`);
    }

    /**
     * @description: 停止指定机器人正在运行的所有脚本。
     * @param {string} robotId 机器人 ID 。
     */
    export async function stopRobotById(robotId: string): Promise<void> {
        await request.put(`/v1/robots/${robotId}/stop`);
    }

    /**
     * @description: 向机器人推送消息。
     * @param {string} robotId 机器人 ID 。
     * @param {PostMessage} msg 要推送的消息对象。
     * - `title` - 推送标题，最大长度为 128 。
     * - `text` - 推送内容，最大长度为 512 。
     */
    export async function sendMessage(robotId: string, msg: PostMessage): Promise<void> {
        await request.post(`/v1/robots/${robotId}/messages`, msg);
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
}

export namespace Script {
    /**
     * @description: 获取正在开发中的脚本列表。
     * @return {Promise<ScriptList>} 开发中的脚本列表。
     */
    export async function getScriptList(): Promise<ScriptList> {
        return await request.get<ScriptList>('/v1/devscripts');
    }

    /**
     * @description: 获取脚本信息。
     * @param {string} scriptId 脚本 ID 。
     * @return {Promise<ScriptItem>} 脚本的详细信息。
     */
    export async function getScriptById(scriptId: string): Promise<ScriptItem> {
        return await request.get<ScriptItem>(`/v1/devscripts/${scriptId}`);
    }

    /**
     * @description: 让指定机器人运行脚本。
     * @param {string} scriptId 脚本 ID 。
     * @param {RobotMark} robots 机器人标记。
     * @param {object} scriptConfig 运行时加载的脚本配置。
     */
    export async function runScript(scriptId: string, robots: RobotMark[], scriptConfig?: object): Promise<void> {
        let data: any = { robots: robots };

        if (scriptConfig) {
            data.vars = scriptConfig;
        }

        await request.post(`/v1/devscripts/${scriptId}/run`, data);
    }

    /**
     * @description: 让指定机器人停止运行脚本。
     * @param {string} scriptId 脚本 ID 。
     * @param {RobotMark} robots 机器人标记。
     */
    export async function stopScript(scriptId: string, robots: RobotMark[]): Promise<void> {
        await request.del(`/v1/devscripts/${scriptId}/run`, { robots: robots });
    }

    /**
     * @description: 创建新脚本。
     * @param {string} scriptName 脚本名称。
     * @return {Promise<ScriptItem>} 创建脚本的详细信息。
     */
    export async function createNewScript(scriptName: string): Promise<ScriptItem> {
        return await request.post<ScriptItem>(`/v1/devscripts`, { name: scriptName });
    }

    /**
     * @description: 删除指定脚本。
     * @param {string} scriptId 脚本 ID 。
     */
    export async function deleteScript(scriptId: string): Promise<void> {
        await request.del(`/v1/devscripts/${scriptId}`);
    }

    interface ScriptList {
        count: number;
        items: ScriptItem[];
    }

    interface ScriptItem {
        _id: string;
        name: string;
    }

    interface RobotMark {
        _id: string;
        name: string;
    }
}