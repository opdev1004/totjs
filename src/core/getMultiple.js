import fs from 'fs';
import { DefaultStreamCount, DefaultStreamMinimum } from './const.js';
import { printError } from './printError.js';

export async function getMultiple(filename, count, position = 0, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        if (streamCount < DefaultStreamMinimum)
        {
            printError(`Stream count cannot be smaller than ${ DefaultStreamMinimum }`);
            return { itemList: [], lastPosition: -1 };
        }
        if (count < 1)
        {
            printError('Count cannot be smaller than 1');
            return { itemList: [], lastPosition: -1 };
        }
        if (position < 0)
        {
            printError('Position cannot be smaller than 0');
            return { itemList: [], lastPosition: -1 };
        }

        const result = await processGetMultiple(filename, count, position, encoding, streamCount);
        return result;
    } catch (error)
    {
        printError(error.toString());
        return { itemList: [], lastPosition: -1 };
    }
}

async function processGetMultiple(filename, count, position, encoding, streamCount)
{
    return new Promise((resolve, reject) =>
    {
        const result = { itemList: [], lastPosition: -1 };
        let inTag = false;
        let data = '';
        let previousChunk = '';
        let tagName = '';
        let startTag = '';
        let endTag = '';
        let currentCount = 0;
        let positionTracker = 0;

        const readStream = fs.createReadStream(filename, {
            encoding,
            highWaterMark: streamCount,
            start: position,
        });

        readStream.on('data', (chunk) =>
        {
            let processingChunk = previousChunk + chunk;
            previousChunk = '';

            while (processingChunk.length > 0)
            {
                if (!inTag)
                {
                    const indexStart = processingChunk.indexOf('<d:');
                    if (indexStart > -1)
                    {
                        processingChunk = processingChunk.slice(indexStart);
                        const indexEnd = processingChunk.indexOf('>');
                        if (indexEnd < 0)
                        {
                            previousChunk = processingChunk;
                            break;
                        }

                        tagName = processingChunk.slice(3, indexEnd);
                        startTag = `<d:${ tagName }>`;
                        endTag = `</d:${ tagName }>`;
                        processingChunk = processingChunk.slice(indexEnd + 1);
                        inTag = true;
                    } else
                    {
                        previousChunk = processingChunk.slice(-3);
                        break;
                    }
                }
                else
                {
                    const indexEndTag = processingChunk.indexOf(endTag);
                    if (indexEndTag > -1)
                    {
                        data += processingChunk.slice(0, indexEndTag);
                        data = data.trim();

                        result.itemList.push({ name: tagName, data });
                        currentCount++;

                        const remainingChunk = processingChunk.slice(indexEndTag + endTag.length);
                        positionTracker += Buffer.byteLength(remainingChunk, encoding);

                        result.lastPosition = positionTracker;
                        if (currentCount === count)
                        {
                            readStream.close();
                            resolve(result);
                            return;
                        }

                        processingChunk = remainingChunk;
                        data = '';
                        inTag = false;
                    }
                    else
                    {
                        data += processingChunk.slice(0, -endTag.length);
                        previousChunk = processingChunk.slice(-endTag.length);
                        break;
                    }
                }
            }
        });

        readStream.on('end', () =>
        {
            if (inTag)
            {
                printError(`No closing tag found for '<d:${ tagName }>'`);
            }
            resolve(result);
        });

        readStream.on('error', (error) =>
        {
            printError(error.toString());
            reject({ itemList: [], lastPosition: -1 });
        });
    });
}