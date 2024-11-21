import fs from 'fs';
import { printError } from './printError.js';
import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './const.js';

export async function getDataByName(filename, name, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        if (!name)
        {
            printError("Name may not be appropriate");
            return '';
        }
        if (name.includes('<d:') || name.includes('</d:'))
        {
            printError("Name cannot contain '<d:' or '</d:'");
            return '';
        }
        if (name.length > DefaultNameMaximum)
        {
            printError(`Name cannot be longer than ${ DefaultNameMaximum } characters`);
            return '';
        }
        if (streamCount < DefaultStreamMinimum)
        {
            printError(`Stream count cannot be smaller than ${ DefaultStreamMinimum }`);
            return '';
        }

        const result = await processGetDataByName(filename, name, encoding, streamCount);
        return result;
    }
    catch (error)
    {
        printError(error.toString());
        return '';
    }
}

async function processGetDataByName(filename, name, encoding, streamCount)
{
    return new Promise((resolve, reject) =>
    {
        const tagStart = `<d:${ name }>`;
        const tagEnd = `</d:${ name }>`;
        let inTag = false;
        let tagEnded = false;
        let data = '';
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
                    const indexStart = processingChunk.indexOf(tagStart);
                    if (indexStart > -1)
                    {
                        inTag = true;
                        processingChunk = processingChunk.slice(indexStart + tagStart.length);
                    } else
                    {
                        previousChunk = processingChunk.slice(-tagStart.length);
                        break;
                    }
                } else
                {
                    const indexEnd = processingChunk.indexOf(tagEnd);
                    if (indexEnd > -1)
                    {
                        inTag = false;
                        tagEnded = true;
                        data += processingChunk.slice(0, indexEnd);
                        processingChunk = '';

                        data = data.trim();

                        resolve(data);
                        readStream.close();
                        return;
                    } else
                    {
                        data += processingChunk.slice(0, -tagEnd.length);
                        previousChunk = processingChunk.slice(-tagEnd.length);
                        break;
                    }
                }
            }
        });

        readStream.on('end', () =>
        {
            if (!tagEnded)
            {
                if (inTag)
                {
                    printError(`No closing tag '</d:${ name }>' found for '<d:${ name }>'`);
                } else
                {
                    printError(`Tag '<d:${ name }>' not found in file`);
                }
            }
            resolve('');
        });

        readStream.on('error', (error) =>
        {
            printError(error.toString());
            reject('');
        });
    });
}