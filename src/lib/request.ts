import axios from 'axios';
import { commands, extensions, workspace } from 'vscode';
import { AxiosRequestHeaders, AxiosRequestConfig } from "axios";

import { validToken } from './valid';

const BASE_URL = 'https://api.hamibot.cn';
const BACKUP_URL = 'https://api.hamibot.com';

/**
 * @description: 向 hamibot 服务器发送 GET 请求。
 * @param {string} path 请求的路径。
 * @return {Promise<DataType>} 服务器返回的数据。
 */
export async function get<DataType extends object>(path: string): Promise<DataType> {
    return requests<DataType>({
        url: path,
        method: 'GET'
    });
}

/**
 * @description: 向 hamibot 服务器发送 POST 请求。
 * @param {string} path 请求的路径。
 * @param {object} data 请求附带的数据。
 * @return {Promise<DataType>} 服务器返回的数据。
 */
export async function post<DataType extends object>(path: string, data: object): Promise<DataType> {
    return requests<DataType>({
        url: path,
        method: 'POST',
        data: data
    });
}

/**
 * @description: 向 hamibot 服务器发送 PUT 请求。
 * @param {string} path 请求的路径。
 * @param {object} data 请求附带的数据。
 * @return {Promise<DataType>} 服务器返回的数据。
 */
export async function put<DataType extends object>(path: string, data?: object): Promise<DataType> {
    return requests<DataType>({
        url: path,
        method: 'PUT',
        data: data
    });
}

/**
 * @description: 向 hamibot 服务器发送 DELETE 请求。
 * @param {string} path 请求的路径。
 * @return {Promise<DataType>} 服务器返回的数据。
 */
export async function del<DataType extends object>(path: string, data?: object): Promise<DataType> {
    return requests<DataType>({
        url: path,
        method: 'DELETE',
        data: data
    });
}

/**
 * @description: 向 hamibot 服务器发送请求。
 * @param {AxiosRequestConfig} config 请求配置。
 * @return {Promise<DataType>} 发送后服务器返回的数据。
 */
async function requests<DataType>(config: AxiosRequestConfig, url?: string): Promise<DataType> {

    config.headers = await getHeaders(config.headers);
    try {
        config.baseURL = url ?? BASE_URL;
        return (await axios.request(config)).data;
    } catch (error: any) {
        let stateCode = error.response.status;

        if (error.code === "ENOTFOUND") {
            throw new Error("无法连接到服务器，请检查网络后重试！");
        } else if (stateCode >= 400 && stateCode < 500) {
            switch (stateCode) {
                case 401:
                    // Token 有误
                    commands.executeCommand('hamibot-assistant.setApiToken');
                    throw new Error("开发者令牌无效，请重新设置！");

                case 422:
                    // 参数有误
                    throw new Error("请求参数格式有误，请检查！");

                case 429:
                    // 频率限制
                    throw new Error("本月 API 调用次数已达上限！");

                default:
                    throw new Error(`未知的客户端异常，请在仓库提交 issue 。详细信息：${error.message}`);
            }
        } else if (stateCode >= 500) {
            if (config.baseURL === BASE_URL) {
                // 如果是服务器异常尝试访问备用域名
                return requests(config, BACKUP_URL);
            } else {
                throw new Error("服务器异常，请向 Hamibot 官方反馈！");
            }
        } else {
            throw new Error(`未知异常，请在仓库提交 issue 。详细信息：${error.message}`);
        }
    }
}

/**
 * @description: 构造请求 headers ，统一添加开发者令牌。
 * @param {AxiosRequestHeaders} headers 额外的 headers 设置。
 * @return {AxiosRequestHeaders} 构造好的 headers 。
 */
async function getHeaders(headers?: AxiosRequestHeaders): Promise<AxiosRequestHeaders> {
    let version = extensions.getExtension('batu1579.hamibot-assistant')?.packageJSON?.version;
    let token = validToken(
        await workspace
            .getConfiguration("hamibot-assistant")
            .get('apiToken')
    );

    return {
        /* eslint-disable */
        'User-Agent': `hamibot-assistant ${version}`,
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        /* eslint-enable */
        ...headers
    };
}
