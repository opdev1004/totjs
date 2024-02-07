const fs = require('fs');
const { Transform } = require('stream');

module.exports = class Tot
{
    constructor(filename = undefined, indexingSize = 8 * 1024, encoding = 'utf8', highWaterMark = 64 * 1024)
    {
        this.filename = filename;
        this.indexingSize = indexingSize;
        this.encoding = encoding;
        this.highWaterMark = highWaterMark;
        this.taskQueue = [];
        this.runningTask = false;
    }

    pushTask(task)
    {
        return new Promise((resolve, reject) =>
        {
            this.taskQueue.push({ task, resolve, reject });

            if (!this.runningTask)
            {
                this.doTask();
            }
        }).catch(error => { console.error(error); return null; });
    }

    async doTask()
    {
        if (this.taskQueue.length > 0)
        {
            this.runningTask = true;
            const { task, resolve, reject } = this.taskQueue.shift();

            try
            {
                const result = await task();
                resolve(result);
            }
            catch (error)
            {
                reject(error);
            }

            this.doTask();
        }
        else
        {
            this.runningTask = false;
        }
    }

    async open(filename)
    {
        await this.pushTask(async () =>
        {
            this.filename = filename;
        });
    }

    async close()
    {
        this.pushTask(async () =>
        {
            this.filename = undefined;
        });
    }

    async create()
    {
        this.pushTask(async () =>
        {
            await fs.promises.writeFile(this.filename, '', { encoding: this.encoding }, (error) =>
            {
                console.error(error);
            });
        });
    }

    async getAll()
    {
        const result = await this.pushTask(async () =>
        {
            const result = await this.processGetAll();

            if (result) return result;
            else return null;
        });

        return result;
    }

    processGetAll()
    {
        return new Promise((resolve, reject) =>
        {
            fs.readFile(this.filename, this.encoding, function (error, data) 
            {

                if (error) reject(error);
                else
                {
                    const result = {};
                    let temp = data;

                    while (temp.length > 0)
                    {
                        const startTag = "<d:";
                        const startIndex = temp.indexOf(startTag);
                        if (startIndex === -1)
                        {
                            break;
                        }

                        const endIndex = temp.indexOf(">", startIndex + startTag.length);
                        if (endIndex === -1)
                        {
                            break;
                        }

                        const tagName = temp.substring(startIndex + startTag.length, endIndex);

                        const startTagData = ">";
                        const endTagData = "</d:" + tagName + ">";
                        const tagDataStartIndex = temp.indexOf(startTagData, endIndex) + startTagData.length;
                        const tagDataEndIndex = temp.indexOf(endTagData, tagDataStartIndex);
                        if (tagDataStartIndex === -1 || tagDataEndIndex === -1)
                        {
                            break;
                        }

                        const tagData = temp.substring(tagDataStartIndex, tagDataEndIndex)

                        result[tagName] = tagData;
                        temp = temp.substring(tagDataEndIndex + endTagData.length);
                    }

                    resolve(result)
                }
            });
        }).catch(error => { console.error(error); return null; });
    }

    async getDataByPrefix(prefix, size)
    {
        if (!prefix)
        {
            console.error("getDataByPrefix Error: prefix is undefined or null or empty");
        }
        else if (!size || size < 1 || typeof size !== "number")
        {
            console.error("getDataByPrefix Error: size is undefined or null or empty or just wrong number");
        }

        const result = await this.pushTask(async () =>
        {
            const result = this.processGetDataByPrefix(prefix, size);

            if (result) return result;
            else return null;
        });

        return result;
    }

    processGetDataByPrefix(prefix, size = 0)
    {
        return new Promise((resolve, reject) =>
        {
            let result = {};

            if (size == 0) resolve(result);

            let tagStart = `<d:${ prefix }`;
            let tagEnd = `</d:${ prefix }`;
            let data = ""
            let processingChunk = "";
            let previousChunk = "";
            let inTag = false;
            let itemSize = 0;
            let index = 0;
            let tagName = "";

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding });

            reader.on('data', (chunk) =>
            {
                if (previousChunk !== "")
                {
                    processingChunk = previousChunk + chunk;
                }
                else
                {
                    processingChunk += chunk;
                }

                while (processingChunk.length > 0)
                {
                    if (!inTag)
                    {
                        index = processingChunk.indexOf(tagStart);

                        if (index > -1)
                        {
                            let oldIndex = index;
                            index = processingChunk.indexOf(">", index);
                            tagName = processingChunk.substring(oldIndex + 3, index);
                            inTag = true;
                            processingChunk = processingChunk.slice(index + 1);
                        }
                        else
                        {
                            previousChunk = processingChunk.slice(-tagStart.length);
                            processingChunk = "";
                            break;
                        }
                    }
                    else
                    {
                        index = processingChunk.indexOf(tagEnd);

                        if (index > -1)
                        {
                            inTag = false;
                            data += processingChunk.substring(0, index);
                            index = processingChunk.indexOf(">", index);
                            processingChunk = processingChunk.substring(index + 1);
                            data = data.replaceAll("<\\d:", "<d:");
                            data = data.replaceAll("<\\/d:", "</d:");
                            result[tagName] = data;
                            itemSize++;
                            data = "";

                            if (itemSize >= size)
                            {
                                resolve(result);
                                reader.close();
                            }
                        }
                        else
                        {
                            data += processingChunk.slice(0, -tagEnd.length)
                            previousChunk = processingChunk.slice(-tagEnd.length);
                            processingChunk = "";
                            break;
                        }
                    }
                }
            });
            reader.on('error', (e) =>
            {
                reject(e);
            });
            reader.on('end', () =>
            {
                resolve(result);
            });
        }).catch(error => { console.error(error); return null; });
    }

    async getDataByNameAt(name, position)
    {
        if (!name)
        {
            console.error("getDataByNameAt Error: name is undefined or null or empty");
            return "";
        }
        else if (!position || typeof position !== "number")
        {
            console.error("getDataByNameAt Error: position is undefined or null or empty or not a number");
            return "";
        }

        const result = await this.pushTask(async () =>
        {
            const result = await this.processGetDataByName(name);

            if (result) return result;
            else if (result == "") return "";
            else return null;
        });

        return result;
    }

    processGetDataByNameAt(name, position)
    {
        return new Promise((resolve, reject) =>
        {
            let tagStart = `<d:${ name }>`;
            let tagEnd = `</d:${ name }>`;
            let data = ""
            let processingChunk = "";
            let previousChunk = "";
            let inTag = false;
            let tagEnded = false;
            let index = 0;

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding, start: position });

            reader.on('data', (chunk) =>
            {
                if (previousChunk !== "")
                {
                    processingChunk = previousChunk + chunk;
                }
                else
                {
                    processingChunk += chunk;
                }

                while (processingChunk.length > 0)
                {
                    if (!inTag)
                    {
                        index = processingChunk.indexOf(tagStart);

                        if (index > -1)
                        {
                            inTag = true;
                            processingChunk = processingChunk.slice(index + tagStart.length);
                        }
                        else
                        {
                            previousChunk = processingChunk.slice(-tagStart.length);
                            processingChunk = "";
                            break;
                        }
                    }
                    else
                    {
                        index = processingChunk.indexOf(tagEnd);

                        if (index > -1)
                        {
                            inTag = false;
                            data += processingChunk.substring(0, index);
                            processingChunk = "";
                            tagEnded = true;
                            resolve(data);
                            reader.close();
                        }
                        else
                        {
                            data += processingChunk.slice(0, -tagEnd.length)
                            previousChunk = processingChunk.slice(-tagEnd.length);
                            processingChunk = "";
                            break;
                        }
                    }
                }
            });
            reader.on('error', (e) =>
            {
                reject(e);
            });
            reader.on('end', () =>
            {
                if (!tagEnded)
                {
                    reject(`getDataByNameAt Error: Tag "<d:${ name }>" not found in file`);
                }
                else if (inTag)
                {
                    reject(`getDataByNameAt Error: No closing tag "</d:${ name }>" found for "<d:${ name }>"`);
                }
            });
        }).catch(error => { console.error(error); return null; });
    }

    async getDataByName(name)
    {
        if (!name)
        {
            console.error("getDataByName Error: name is undefined or null or empty");
            return "";
        }

        const result = await this.pushTask(async () =>
        {
            const result = this.processGetDataByName(name);

            if (result) return result;
            else if (result == "") return "";
            else return null;
        });

        return result;
    }

    processGetDataByName(name)
    {
        return new Promise((resolve, reject) =>
        {
            let tagStart = `<d:${ name }>`;
            let tagEnd = `</d:${ name }>`;
            let data = ""
            let processingChunk = "";
            let previousChunk = "";
            let inTag = false;
            let tagEnded = false;
            let index = 0;

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding });

            reader.on('data', (chunk) =>
            {
                if (previousChunk !== "")
                {
                    processingChunk = previousChunk + chunk;
                }
                else
                {
                    processingChunk += chunk;
                }

                while (processingChunk.length > 0)
                {
                    if (!inTag)
                    {
                        index = processingChunk.indexOf(tagStart);

                        if (index > -1)
                        {
                            inTag = true;
                            processingChunk = processingChunk.slice(index + tagStart.length);
                        }
                        else
                        {
                            previousChunk = processingChunk.slice(-tagStart.length);
                            processingChunk = "";
                            break;
                        }
                    }
                    else
                    {
                        index = processingChunk.indexOf(tagEnd);

                        if (index > -1)
                        {
                            inTag = false;
                            data += processingChunk.substring(0, index);
                            processingChunk = "";
                            tagEnded = true;
                            resolve(data);
                            reader.close();
                        }
                        else
                        {
                            data += processingChunk.slice(0, -tagEnd.length)
                            previousChunk = processingChunk.slice(-tagEnd.length);
                            processingChunk = "";
                            break;
                        }
                    }
                }
            });
            reader.on('error', (e) =>
            {
                reject(e);
            });
            reader.on('end', () =>
            {
                if (!tagEnded)
                {
                    reject(`getDataByName Error: Tag "<d:${ name }>" not found in file`);
                }
                else if (inTag)
                {
                    reject(`getDataByName Error: No closing tag "</d:${ name }>" found for "<d:${ name }>"`);
                }
            });
        }).catch(error => { console.error(error); return null; });
    }

    async push(name, data)
    {
        if (!name || !data)
        {
            console.error(`push Error: name or data may not be appropriate`);
            return false;
        }
        else if (name.includes("<d:") || name.includes("</d:"))
        {
            console.error(`push Error: name is not appropriate`);
            return false;
        }
        else if (data.includes("<d:") || data.includes("</d:"))
        {
            console.error(`push Error: Make sure escape any '<d:' or '</d'.`);
            return false;
        }

        const result = await this.pushTask(async () =>
        {
            let isExists = await this.processIsOpenTagExists(name);

            if (isExists && isExists.result)
            {
                console.error(`push Error: Tag "<d:${ name }>" is found in file`)
                return false;
            }
            else
            {
                const result = await this.processPushing(name, data);
                return result;
            }
        });

        return result;
    }

    processPushing(name, data)
    {
        return new Promise((resolve, reject) =>
        {
            let tagStart = `<d:${ name }>\n`;
            let tagEnd = `\n</d:${ name }>\n`;
            let content = tagStart + data + tagEnd;

            const writer = fs.createWriteStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding, flags: "a" });

            writer.on('error', (error) =>
            {
                reject(error);
            });
            writer.on('finish', () =>
            {
                resolve(true);
            });
            writer.write(content);
            writer.end();
        }).catch(error =>
        {
            console.error(error);
            return false;
        });
    }

    async update(name, data)
    {
        if (!name || !data)
        {
            console.error(`update Error: name or data may not be appropriate`);
            return null;
        }
        else if (data.includes("<d:") || data.includes("</d:"))
        {
            console.error(`update Error: Make sure escape any '<d:' or '</d'.`);
            return null;
        }

        const result = await this.pushTask(async () =>
        {
            let isExists1 = await this.processIsOpenTagExists(name);

            if (!isExists1 || !isExists1.result)
            {
                console.error(`hardUpdate Error: Open Tag "<d:${ name }>" is not found in file`)
                return null;
            }
            else if (!isExists1.position && isExists1.position < 0)
            {
                console.error(`hardUpdate Error: Open Tag file position is negative value. Eg. null, value < 0`);
                return null;
            }

            let isExists2 = await this.processIsCloseTagExists(name, isExists1.position);

            if (!isExists2 || !isExists2.result)
            {
                console.error(`hardUpdate Error: Open Tag "<d:${ name }>" is not found in file`)
                return null;
            }
            else if (!isExists2.position && isExists2.position < 0)
            {
                console.error(`hardUpdate Error: Open Tag file position is negative value. Eg. null, value < 0`);
                return null;
            }



            let result1 = await this.processRemoveOpenTag(name, isExists1.position);
            let result2 = await this.processRemoveCloseTag(name, isExists2.position);

            if (!result1 || !result2)
            {
                console.error(`update Error: Could not remove "<d:${ name }>". Data is not inserted. Try clean a file and then 'push' data instead of using 'update'.`)
                return null;
            }

            const result = await this.processPushing(name, data);

            return result;
        });

        return result;
    }


    async hardUpdate(name, data)
    {
        if (!name || !data)
        {
            console.error(`hardUpdate Error: name or data may not be appropriate`);
            return null;
        }
        else if (data.includes("<d:") || data.includes("</d:"))
        {
            console.error(`hardUpdate Error: Make sure escape any '<d:' or '</d'.`);
            return null;
        }

        const result = await this.pushTask(async () =>
        {
            let isExists1 = await this.processIsOpenTagExists(name);

            if (!isExists1 || !isExists1.result)
            {
                console.error(`hardUpdate Error: Open Tag "<d:${ name }>" is not found in file`)
                return null;
            }
            else if (!isExists1.position && isExists1.position < 0)
            {
                console.error(`hardUpdate Error: Open Tag file position is negative value. Eg. null, value < 0`);
                return null;
            }

            let isExists2 = await this.processIsCloseTagExists(name, isExists1.position);

            if (!isExists2 || !isExists2.result)
            {
                console.error(`hardUpdate Error: Open Tag "<d:${ name }>" is not found in file`)
                return null;
            }
            else if (!isExists2.position && isExists2.position < 0)
            {
                console.error(`hardUpdate Error: Open Tag file position is negative value. Eg. null, value < 0`);
                return null;
            }



            let resultRemove = await this.processHardRemove(name);

            await fs.promises.rename(`${ this.filename }.tmp`, this.filename)
                .catch((error) => { resultRemove = false; console.error(error); });

            if (!resultRemove)
            {
                console.error(`hardUpdate Error: Could not remove "<d:${ name }>". Data is not inserted. Try clean a file and then 'push' data instead of using 'hardUpdate'.`)
                return null;
            }

            const result = await this.processPushing(name, data);

            return result;
        });

        return result;
    }

    async isOpenTagExists(name, position = 0)
    {
        if (!name)
        {
            console.error("isOpenTagExists Error: name may not be appropriate");
            return false;
        }

        const result = await this.pushTask(async () =>
        {
            let result = await this.processIsOpenTagExists(name, position);

            if (result) return result;
            else return false;
        });

        return result;
    }

    processIsOpenTagExists(name, startPosition = 0)
    {
        return new Promise((resolve, reject) =>
        {
            let tagStart = `<d:${ name }>`;
            let processingChunk = "";
            let previousChunk = "";
            let index = startPosition;
            let founded = false;

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding });

            reader.on('data', (chunk) =>
            {
                if (previousChunk !== "")
                {
                    processingChunk = previousChunk + chunk;
                }
                else
                {
                    processingChunk += chunk;
                }

                while (processingChunk.length > 0)
                {
                    index = processingChunk.indexOf(tagStart);

                    if (index > -1)
                    {
                        founded = true;
                        let position = reader.bytesRead - this.highWaterMark;
                        if (position < 0) position = 0;

                        let chunkLength = Buffer.byteLength(processingChunk, this.encoding);
                        let margin = chunkLength - this.highWaterMark;

                        processingChunk = processingChunk.substring(0, index)
                        if (margin < 0) margin = 0;
                        position = position + Buffer.byteLength(processingChunk, this.encoding) - margin;

                        resolve({ result: true, position: position });
                        reader.close();
                        break;
                    }
                    else
                    {
                        previousChunk = processingChunk.slice(-tagStart.length);
                        processingChunk = "";
                        break;
                    }
                }
            });
            reader.on('error', (e) =>
            {
                reject(e);
            });
            reader.on('end', () =>
            {
                if (!founded) resolve({ result: null, position: -1 });
            });
        }).catch(error => { console.error(error); return false; });
    }

    async isCloseTagExists(name, position = 0)
    {
        if (!name)
        {
            console.error("isCloseTagExists Error: name may not be appropriate");
            return false;
        }

        const result = await this.pushTask(async () =>
        {
            let result = await this.processIsCloseTagExists(name, position);

            if (result) return result;
            else return false;
        });

        return result;
    }

    processIsCloseTagExists(name, startPosition = 0)
    {
        return new Promise((resolve, reject) =>
        {
            let tagClose = `</d:${ name }>`;
            let processingChunk = "";
            let previousChunk = "";
            let index = startPosition;
            let founded = false;

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding });

            reader.on('data', (chunk) =>
            {
                if (previousChunk !== "")
                {
                    processingChunk = previousChunk + chunk;
                }
                else
                {
                    processingChunk += chunk;
                }

                while (processingChunk.length > 0)
                {
                    index = processingChunk.indexOf(tagClose);

                    if (index > -1)
                    {
                        founded = true;
                        let position = reader.bytesRead - this.highWaterMark;
                        if (position < 0) position = 0;

                        let chunkLength = Buffer.byteLength(processingChunk, this.encoding);
                        let margin = chunkLength - this.highWaterMark;

                        processingChunk = processingChunk.substring(0, index)
                        if (margin < 0) margin = 0;
                        position = position + Buffer.byteLength(processingChunk, this.encoding) - margin;

                        resolve({ result: true, position: position });
                        reader.close();
                        break;
                    }
                    else
                    {
                        previousChunk = processingChunk.slice(-tagClose.length);
                        processingChunk = "";
                        break;
                    }
                }
            });
            reader.on('error', (e) =>
            {
                reject(e);
            });
            reader.on('end', () =>
            {
                if (!founded) resolve({ result: null, position: -1 });
            });
        }).catch(error => { console.error(error); return false; });
    }

    async hardRemove(name)
    {
        if (!name)
        {
            console.error(`hardRemove Error: name may not be appropriate`);
            return false;
        }

        const result = await this.pushTask(async () =>
        {
            let isExists1 = await this.processIsOpenTagExists(name);

            if (!isExists1 || !isExists1.result)
            {
                console.error(`hardRemove Error: Open Tag "<d:${ name }>" is not found in file`)
                return false;
            }
            else if (!isExists1.position && isExists1.position < 0)
            {
                console.error(`hardRemove Error: Open Tag file position is negative value. Eg. null, value < 0`);
                return false;
            }

            let isExists2 = await this.processIsCloseTagExists(name, isExists1.position);

            if (!isExists2 || !isExists2.result)
            {
                console.error(`hardRemove Error: Open Tag "<d:${ name }>" is not found in file`)
                return false;
            }
            else if (!isExists2.position && isExists2.position < 0)
            {
                console.error(`hardRemove Error: Open Tag file position is negative value. Eg. null, value < 0`);
                return false;
            }

            let result = await this.processHardRemove(name);

            await fs.promises.rename(`${ this.filename }.tmp`, this.filename)
                .catch((error) => { result = false; console.error(error); });

            return result;
        });

        return result;
    }

    // This is expansive for large file.
    processHardRemove(name)
    {
        return new Promise((resolve, reject) =>
        {
            let processingChunk = "";
            let previousChunk = "";
            let inTag = false;
            let indexStartTagStart = 0;
            let indexStartTagEnd = 0;
            let indexEndTag = 0;
            let tagName = ""
            let startTag = "";
            let endTag = "";
            let content = "";
            let wholeTag = "";

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding });
            const writer = fs.createWriteStream(`${ this.filename }.tmp`, { encoding: this.encoding });
            const replaceTransform = new Transform({
                transform(chunk, encoding, callback)
                {
                    if (previousChunk !== "")
                    {
                        processingChunk = previousChunk + chunk;
                    }
                    else
                    {
                        processingChunk += chunk;
                    }

                    while (processingChunk.length > 0)
                    {
                        if (!inTag)
                        {
                            indexStartTagStart = processingChunk.indexOf('<d:');

                            if (indexStartTagStart > -1)
                            {
                                processingChunk = processingChunk.substring(indexStartTagStart);
                                indexStartTagStart = processingChunk.indexOf('<d:');
                                indexStartTagEnd = processingChunk.indexOf('>');

                                if (indexStartTagEnd < 0)
                                {
                                    previousChunk = processingChunk;
                                    processingChunk = "";
                                    break;
                                }

                                tagName = processingChunk.substring(indexStartTagStart + 3, indexStartTagEnd);
                                processingChunk = processingChunk.substring(indexStartTagStart + tagName.length + 4);
                                startTag = `<d:${ tagName }>`;
                                endTag = `</d:${ tagName }>`;
                                wholeTag += startTag;
                                inTag = true;
                            }
                            else
                            {
                                previousChunk = processingChunk.slice(-3);
                                processingChunk = "";
                                break;
                            }
                        }
                        else
                        {
                            indexEndTag = processingChunk.indexOf(endTag);

                            if (indexEndTag > -1)
                            {
                                content = processingChunk.substring(0, indexEndTag);

                                wholeTag += `${ content }${ endTag }\n`;
                                processingChunk = processingChunk.substring(indexEndTag + endTag.length);

                                if (tagName !== name) this.push(wholeTag);
                                wholeTag = "";
                                inTag = false;
                            }
                            else
                            {
                                wholeTag += processingChunk.slice(0, -endTag.length)
                                previousChunk = processingChunk.slice(-endTag.length);
                                processingChunk = "";
                                break;
                            }
                        }

                        if (processingChunk.length <= endTag.length)
                        {
                            previousChunk = processingChunk;
                            processingChunk = "";
                            break;
                        }
                    }

                    callback();
                }
            });

            reader.on('error', (error) =>
            {
                reader.close();
                reject(error);
            });
            writer.on('error', (error) =>
            {
                writer.end();
                reject(error);
            });
            writer.on('finish', () =>
            {
                resolve(true);
            });

            reader.pipe(replaceTransform).pipe(writer);
        }).catch(error =>
        {
            console.error(error);
            return false;
        });
    }

    async remove(name)
    {
        if (!name)
        {
            console.error(`remove Error: name may not be appropriate`);
            return false;
        }

        const result = await this.pushTask(async () =>
        {
            let isExists1 = await this.processIsOpenTagExists(name);

            if (!isExists1 || !isExists1.result)
            {
                console.error(`remove Error: Open Tag "<d:${ name }>" is not found in file`)
                return false;
            }
            else if (!isExists1.position && isExists1.position < 0)
            {
                console.error(`remove Error: Open Tag file position is negative value. Eg. null, value < 0`);
                return false;
            }

            let isExists2 = await this.processIsCloseTagExists(name, isExists1.position);

            if (!isExists2 || !isExists2.result)
            {
                console.error(`remove Error: Open Tag "<d:${ name }>" is not found in file`)
                return false;
            }
            else if (!isExists2.position && isExists2.position < 0)
            {
                console.error(`remove Error: Open Tag file position is negative value. Eg. null, value < 0`);
                return false;
            }

            let result1 = await this.processRemoveOpenTag(name, isExists1.position);
            let result2 = await this.processRemoveCloseTag(name, isExists2.position);

            if (result1 && result2) return true;
            else return false;
        });

        return result;
    }


    processRemoveOpenTag(name, position)
    {
        return new Promise((resolve, reject) =>
        {
            let tagStart = `<d:${ name }>`;
            let data = ""
            let processingChunk = "";
            let previousChunk = "";
            let index = 0;
            let emptyString = `<r:${ name }>`;

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding, start: position });
            const writer = fs.createWriteStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding, start: position, flags: "r+" });
            const replaceTransform = new Transform({
                transform(chunk, encoding, callback)
                {
                    if (previousChunk !== "")
                    {
                        processingChunk = previousChunk + chunk;
                    }
                    else
                    {
                        processingChunk += chunk;
                    }

                    data = processingChunk;

                    while (processingChunk.length > 0)
                    {
                        index = processingChunk.indexOf(tagStart);

                        if (index > -1)
                        {
                            data = data.replace(tagStart, emptyString);
                            while (Buffer.byteLength(data, this.encoding) > this.highWaterMark)
                            {
                                data = data.substring(1);
                            }
                            this.push(data);
                            reader.close();
                            writer.end();
                            break;
                        }
                        else
                        {
                            previousChunk = processingChunk.slice(-tagStart.length);
                            processingChunk = "";
                            break;
                        }
                    }

                    callback();
                }
            });

            reader.on('error', (error) =>
            {
                reader.close();
                reject(error);
            });
            writer.on('error', (error) =>
            {
                writer.end();
                reject(error);
            });
            writer.on('finish', () =>
            {
                resolve(true);
            });

            reader.pipe(replaceTransform).pipe(writer);
        }).catch(error =>
        {
            console.error(error);
            return false;
        });
    }

    processRemoveCloseTag(name, position)
    {
        return new Promise((resolve, reject) =>
        {
            let tagStart = `</d:${ name }>`;
            let data = ""
            let processingChunk = "";
            let previousChunk = "";
            let index = 0;
            let emptyString = `</r:${ name }>`;

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding, start: position });
            const writer = fs.createWriteStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding, start: position, flags: "r+" });
            const replaceTransform = new Transform({
                transform(chunk, encoding, callback)
                {
                    if (previousChunk !== "")
                    {
                        processingChunk = previousChunk + chunk;
                    }
                    else
                    {
                        processingChunk += chunk;
                    }

                    data = processingChunk;

                    while (processingChunk.length > 0)
                    {
                        index = processingChunk.indexOf(tagStart);

                        if (index > -1)
                        {
                            data = data.replace(tagStart, emptyString);
                            while (Buffer.byteLength(data, this.encoding) > this.highWaterMark)
                            {
                                data = data.substring(1);
                            }
                            this.push(data);
                            reader.close();
                            writer.end();
                            break;
                        }
                        else
                        {
                            previousChunk = processingChunk.slice(-tagStart.length);
                            processingChunk = "";
                            break;
                        }
                    }

                    callback();
                }
            });

            reader.on('error', (error) =>
            {
                reader.close();
                reject(error);
            });
            writer.on('error', (error) =>
            {
                writer.end();
                reject(error);
            });
            writer.on('finish', () =>
            {
                resolve(true);
            });

            reader.pipe(replaceTransform).pipe(writer);
        }).catch(error =>
        {
            console.error(error);
            return false;
        });
    }

    // This is expansive for large file.
    // Remove all non-tag data from a file.
    async clean()
    {
        const result = await this.pushTask(async () =>
        {
            let result = await this.processClean();

            await fs.promises.rename(`${ this.filename }.tmp`, this.filename)
                .catch((error) => { result = false; console.error(error); });

            return result;
        });

        return result;
    }

    processClean()
    {
        return new Promise((resolve, reject) =>
        {
            let processingChunk = "";
            let previousChunk = "";
            let inTag = false;
            let indexStartTagStart = 0;
            let indexStartTagEnd = 0;
            let indexEndTag = 0;
            let tagName = ""
            let startTag = "";
            let endTag = "";
            let content = "";
            let wholeTag = "";

            const reader = fs.createReadStream(this.filename, { highWaterMark: this.highWaterMark, encoding: this.encoding });
            const writer = fs.createWriteStream(`${ this.filename }.tmp`, { encoding: this.encoding });
            const replaceTransform = new Transform({
                transform(chunk, encoding, callback)
                {
                    if (previousChunk !== "")
                    {
                        processingChunk = previousChunk + chunk;
                    }
                    else
                    {
                        processingChunk += chunk;
                    }

                    while (processingChunk.length > 0)
                    {
                        if (!inTag)
                        {
                            indexStartTagStart = processingChunk.indexOf('<d:');

                            if (indexStartTagStart > -1)
                            {
                                processingChunk = processingChunk.substring(indexStartTagStart);
                                indexStartTagStart = processingChunk.indexOf('<d:');
                                indexStartTagEnd = processingChunk.indexOf('>');

                                if (indexStartTagEnd < 0)
                                {
                                    previousChunk = processingChunk;
                                    processingChunk = "";
                                    break;
                                }

                                tagName = processingChunk.substring(indexStartTagStart + 3, indexStartTagEnd);
                                processingChunk = processingChunk.substring(indexStartTagStart + tagName.length + 4);
                                startTag = `<d:${ tagName }>`;
                                endTag = `</d:${ tagName }>`;
                                wholeTag += startTag;
                                inTag = true;
                            }
                            else
                            {
                                previousChunk = processingChunk.slice(-3);
                                processingChunk = "";
                                break;
                            }
                        }
                        else
                        {
                            indexEndTag = processingChunk.indexOf(endTag);

                            if (indexEndTag > -1)
                            {
                                content = processingChunk.substring(0, indexEndTag);

                                wholeTag += `${ content }${ endTag }\n`;
                                processingChunk = processingChunk.substring(indexEndTag + endTag.length);

                                this.push(wholeTag);
                                wholeTag = "";
                                inTag = false;
                            }
                            else
                            {
                                wholeTag += processingChunk.slice(0, -endTag.length)
                                previousChunk = processingChunk.slice(-endTag.length);
                                processingChunk = "";
                                break;
                            }
                        }
                    }

                    callback();
                }
            });

            reader.on('error', (error) =>
            {
                reader.close();
                reject(error);
            });
            writer.on('error', (error) =>
            {
                writer.end();
                reject(error);
            });
            writer.on('finish', () =>
            {
                resolve(true);
            });

            reader.pipe(replaceTransform).pipe(writer);
        }).catch(error =>
        {
            console.error(error);
            return false;
        });
    }
}
