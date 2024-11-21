import fs from 'fs';
import { printError } from './printError.js';

export function isFileExistsSync(filename)
{
    try
    {
        if (!filename || filename.trim() === '')
        {
            printError('File path may not be appropriate');
            return false;
        }

        if (fs.existsSync(filename))
        {
            return true;
        } else
        {
            printError('File does not exist.');
            return false;
        }
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}