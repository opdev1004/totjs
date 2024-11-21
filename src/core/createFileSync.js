import { printError } from './printError.js';
import fs from 'fs';

export function createFileSync(filename)
{
    try
    {
        if (!filename)
        {
            printError("File path may not be appropriate");
            return false;
        }

        if (fs.existsSync(filename))
        {
            printError(`${ filename } exists`);
            return false;
        }

        fs.writeFileSync(filename, '');
        return true;
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}