import fs from 'fs/promises';
import { printError } from './printError.js';
import { processIsOpenTagExists } from './isOpenTagExists.js';
import { processIsCloseTagExists } from './isCloseTagExists.js';
import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './const.js';

export async function remove(filename, name, encoding = 'utf8', streamCount = DefaultStreamCount)
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

        const openTag = await processIsOpenTagExists(filename, name, 0, encoding, streamCount);
        if (!openTag.result)
        {
            printError(`Open Tag '<d:${ name }>' is not found in file`);
            return false;
        }
        if (openTag.position < 0)
        {
            printError('Open Tag position cannot be smaller than 0');
            return false;
        }

        const closeTag = await processIsCloseTagExists(filename, name, openTag.position, encoding, streamCount);
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

        const result1 = await processRemoveOpenTag(filename, openTag.position, encoding);
        const result2 = await processRemoveCloseTag(filename, closeTag.position, encoding);

        return result1 && result2;
    } catch (error)
    {
        printError(error.toString());
        return false;
    }
}


export async function processRemoveOpenTag(filename, position, encoding = 'utf8')
{
    try
    {
        const stream = await fs.open(filename, 'r+');
        const removeString = '<r';

        const stats = await stream.stat();
        if (position >= stats.size)
        {
            printError('Position cannot be bigger or equal than file length');
            await stream.close();
            return false;
        }

        await stream.write(removeString, position, encoding);
        await stream.close();
        return true;
    } catch (error)
    {
        printError(error.toString());
        return false;
    }
}

export async function processRemoveCloseTag(filename, position, encoding = 'utf8')
{
    try
    {
        const stream = await fs.open(filename, 'r+');
        const removeString = '</r';

        const stats = await stream.stat();
        if (position >= stats.size)
        {
            printError('Position cannot be bigger or equal than file length');
            await stream.close();
            return false;
        }

        await stream.write(removeString, position, encoding);
        await stream.close();
        return true;
    } catch (error)
    {
        printError(error.toString());
        return false;
    }
}