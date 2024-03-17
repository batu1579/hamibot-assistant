import axios, { AxiosError, AxiosRequestConfig, isAxiosError } from "axios";
import { commands, extensions, workspace } from "vscode";

import { validToken } from "./valid";

export class Request {
    public static readonly baseUrls: Set<string> = new Set([
        "https://api.hamibot.cn",
        "https://api.hamibot.com",
    ]);

    /**
     * @description: 获取 headers 中的重要信息，包括：
     *
     * - `Authorization`
     * - `Content-Type`
     * - `User-Agent`
     *
     * @return {object} 包含信息的对象。
     */
    private static getHeaders(): object {
        const { packageJSON } = extensions.getExtension(
            "batu1579.hamibot-assistant"
        )!;
        const token = workspace
            .getConfiguration("hamibot-assistant")
            .get<string>("token");

        return {
            /* eslint-disable */
            Authorization: `token ${validToken(token)}`,
            "Content-Type": "application/json",
            "User-Agent": `hamibot-assistant ${packageJSON.version}`,
            /* eslint-enable */
        };
    }

    /**
     * @description: 处理请求中出现的异常，给出更精确的错误描述
     * @param {AxiosError} error 捕获到的请求异常对象
     */
    private static handleRequestError(error: AxiosError): never {
        if (!error.response) {
            throw new Error("未收到响应数据，请稍后重试");
        }

        const { status } = error.response;

        if (status >= 500) {
            throw new Error("服务器异常，请向 Hamibot 官方反馈！");
        }

        switch (status) {
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
            `未知错误码，请在仓库提交 issue 。详细信息：${error.message}`
        );
    }

    /**
     * @description: 向 hamibot 服务器发送请求。
     * @param {AxiosRequestConfig} config 请求配置。
     * @return {Promise<DataType>} 发送后服务器返回的数据。
     */
    private static async sendRequest<DataType>(
        config: AxiosRequestConfig
    ): Promise<DataType> {
        config.headers = { ...config.headers, ...this.getHeaders() };
        const requests = [...this.baseUrls].map((_url) =>
            axios.request<DataType>(config)
        );

        try {
            return (await Promise.race(requests)).data;
        } catch (error: any) {
            if (isAxiosError(error)) {
                this.handleRequestError(error);
            } else {
                throw new Error(
                    `未知异常，请在仓库提交 issue 。详细信息：${error.message}`
                );
            }
        }
    }

    /**
     * @description: 向 hamibot 服务器发送 GET 请求。
     * @param {string} path 请求的路径。
     * @param {AxiosHeaders} [headers] 额外的 HTTP 请求头。
     * @return {Promise<DataType>} 服务器返回的数据。
     */
    public static async get<DataType extends object>(
        path: string
    ): Promise<DataType> {
        return this.sendRequest<DataType>({
            url: path,
            method: "GET",
        });
    }

    /**
     * @description: 向 hamibot 服务器发送 POST 请求。
     * @param {string} path 请求的路径。
     * @param {object} data 请求附带的数据。
     * @return {Promise<DataType>} 服务器返回的数据。
     */
    public static async post<DataType extends object>(
        path: string,
        data: object
    ): Promise<DataType> {
        return this.sendRequest<DataType>({
            url: path,
            method: "POST",
            data: data,
        });
    }

    /**
     * @description: 向 hamibot 服务器发送 PUT 请求。
     * @param {string} path 请求的路径。
     * @param {object} data 请求附带的数据
     * @return {Promise<DataType>} 服务器返回的数据。
     */
    public static async put<DataType extends object>(
        path: string,
        data?: object
    ): Promise<DataType> {
        return this.sendRequest<DataType>({
            url: path,
            method: "PUT",
            data: data,
        });
    }

    /**
     * @description: 向 hamibot 服务器发送 DELETE 请求。
     * @param {string} path 请求的路径。
     * @param {object} data 请求附带的数据。
     * @return {Promise<DataType>} 服务器返回的数据。
     */
    public static async del<DataType extends object>(
        path: string,
        data?: object
    ): Promise<DataType> {
        return this.sendRequest<DataType>({
            url: path,
            method: "DELETE",
            data: data,
        });
    }
}
