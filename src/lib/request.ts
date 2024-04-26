import axios, { AxiosError, AxiosRequestConfig, isAxiosError } from "axios";
import { commands, extensions, workspace } from "vscode";

import { validToken } from "./valid";
import * as FormData from "form-data";

export class RequestError extends Error {
    public readonly retriable: boolean;

    constructor(message: string, retriable: boolean = false) {
        super(message);
        this.name = "RequestError";
        this.retriable = retriable;
    }

    public static isRequestError(error: any): error is RequestError {
        return (
            error.name === "RequestError" &&
            typeof error.retriable === "boolean"
        );
    }

    public attachWith(error: Error): this {
        this.stack = error.stack;
        return this;
    }
}

export class Request {
    public static readonly baseUrls: string[] = [
        "https://api.hamibot.cn",
        "https://api.hamibot.com",
    ];

    /**
     * @description: 获取 headers 中的重要信息，包括：
     * @argument {boolean} includeFiles 请求中是否包含文件，默认为 false 。
     *
     * - `Authorization`
     * - `Content-Type`
     * - `User-Agent`
     *
     * @return {object} 包含信息的对象。
     */
    private static getHeaders(includeFiles: boolean = false): object {
        const { packageJSON } = extensions.getExtension(
            "batu1579.hamibot-assistant"
        )!;
        const token = workspace
            .getConfiguration("hamibot-assistant")
            .get<string>("apiToken");

        return {
            /* eslint-disable */
            Authorization: `token ${validToken(token)}`,
            "Content-Type": includeFiles
                ? "multipart/form-data"
                : "application/json",
            "User-Agent": `hamibot-assistant ${packageJSON.version}`,
            /* eslint-enable */
        };
    }

    /**
     * @description: 处理请求中出现的异常，给出更精确的错误描述
     * @param {AxiosError} error 捕获到的请求异常对象
     * @returns {RequestError} 处理后的异常对象
     */
    private static createRequestError(error: AxiosError): RequestError {
        if (!error.response) {
            return new RequestError("未收到响应数据，请稍后重试", true);
        }

        const { status } = error.response;

        if (status >= 500) {
            return new RequestError("服务器异常，请向 Hamibot 官方反馈", true);
        }

        switch (status) {
            case 401:
                // Token 有误
                commands.executeCommand("hamibot-assistant.setApiToken");
                return new RequestError("开发者令牌无效，请重新设置！");

            case 422:
                // 参数有误
                return new RequestError("请求参数格式有误，请检查！");

            case 429:
                // 频率限制
                return new RequestError("本月 API 调用次数已达上限！");

            default:
                return new RequestError(
                    `未知客户端错误，错误码 ${status} ，请在仓库提交 issue 。详细信息：${error.message}`
                );
        }
    }

    /**
     * @description: 向 hamibot 服务器发送请求。
     * @param {AxiosRequestConfig} config 请求配置。
     * @return {Promise<DataType>} 发送后服务器返回的数据。
     */
    private static async sendRequest<DataType>(
        config: AxiosRequestConfig
    ): Promise<DataType> {
        config.headers = {
            ...config.headers,
            ...this.getHeaders(config.data instanceof FormData),
        };

        if (this.baseUrls.length <= 0) {
            throw new RequestError("没有可用的 Hamibot 服务器！");
        }

        for (let index = 0; index < this.baseUrls.length; index++) {
            config.baseURL = this.baseUrls[index];

            try {
                const response = await axios.request<DataType>(config);
                return response.data;
            } catch (error: any) {
                if (!isAxiosError(error)) {
                    throw new RequestError(
                        `未知异常，请在仓库提交 issue 。详细信息：${error.message}`
                    ).attachWith(error);
                }

                const requestError = this.createRequestError(error);

                if (
                    requestError.retriable &&
                    index < this.baseUrls.length - 1
                ) {
                    console.log(
                        `请求失败，正在重试 BaseURL: ${
                            this.baseUrls[index + 1]
                        }`
                    );
                    continue;
                }

                throw requestError.attachWith(error);
            }
        }

        // 理论上不应该运行到这里
        throw new RequestError("请求模块异常，在仓库提交 issue 。");
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
