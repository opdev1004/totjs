import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './const.js';
import { printError } from './printError.js';
import { processRemoveOpenTag, processRemoveCloseTag } from './remove.js';

export async function removeGivenPosition(filename, name, openPosition, closePosition, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        if (!name || name.trim() === '')
        {
            printError('Name may not be appropriate');
            return false;
        }
        if (name.includes('<d:') || name.includes('</d:'))
        {
            printError("Name cannot contain '<d:' or '</d:'");
            return false;
        }
        if (name.length > DefaultNameMaximum)
        {
            printError(`Name cannot be longer than ${ DefaultNameMaximum } characters`);
            return false;
        }
        if (streamCount < DefaultStreamMinimum)
        {
            printError(`Stream count cannot be smaller than ${ DefaultStreamMinimum }`);
            return false;
        }

        const result1 = await processRemoveOpenTag(filename, openPosition, encoding);
        const result2 = await processRemoveCloseTag(filename, closePosition, encoding);

        return result1 && result2;
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}