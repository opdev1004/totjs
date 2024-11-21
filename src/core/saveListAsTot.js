import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './const.js';
import { printError } from './printError.js';

export async function saveListAsTot(filename, itemList, encoding = 'utf8', streamCount = DefaultStreamCount)
{
    try
    {
        if (streamCount < DefaultStreamMinimum)
        {
            printError(`Stream count cannot be smaller than ${ DefaultStreamMinimum }`);
            return false;
        }

        const result = await processSaveListAsTot(filename, itemList, encoding);
        return result;
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}

async function processSaveListAsTot(filename, itemList, encoding = 'utf8')
{
    try
    {
        let content = '';

        for (const item of itemList)
        {
            const { Name: name, Data: data } = item;

            if (!name || !data)
            {
                printError('Name or data may not be appropriate');
                continue;
            }
            if (name.includes('<d:') || name.includes('</d:'))
            {
                printError("Name cannot contain '<d:' or '</d:'");
                continue;
            }
            if (data.includes('<d:') || data.includes('</d:'))
            {
                printError("Make sure to escape any '<d:' or '</d' from data.");
                continue;
            }
            if (name.length > DefaultNameMaximum)
            {
                printError(`Name cannot be longer than ${ DefaultNameMaximum } characters`);
                continue;
            }

            const tagStart = `<d:${ name }>\r\n`;
            const tagEnd = `\r\n</d:${ name }>\r\n`;
            content += tagStart + data + tagEnd;
        }

        await fs.writeFile(filename, content, { encoding });
        return true;
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}