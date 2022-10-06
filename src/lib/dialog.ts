import { window, ExtensionContext } from "vscode";

class Dialog {
    protected selections: string[];
    protected showFunction: ShowFunction;

    constructor(selections: string[], showFunction: ShowFunction) {
        this.selections = selections;
        this.showFunction = showFunction;
    }

    public async showDialog(context: ExtensionContext, message: string): Promise<NeedRetry> {
        // 只有值为 true 的时候跳过显示
        if (!(await context.globalState.get(message))) {
            let select = await this.showFunction(message, ...this.selections);
            if (select === '重试') {
                return true;
            } else if (select === '不再显示') {
                context.globalState.update(message, true);
            }
        }
        return false;
    }
}

export const INFO_DIALOG = new Dialog(
    ['不再显示', '确定'],
    window.showInformationMessage
);

export const ERROR_DIALOG = new Dialog(
    ['不再显示', '重试', '确定'],
    window.showErrorMessage
);

type NeedRetry = boolean;

type ShowFunction = <T extends string>(message: string, ...items: T[]) => Thenable<T | undefined>;
