import { DefaultStreamCount, DefaultNameMaximum, DefaultStreamMinimum } from './core/const.js';
import { clean } from './core/clean.js';
import { createFile } from './core/createFile.js';
import { createFileSync } from './core/createFileSync.js';
import { getAll } from './core/getAll.js';
import { getAllByDict } from './core/getAllByDict.js';
import { getAllByList } from './core/getAllByList.js';
import { getDataByName } from './core/getDataByName.js';
import { getDataByNameAt } from './core/getDataByNameAt.js';
import { getMultiple } from './core/getMultiple.js';
import { hardRemove } from './core/hardRemove.js';
import { hardUpdate } from './core/hardUpdate.js';
import { isOpenTagExists } from './core/isOpenTagExists.js';
import { isCloseTagExists } from './core/isCloseTagExists.js';
import { isFileExists } from './core/isFileExists.js';
import { isFileExistsSync } from './core/isFileExistsSync.js';
import { push } from './core/push.js';
import { remove } from './core/remove.js';
import { removeFromGivenPosition } from './core/removeFromGivenPosition.js';
import { removeGivenPosition } from './core/removeGivenPosition.js';
import { saveDictAsTot } from './core/saveDictAsTot.js';
import { saveListAsTot } from './core/saveListAsTot.js';
import { update } from './core/update.js';
import { Semaphore } from './core/semaphore.js';
export { Semaphore };

export class Tot
{
    constructor()
    {
        this.semaphore = new Semaphore(1);
        this.clean = clean;
        this.createFile = createFile;
        this.createFileSync = createFileSync;
        this.getAll = getAll;
        this.getAllByDict = getAllByDict;
        this.getAllByList = getAllByList;
        this.getDataByName = getDataByName;
        this.getDataByNameAt = getDataByNameAt;
        this.getMultiple = getMultiple;
        this.hardRemove = hardRemove;
        this.hardUpdate = hardUpdate;
        this.isOpenTagExists = isOpenTagExists;
        this.isCloseTagExists = isCloseTagExists;
        this.isFileExists = isFileExists;
        this.isFileExistsSync = isFileExistsSync;
        this.push = push;
        this.remove = remove;
        this.removeFromGivenPosition = removeFromGivenPosition;
        this.removeGivenPosition = removeGivenPosition;
        this.saveDictAsTot = saveDictAsTot;
        this.saveListAsTot = saveListAsTot;
        this.update = update;
    }

    async qClean(filename, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await clean(filename, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qCreateFile(filename)
    {
        this.semaphore.acquire();

        try
        {
            const result = await createFile(filename);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qGetAll(filename, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await getAll(filename, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qGetAllByDict(filename, encoding = 'utf8', streamCount = DefaultStream)
    {
        this.semaphore.acquire();

        try
        {
            const result = await getAllByDict(filename, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qGetAllByList(filename, encoding = 'utf8', streamCount = DefaultStream)
    {
        this.semaphore.acquire();

        try
        {
            const result = await getAllByList(filename, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qGetDataByName(filename, name, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await getDataByName(filename, name, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qGetDataByNameAt(filename, name, position = 0, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await getDataByNameAt(filename, name, position, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qGetMultiple(filename, count, position = 0, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await getMultiple(filename, count, position, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qHardRemove(filename, name, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await hardRemove(filename, name, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qHardUpdate(filename, name, data, encoding = 'utf-8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await hardUpdate(filename, name, data, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qIsOpenTagExists(filename, name, position = 0, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await isOpenTagExists(filename, name, position, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qIsCloseTagExists(filename, name, position = 0, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await isCloseTagExists(filename, name, position, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qIsFileExists(filename)
    {
        this.semaphore.acquire();

        try
        {
            const result = await isFileExists(filename);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qPush(filename, name, data, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await push(filename, name, data, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qRemove(filename, name, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await remove(filename, name, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qRemoveFromGivenPosition(filename, name, openPosition, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await removeFromGivenPosition(filename, name, openPosition, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qRemoveGivenPosition(filename, name, openPosition, closePosition, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await removeGivenPosition(filename, name, openPosition, closePosition, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qSaveDictAsTot(filename, dict, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await saveDictAsTot(filename, dict, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qSaveListAsTot(filename, itemList, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await saveListAsTot(filename, itemList, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    async qUpdate(filename, name, data, encoding = 'utf8', streamCount = DefaultStreamCount)
    {
        this.semaphore.acquire();

        try
        {
            const result = await update(filename, name, data, encoding, streamCount);
            return result;
        }
        finally
        {
            this.semaphore.release();
        }
    }

    static clean = clean;
    static createFile = createFile;
    static createFileSync = createFileSync;
    static getAll = getAll;
    static getAllByDict = getAllByDict;
    static getAllByList = getAllByList;
    static getDataByName = getDataByName;
    static getDataByNameAt = getDataByNameAt;
    static getMultiple = getMultiple;
    static hardRemove = hardRemove;
    static hardUpdate = hardUpdate;
    static isOpenTagExists = isOpenTagExists;
    static isCloseTagExists = isCloseTagExists;
    static isFileExists = isFileExists;
    static isFileExistsSync = isFileExistsSync;
    static push = push;
    static remove = remove;
    static removeFromGivenPosition = removeFromGivenPosition;
    static removeGivenPosition = removeGivenPosition;
    static saveDictAsTot = saveDictAsTot;
    static saveListAsTot = saveListAsTot;
    static update = update;
}