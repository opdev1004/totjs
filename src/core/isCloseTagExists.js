import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './const.js';
import { printError } from './printError.js';
import fs from 'fs/promises';

export async function isCloseTagExists(filename, name, position = 0, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        // Validate inputs
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

        return await processIsCloseTagExists(filename, name, position, encoding, streamCount);
    }
    catch (error)
    {
        printError(error.toString());
        return { result: false, position: -1 };
    }
}

export async function processIsCloseTagExists(filename, name, position = 0, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        const fileHandle = await fs.open(filename, 'r');
        const tagEnd = `</d:${ name }>`;
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
            } else
            {
                processingChunk = chunk;
            }

            while (processingChunk.length > 0)
            {
                const index = processingChunk.indexOf(tagEnd);

                if (index > -1)
                {
                    const chunkLeft = Buffer.byteLength(processingChunk.slice(index + tagEnd.length), encoding);
                    const margin = Math.max(0, chunkLeft - streamCount);
                    const countLeft = stats.size - positionTracker;

                    const adjustedMargin = countLeft < streamCount ? chunkLeft - countLeft : margin;
                    const streamPosition = positionTracker - adjustedMargin - Buffer.byteLength(tagEnd, encoding);

                    await fileHandle.close();

                    return { result: true, position: streamPosition };
                }
                else
                {
                    previousChunk = processingChunk.slice(-tagEnd.length);
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