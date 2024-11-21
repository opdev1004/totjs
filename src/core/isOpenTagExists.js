import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './const.js';
import { printError } from './printError.js';
import fs from 'fs/promises';

export async function isOpenTagExists(filename, name, position = 0, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        if (!name)
        {
            printError("name may not be appropriate");
            return { result: false, position: -1 };
        }
        if (name.length > DefaultNameMaximum)
        {
            printError(`name cannot be longer than ${ DefaultNameMaximum } characters`);
            return { result: false, position: -1 };
        }
        if (streamCount < DefaultStreamMinimum)
        {
            printError(`stream count cannot be smaller than ${ DefaultStreamMinimum }`);
            return { result: false, position: -1 };
        }
        if (position < 0)
        {
            printError("position cannot be smaller than 0");
            return { result: false, position: -1 };
        }

        return await processIsOpenTagExists(filename, name, position, encoding, streamCount);
    }
    catch (error)
    {
        printError(error.toString());
        return { result: false, position: -1 };
    }
}

export async function processIsOpenTagExists(filename, name, position = 0, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        const fileHandle = await fs.open(filename, 'r');
        const tagStart = `<d:${ name }>`;
        const buffer = Buffer.alloc(streamCount);
        let positionTracker = position;
        let processingChunk = '';
        let previousChunk = '';

        const stats = await fileHandle.stat();
        if (position >= stats.size)
        {
            printError("position cannot be bigger or equal than file length");
            await fileHandle.close();
            return { result: false, position: -1 };
        }

        while (positionTracker < stats.size)
        {
            const { bytesRead } = await fileHandle.read(buffer, 0, streamCount, positionTracker);
            if (bytesRead === 0) break;

            const chunk = buffer.toString(encoding, 0, bytesRead);

            if (previousChunk)
            {
                processingChunk = previousChunk + chunk;
                previousChunk = '';
            }
            else
            {
                processingChunk = chunk;
            }

            while (processingChunk.length > 0)
            {
                const index = processingChunk.indexOf(tagStart);

                if (index > -1)
                {
                    const tagPosition = positionTracker + index;
                    await fileHandle.close();
                    return { result: true, position: tagPosition };
                }
                else
                {
                    previousChunk = processingChunk.slice(-tagStart.length);
                    processingChunk = '';
                }
            }

            positionTracker += streamCount;
        }

        await fileHandle.close();
        return { result: false, position: -1 };
    }
    catch (error)
    {
        printError(error.toString());
        return { result: false, position: -1 };
    }
}