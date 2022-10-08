export function isTokenValid(token: string): boolean {
    return /^hmp_[0-9a-f]{64}$/.test(token);
}

export function isRobotIdValid(id: string): boolean {
    return /^[0-9a-f]{24}$/.test(id);
}

export function isScriptIdValid(id: string): boolean {
    return /^[0-9a-f]{24}$/.test(id);
}

export function validToken(token?: string): void {
    if (!token) {
        throw new Error('未设置令牌');
    }

    if (!!isTokenValid(token)) {
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
