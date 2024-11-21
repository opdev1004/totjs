import { printError } from './printError.js';
import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './const.js';
import { processIsCloseTagExists } from './isCloseTagExists.js';
import { processRemoveOpenTag, processRemoveCloseTag } from './remove.js';

export async function removeFromGivenPosition(filename, name, openPosition, encoding = 'utf8', streamCount = DefaultStreamCount)
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

        const closeTag = await processIsCloseTagExists(filename, name, openPosition, encoding, streamCount);
        if (!closeTag.result)
        {
            printError(`Close Tag "</d:${ name }>" is not found in file`);
            return false;
        }
        if (closeTag.position < 0)
        {
            printError('Close Tag position cannot be smaller than 0');
            return false;
        }

        const result1 = await processRemoveOpenTag(filename, openPosition, encoding);
        const result2 = await processRemoveCloseTag(filename, closeTag.position, encoding);

        return result1 && result2;
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}