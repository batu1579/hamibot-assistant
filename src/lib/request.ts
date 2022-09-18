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
async function requests<DataType>(config: AxiosRequestConfig): Promise<DataType> {
    config.headers = getHeaders(config.headers);
    try {
        config.baseURL = baseUrl;
        return (await axios.request(config)).data;
    } catch (err: any) {
        // 如果是服务器问题就尝试访问另一个域名
        if (err.status >= 500) {
            config.baseURL = backupUrl;
            return (await axios.request(config)).data;
        }

        // TODO： 根据不同的状态码显示错误信息
        switch (err.status) {
            default:
                throw new Error(err);
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
