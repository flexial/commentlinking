import * as vscode from 'vscode';

export interface DecorationsBundle {
    anchorTextDecoration: vscode.TextEditorDecorationType;
    anchorTextActiveDecoration: vscode.TextEditorDecorationType;
    linkTextDecoration: vscode.TextEditorDecorationType;
    linkTextActiveDecoration: vscode.TextEditorDecorationType;
    hiddenDecoration: vscode.TextEditorDecorationType;
}

export function createDecorationTypes(context: vscode.ExtensionContext): DecorationsBundle {
    const config = vscode.workspace.getConfiguration('commentLinking');

    const anchorColor = config.get<string>('anchorColor', 'charts.green');
    const anchorIconEnabled = config.get<boolean>('anchorIconEnabled', true);
    const anchorIcon = config.get<string>('anchorIcon', '⚓');
    const anchorTextDecoration = vscode.window.createTextEditorDecorationType({
        fontWeight: '600',
        color: anchorColor !== 'inherit' ? new vscode.ThemeColor(anchorColor) : undefined,
        after: {
            contentText: anchorIconEnabled ? anchorIcon : '',
            margin: '0 0 0 .35em'
        }
    });

    const anchorTextActiveDecoration = vscode.window.createTextEditorDecorationType({
        fontWeight: '600',
        color: new vscode.ThemeColor('foreground')
    });

    const linkColor = config.get<string>('linkColor', 'charts.blue');
    const linkIconEnabled = config.get<boolean>('linkIconEnabled', true);
    const linkIcon = config.get<string>('linkIcon', '🔗');
    const linkTextDecoration = vscode.window.createTextEditorDecorationType({
        fontWeight: '600',
        color: linkColor !== 'inherit' ? new vscode.ThemeColor(linkColor) : undefined,
        after: {
            contentText: linkIconEnabled ? linkIcon : '',
            margin: '0 0 0 .35em'
        }
    });

    const linkTextActiveDecoration = vscode.window.createTextEditorDecorationType({
        fontWeight: '600',
        color: new vscode.ThemeColor('foreground')
    });

    const hiddenDecoration = vscode.window.createTextEditorDecorationType({
        textDecoration: 'none; opacity:0; font-size:0; letter-spacing:-1em'
    });

    context.subscriptions.push(
        anchorTextDecoration,
        anchorTextActiveDecoration,
        linkTextDecoration,
        linkTextActiveDecoration,
        hiddenDecoration
    );

    return {
        anchorTextDecoration,
        anchorTextActiveDecoration,
        linkTextDecoration,
        linkTextActiveDecoration,
        hiddenDecoration,
    };
}
