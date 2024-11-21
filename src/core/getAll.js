import fs from 'fs';
import { printError } from './printError.js';
import { DefaultStreamCount, DefaultStreamMinimum } from './const.js';

export async function getAll(filename, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        if (streamCount < DefaultStreamMinimum)
        {
            printError(`Stream count cannot be smaller than ${ DefaultStreamMinimum }`);
            return [];
        }

        const result = await processGetAll(filename, encoding, streamCount);
        return result;
    }
    catch (error)
    {
        printError(error.toString());
        return [];
    }
}

async function processGetAll(filename, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    return new Promise((resolve, reject) =>
    {
        const result = [];
        let inTag = false;
        let data = '';
        let tagName = '';
        let startTag = '';
        let endTag = '';
        let previousChunk = '';

        const readStream = fs.createReadStream(filename, {
            encoding,
            highWaterMark: streamCount,
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

                        if (indexEnd === -1)
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
                } else
                {
                    const indexEndTag = processingChunk.indexOf(endTag);

                    if (indexEndTag > -1)
                    {
                        data += processingChunk.slice(0, indexEndTag);

                        data = data.trimStart().trimEnd();

                        result.push({ Name: tagName, Data: data });

                        processingChunk = processingChunk.slice(indexEndTag + endTag.length);
                        data = '';
                        inTag = false;
                    } else
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
            resolve(result);
        });

        readStream.on('error', (error) =>
        {
            printError(error.toString());
            reject([]);
        });
    });
}
