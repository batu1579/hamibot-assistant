export function isError(e: any): e is Error {
    return e instanceof Error;
}