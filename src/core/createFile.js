import { printError } from './printError.js';
import fs from 'fs/promises';

export async function createFile(filename)
{
    try
    {
        if (!filename)
        {
            printError("File path may not be appropriate");
            return false;
        }

        try
        {
            await fs.access(filename);
            printError(`${ filename } exists`);
            return false;
        }
        catch {
            await fs.writeFile(filename, '');
            return true;
        }
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}