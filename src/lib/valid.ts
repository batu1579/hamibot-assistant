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
    if (!token || !isTokenValid(token)) {
        throw new Error('Invalid token');
    }
}

export function validRobotId(id?: string): void {
    if (!id || !isRobotIdValid(id)) {
        throw new Error('Invalid robot id');
    }
}

export function validScriptId(id?: string): void {
    if (!id || !isScriptIdValid(id)) {
        throw new Error('Invalid script id');
    }
}
