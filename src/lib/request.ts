import axios from 'axios';
import * as FormData from 'form-data';

import { basename } from "path";
import { readFileSync } from 'fs';
import { extensions, workspace } from 'vscode';
import { AxiosRequestHeaders, AxiosRequestConfig } from "axios";

const baseUrl = 'https://hamibot.cn/api';
const backupUrl = 'https://api.hamibot.com';

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

    config.headers = getHeaders(config.headers);
    try {
        config.baseURL = url ?? baseUrl;
        return (await axios.request(config)).data;
    } catch (err: any) {
        if (err.status >= 500 && config.baseURL === baseUrl) {
            // 如果是服务器异常尝试访问备用域名
            return await requests(config, backupUrl);
        }

        switch (err.status) {
            case 401:
                // Token 有误
                throw new Error("开发者令牌无效，请重新设置！");

            case 422:
                // 参数有误
                throw new Error("请求参数格式有误，请检查！");

            case 429:
                // 频率限制
                throw new Error("本月 API 调用次数已达上限！");

            case 400:
                // unknown error
                throw new Error("未知的客户端异常，请在仓库提交 issue");

            default:
                throw new Error("服务器异常，请向 Hamibot 官方反馈！");
        }
    }
}

/**
 * @description: 构造请求 headers ，统一添加开发者令牌。
 * @param {AxiosRequestHeaders} headers 额外的 headers 设置。
 * @return {AxiosRequestHeaders} 构造好的 headers 。
 */
function getHeaders(headers?: AxiosRequestHeaders): AxiosRequestHeaders {
    let version = extensions.getExtension('batu1579.hamibot-assistant')?.packageJSON?.version;
    let token: string | undefined = workspace.getConfiguration("hamibot-assistant").get('apiToken');

    // TODO： 验证 Token

    return {
        /* eslint-disable */
        'User-Agent': `hamibot-assistant ${version}`,
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        /* eslint-enable */
        ...headers
    };
}

interface FileInfo {
    path: string;
    type: string;
}
