import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './const.js';
import { processIsOpenTagExists } from './isOpenTagExists.js';
import { printError } from './printError.js';
import fs from 'fs/promises';

export async function push(filename, name, data, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        if (!name || !data)
        {
            printError("name or data may not be appropriate");
            return false;
        }
        if (name.includes("<d:") || name.includes("</d:"))
        {
            printError("name cannot contain '<d:' or '</d:'");
            return false;
        }
        if (data.includes("<d:") || data.includes("</d:"))
        {
            printError("make sure to escape any '<d:' or '</d' from data.");
            return false;
        }
        if (name.length > DefaultNameMaximum)
        {
            printError(`name cannot be longer than ${ DefaultNameMaximum } characters`);
            return false;
        }
        if (streamCount < DefaultStreamMinimum)
        {
            printError(`stream count cannot be smaller than ${ DefaultStreamMinimum }`);
            return false;
        }

        const openTag = await processIsOpenTagExists(filename, name, 0, encoding, streamCount);

        if (openTag.result)
        {
            printError(`tag '<d:${ name }>' is found in the file.`);
            return false;
        }

        return await processPushing(filename, name, data, encoding);
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}

export async function processPushing(filename, name, data, encoding = 'utf8')
{
    try
    {
        const tagStart = `<d:${ name }>\r\n`;
        const tagEnd = `\r\n</d:${ name }>\r\n`;
        const content = tagStart + data + tagEnd;

        await fs.appendFile(filename, Buffer.from(content, encoding));
        return true;
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}