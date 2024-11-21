import fs from 'fs/promises';
import { printError } from './printError.js';

export async function isFileExists(filename)
{
    try
    {
        if (!filename || filename.trim() === '')
        {
            printError('File path may not be appropriate');
            return false;
        }

        try
        {
            await fs.access(filename);
            return true;
        } catch {
            printError('File does not exist.');
            return false;
        }
    } catch (error)
    {
        printError(error.toString());
        return false;
    }
}