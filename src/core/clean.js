import { DefaultStreamCount, DefaultStreamMinimum } from './const.js';
import { printError } from './printError.js';
import fs from 'fs/promises';

export async function clean(filename, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        try
        {
            await fs.access(filename);
        }
        catch {
            printError("File does not exist");
            return false;
        }

        if (streamCount < DefaultStreamMinimum)
        {
            printError(`stream count cannot be smaller than ${ DefaultStreamMinimum }`);
            return false;
        }

        return await processClean(filename, encoding, streamCount);
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}

async function processClean(filename, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        const tempFilename = `${ filename }.tmp`;

        await fs.rename(filename, tempFilename);

        const readStream = await fs.open(tempFilename, 'r');
        const writeStream = await fs.open(filename, 'a');

        let processingChunk = '';
        let previousChunk = '';
        let inTag = false;
        let indexStartTagStart = 0;
        let indexStartTagEnd = 0;
        let indexEndTag = 0;
        let tagName = '';
        let startTag = '';
        let endTag = '';
        let content = '';
        let wholeTag = '';

        const buffer = Buffer.alloc(streamCount);

        while (true)
        {
            const { bytesRead } = await readStream.read(buffer, 0, streamCount, null);

            if (bytesRead === 0) break;

            let chunk = buffer.toString(encoding, 0, bytesRead);

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
                if (!inTag)
                {
                    indexStartTagStart = processingChunk.indexOf('<d:');

                    if (indexStartTagStart > -1)
                    {
                        processingChunk = processingChunk.slice(indexStartTagStart);
                        indexStartTagEnd = processingChunk.indexOf('>');

                        if (indexStartTagEnd < 0)
                        {
                            previousChunk = processingChunk;
                            break;
                        }

                        tagName = processingChunk.slice(3, indexStartTagEnd);
                        startTag = `<d:${ tagName }>`;
                        endTag = `</d:${ tagName }>`;
                        processingChunk = processingChunk.slice(indexStartTagEnd + 1);
                        wholeTag = startTag;
                        inTag = true;
                    } else
                    {
                        if (processingChunk.length < 3) break;
                        previousChunk = processingChunk.slice(-3);
                        break;
                    }
                } else
                {
                    indexEndTag = processingChunk.indexOf(endTag);

                    if (indexEndTag > -1)
                    {
                        content = processingChunk.slice(0, indexEndTag);
                        wholeTag += `${ content }${ endTag }\r\n`;
                        processingChunk = processingChunk.slice(indexEndTag + endTag.length);
                        await writeStream.writeFile(wholeTag, encoding);
                        wholeTag = '';
                        inTag = false;
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
    } catch (error)
    {
        printError(error.toString());
        return false;
    }
}