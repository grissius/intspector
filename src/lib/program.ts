import stack from 'callsites';
import * as path from 'path';
import * as ts from 'typescript';
import { getOptions } from './options';

export const FILENAME = '__ts-type-test-inline-e1d70ff1__';
export const FILENAME_RE = new RegExp(FILENAME);

export const createInlineProgram = (code: string) => {
    // Work around definite assignment checking: inlineSourceFile is assigned
    // when ts.createProgram is created
    let inlineSourceFile!: ts.SourceFile;
    const getSourceFile = (
        fileName: string,
        languageVersion: ts.ScriptTarget,
        ...args: any[]
    ) => {
        if (!FILENAME_RE.test(fileName)) {
            return (compilerHost.getSourceFile as any)(
                fileName,
                languageVersion,
                ...args
            );
        }
        if (inlineSourceFile === undefined) {
            inlineSourceFile = ts.createSourceFile(
                FILENAME,
                code,
                languageVersion
            );
        }
        return inlineSourceFile;
    };
    const options = getOptions();
    const compilerHost = ts.createCompilerHost(options);
    const customCompilerHost = {
        ...compilerHost,
        getSourceFile,
    };

    let filepath = FILENAME;
    // index 2 is level (3 up in stack) where `inspect` function is called from
    const callerFile = stack()[2]?.getFileName();
    if (callerFile) {
        filepath = path.resolve(path.dirname(callerFile), FILENAME);
    }

    const program = ts.createProgram([filepath], options, customCompilerHost);
    return { program, inlineSourceFile };
};
