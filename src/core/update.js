import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './const.js';
import { printError } from './printError.js';
import { processIsOpenTagExists } from './isOpenTagExists.js';
import { removeFromGivenPosition } from './removeFromGivenPosition.js';
import { processPushing } from './push.js';

export async function update(filename, name, data, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        if (!name || !data)
        {
            printError('Name or data may not be appropriate');
            return false;
        }

        if (name.includes('<d:') || name.includes('</d:'))
        {
            printError("Name cannot contain '<d:' or '</d:'");
            return false;
        }

        if (data.includes('<d:') || data.includes('</d:'))
        {
            printError("Make sure to escape any '<d:' or '</d' from data.");
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

        const fileEncoding = encoding;

        const openTag = await processIsOpenTagExists(filename, name, 0, fileEncoding, streamCount);

        if (openTag.result)
        {
            await removeFromGivenPosition(filename, name, openTag.position, fileEncoding, streamCount);
            await processPushing(filename, name, data, fileEncoding);
            return true;
        }
        else
        {
            printError(`Tag '<d:${ name }>' is not found in the file.`);
            return false;
        }
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}