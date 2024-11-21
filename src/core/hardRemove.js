import fs from 'fs/promises';
import { printError } from './printError.js';
import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './const.js';


export async function hardRemove(filename, name, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        try
        {
            await fs.access(filename);
        }
        catch
        {
            printError("File does not exist");
            return false;
        }

        if (!name || name.includes('<d:') || name.includes('</d:'))
        {
            printError("Name cannot be empty or contain '<d:' or '</d:'");
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

        const result = await processHardRemove(filename, name, encoding, streamCount);
        return result;
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}

export async function processHardRemove(filename, name, encoding, streamCount)
{
    const tempFilename = `${ filename }.tmp`;
    try
    {
        await fs.rename(filename, tempFilename);

        const readStream = await fs.open(tempFilename, 'r');
        const writeStream = await fs.open(filename, 'w');

        let processingChunk = '';
        let previousChunk = '';
        let inTag = false;
        let wholeTag = '';
        let startTag = '';
        let endTag = '';
        let tagName = '';

        const buffer = Buffer.alloc(streamCount);

        while (true)
        {
            const { bytesRead } = await readStream.read(buffer, 0, streamCount);
            if (bytesRead === 0) break;

            const chunk = buffer.toString(encoding, 0, bytesRead);

            processingChunk = previousChunk + chunk;
            previousChunk = '';

            while (processingChunk.length > 0)
            {
                if (!inTag)
                {
                    const indexStartTagStart = processingChunk.indexOf('<d:');
                    if (indexStartTagStart > -1)
                    {
                        processingChunk = processingChunk.slice(indexStartTagStart);
                        const indexStartTagEnd = processingChunk.indexOf('>');

                        if (indexStartTagEnd < 0)
                        {
                            previousChunk = processingChunk;
                            break;
                        }

                        tagName = processingChunk.slice(3, indexStartTagEnd);
                        if (tagName === name)
                        {
                            processingChunk = processingChunk.slice(indexStartTagEnd + 1);
                            continue;
                        }

                        startTag = `<d:${ tagName }>`;
                        endTag = `</d:${ tagName }>`;
                        wholeTag += startTag;
                        inTag = true;
                        processingChunk = processingChunk.slice(indexStartTagEnd + 1);
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
                        const content = processingChunk.slice(0, indexEndTag);
                        wholeTag += `${ content }${ endTag }\r\n`;

                        await writeStream.write(wholeTag, encoding);
                        wholeTag = '';
                        inTag = false;

                        processingChunk = processingChunk.slice(indexEndTag + endTag.length);
                    } else
                    {
                        wholeTag += processingChunk.slice(0, -endTag.length);
                        previousChunk = processingChunk.slice(-endTag.length);
                        break;
                    }
                }
            }
        }

        await readStream.close();
        await writeStream.close();
        await fs.unlink(tempFilename);

        return true;
    }
    catch (error)
    {
        printError(error.toString());
        await fs.rename(tempFilename, filename).catch(() =>
        {
            printError('Failed to restore original file after error');
        });
        return false;
    }
}