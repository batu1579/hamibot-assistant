export function isTokenValid(token: string): boolean {
    return /^hmp_[0-9a-f]{64}$/.test(token);
}

export function isRobotIdValid(id: string): boolean {
    return /^[0-9a-f]{24}$/.test(id);
}

export function isScriptIdValid(id: string): boolean {
    return /^[0-9a-f]{24}$/.test(id);
}

export function isGithubUrlValid(url: string): boolean {
    /**
     * SSH:
     * 
     * git@github.com:user/repo
     * git@github.com:user/repo.git
     * 
     * HTTP/HTTPS:
     * 
     * http://github.com/user/repo.git
     * https://github.com/user/repo.git
     * https://github.com/user/repo
     */
    return /^((git@)|(https?:\/\/))github.com[:\/][\w-_]*?\/[\w-_]*?(\.git)?$/.test(url);
}

export function isLocalPathValid(path: string): boolean {
    /**
     * Absolute path
     * 
     * D:\GitHub\TypeScript\hamibot-project
     * D:\GitHub\TypeScript\hamibot-project\
     * 
     * Relative path
     * 
     * .\template\sampleTemplate
     * .\template\sampleTemplate\
     */
    return /^(([A-Za-z]:)|\.)(.*)$/.test(path);
}

export function validToken(token?: string): void {
    if (!token) {
        throw new Error('未设置令牌');
    }

    if (!isTokenValid(token)) {
        throw new Error('令牌格式错误');
    }
}

export function validRobotId(robotId?: string): void {
    if (!robotId) {
        throw new Error('未设置调试机器人 ID');
    }

    if (!isRobotIdValid(robotId)) {
        throw new Error('机器人 ID 格式错误');
    }
}

export function validScriptId(scriptId?: string): void {
    if (!scriptId) {
        throw new Error('未设置脚本 ID');
    }

    if (!isScriptIdValid(scriptId)) {
        throw new Error('脚本 ID 格式错误');
    }
}

export function validGithubUrl(url?: string): string {
    if (!url) {
        throw new Error('未设置 Github 仓库 URL');
    }

    if (!isGithubUrlValid(url)) {
        throw new Error('Github 仓库 URL 格式错误');
    }

    return url;
}

export function validLocalpath(path?: string): string {
    if (!path) {
        throw new Error('未设置本地路径');
    }

    if (!isLocalPathValid(path)) {
        throw new Error('本地路径格式错误');
    }

    return path;
}
