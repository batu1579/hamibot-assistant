import axios, {
    AxiosRequestConfig,
    RawAxiosRequestHeaders,
    isAxiosError,
} from "axios";
import { commands, extensions, workspace } from "vscode";

import { validToken } from "./valid";

const BASE_URL = "https://api.hamibot.cn";
const BACKUP_URL = "https://api.hamibot.com";

/**
 * @description: 向 hamibot 服务器发送 GET 请求。
 * @param {string} path 请求的路径。
 * @param {RawAxiosRequestHeaders} [headers] 额外的 HTTP 请求头。
 * @return {Promise<DataType>} 服务器返回的数据。
 */
export async function get<DataType extends object>(
    path: string,
    headers?: RawAxiosRequestHeaders
): Promise<DataType> {
    return requests<DataType>({
        url: path,
        method: "GET",
        headers: await getHeaders(headers),
    });
}

/**
 * @description: 向 hamibot 服务器发送 POST 请求。
 * @param {string} path 请求的路径。
 * @param {object} data 请求附带的数据。
 * @param {RawAxiosRequestHeaders} [headers] 额外的 HTTP 请求头。
 * @return {Promise<DataType>} 服务器返回的数据。
 */
export async function post<DataType extends object>(
    path: string,
    data: object,
    headers?: RawAxiosRequestHeaders
): Promise<DataType> {
    return requests<DataType>({
        url: path,
        method: "POST",
        data: data,
        headers: await getHeaders(headers),
    });
}

/**
 * @description: 向 hamibot 服务器发送 PUT 请求。
 * @param {string} path 请求的路径。
 * @param {object} data 请求附带的数据
 * @param {RawAxiosRequestHeaders} [headers] 额外的 HTTP 请求头。。
 * @return {Promise<DataType>} 服务器返回的数据。
 */
export async function put<DataType extends object>(
    path: string,
    data?: object,
    headers?: RawAxiosRequestHeaders
): Promise<DataType> {
    return requests<DataType>({
        url: path,
        method: "PUT",
        data: data,
        headers: await getHeaders(headers),
    });
}

/**
 * @description: 向 hamibot 服务器发送 DELETE 请求。
 * @param {string} path 请求的路径。
 * @param {RawAxiosRequestHeaders} [headers] 额外的 HTTP 请求头。
 * @return {Promise<DataType>} 服务器返回的数据。
 */
export async function del<DataType extends object>(
    path: string,
    data?: object,
    headers?: RawAxiosRequestHeaders
): Promise<DataType> {
    return requests<DataType>({
        url: path,
        method: "DELETE",
        data: data,
        headers: await getHeaders(headers),
    });
}

/**
 * @description: 向 hamibot 服务器发送请求。
 * @param {AxiosRequestConfig} config 请求配置。
 * @return {Promise<DataType>} 发送后服务器返回的数据。
 */
async function requests<DataType>(
    config: AxiosRequestConfig
): Promise<DataType> {
    if (!config.baseURL) {
        config.baseURL = BASE_URL;
    }

    return axios
        .request<DataType>(config)
        .then((response) => response.data)
        .catch((error: any) => {
            if (!isAxiosError(error)) {
                throw new Error(
                    `未知异常，请在仓库提交 issue 。详细信息：${error.message}`
                );
            }

            if (!error.response) {
                throw new Error("未收到响应数据，请稍后重试");
            }

            let state = error.response.status;

            if (state >= 500) {
                if (config.baseURL === BASE_URL) {
                    // 如果是服务器异常尝试访问备用域名
                    config.baseURL = BACKUP_URL;
                    return requests(config);
                } else {
                    throw new Error("服务器异常，请向 Hamibot 官方反馈！");
                }
            }

            switch (state) {
                case 401:
                    // Token 有误
                    commands.executeCommand("hamibot-assistant.setApiToken");
                    throw new Error("开发者令牌无效，请重新设置！");

                case 422:
                    // 参数有误
                    throw new Error("请求参数格式有误，请检查！");

                case 429:
                    // 频率限制
                    throw new Error("本月 API 调用次数已达上限！");
            }

            throw new Error(
                `未知异常，请在仓库提交 issue 。详细信息：${error.message}`
            );
        });
}

/**
 * @description: 构造请求 headers ，统一添加开发者令牌。
 * @param {RawAxiosRequestHeaders} headers 额外的 headers 设置。
 * @return {RawAxiosRequestHeaders} 构造好的 headers 。
 */
async function getHeaders(
    headers?: RawAxiosRequestHeaders
): Promise<RawAxiosRequestHeaders> {
    let version = extensions.getExtension("batu1579.hamibot-assistant")
        ?.packageJSON?.version;
    let token = validToken(
        await workspace.getConfiguration("hamibot-assistant").get("apiToken")
    );

    return {
        /* eslint-disable */
        "User-Agent": `hamibot-assistant ${version}`,
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        /* eslint-enable */
        ...headers,
    };
}
