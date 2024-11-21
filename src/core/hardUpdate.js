import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './const.js';
import { printError } from './printError.js';
import { processHardRemove } from './hardRemove.js'; // Assuming you have this implemented
import { processPushing } from './push.js'; // Assuming you have this implemented

export async function hardUpdate(filename, name, data, encoding = 'utf-8', streamCount = DefaultStreamCount)
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

        if (!name || !data)
        {
            printError('Name or data may not be appropriate');
            return false;
        }
        if (name.includes('<d:') || name.includes('</d:'))
        {
            printError('Name cannot contain "<d:" or "</d:"');
            return false;
        }
        if (data.includes('<d:') || data.includes('</d:'))
        {
            printError('Make sure to escape any "<d:" or "</d:" in the data.');
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

        const result1 = await processHardRemove(filename, name, encoding, streamCount);
        const result2 = await processPushing(filename, name, data, encoding);

        return result1 && result2;
    }
    catch (error)
    {
        printError(error.toString());
        return false;
    }
}