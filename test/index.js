import { Tot } from '../src/index.js';

const tot = new Tot();

test(`test clean()`, async () =>
{
    await tot.qPush("./test/data.tot", "test", "This is right name and right data.");
    await tot.qUpdate("./test/data.tot", "test", "This is updated!");
    let result = await tot.qClean("./test/data.tot");
    await tot.qHardRemove("./test/data.tot", "test");

    expect(result).toBe(true);
});

test(`test getAll()`, async () =>
{
    let result = await tot.qGetAll("./test/data.tot");
    expect(result.length).toBe(5);
});

test(`test getDataByName()`, async () =>
{
    const data = await tot.qGetDataByName("./test/data.tot", "dog");
    let result = false;
    if (data.includes("The dog is a domesticated descendant of the wolf.")) result = true;
    expect(result).toBe(true);
});

test(`test getDataByName()`, async () =>
{
    const data = await tot.qGetDataByName("./test/data.tot", "dog");
    let result = false;
    if (data.includes("The dog is a domesticated descendant of the wolf.")) result = true;
    expect(result).toBe(true);
});

test(`test getDataByNameAt()`, async () =>
{
    const data = await tot.qGetDataByNameAt("./test/data.tot", "dog", 20);
    let result = true;
    if (!data) result = false;

    expect(result).toBe(false);
});

test(`test getMultiple()`, async () =>
{
    let result = await tot.qGetMultiple("./test/data.tot", 3, 0);
    expect(result.itemList.length).toBe(3);
});

test(`test hardRemove(), right`, async () =>
{
    await tot.qPush("./test/data.tot", "test", "This is right name and right data");
    let result = await tot.qHardRemove("./test/data.tot", "test");
    expect(result).toBe(true);
});

test(`test hardRemove(), check data removed`, async () =>
{
    await tot.qPush("./test/data.tot", "test", "This is right name and right data");
    await tot.qHardRemove("./test/data.tot", "test");
    let result = await tot.qIsOpenTagExists("./test/data.tot", "test");
    expect(result.result).toBe(false);
});

test(`test hardUpdate()`, async () =>
{
    await tot.qPush("./test/data.tot", "test", "This is right name and right data.");
    let result = await tot.qUpdate("./test/data.tot", "test", "This is updated!");
    await tot.qHardRemove("./test/data.tot", "test");

    expect(result).toBe(true);
});

test(`test isOpenTagExists(), true`, async () =>
{
    let result = await tot.qIsOpenTagExists("./test/data.tot", "dog");
    expect(result.result).toBe(true);
});

test(`test isOpenTagExists(), false`, async () =>
{
    let result = await tot.qIsOpenTagExists("./test/data.tot", "dragon");
    expect(result.result).toBe(false);
});

test(`test push() with same name`, async () =>
{
    const data = await tot.qPush("./test/data.tot", "rabbit", "Rabbits are small mammals in the family.")
    expect(data).toBe(false);
});

test(`test push() with right name and data after remove`, async () =>
{
    await tot.qHardRemove("./test/data.tot", "frog")
    const data = await tot.qPush("./test/data.tot", "frog", "A frog is any member of a diverse and carnivorous group of tailless amphibians belonging to the order Anura.")
    expect(data).toBe(true);
});

test(`test push() with wrong name`, async () =>
{
    const data = await tot.qPush("./test/data.tot", "<d:test>", "This is wrong name.")
    expect(data).toBe(false);
});

test(`test push() with null name`, async () =>
{
    const data = await tot.qPush("./test/data.tot", null, "This is wrong name.")
    expect(data).toBe(false);
});

test(`test push() with null data`, async () =>
{
    const data = await tot.qPush("./test/data.tot", "test", null)
    expect(data).toBe(false);
});

test(`test push() with empty name`, async () =>
{
    const data = await tot.qPush("./test/data.tot", "", "This is wrong name.")
    expect(data).toBe(false);
});

test(`test push() with wrong data`, async () =>
{
    const data = await tot.qPush("./test/data.tot", "test", "<d:test>This is wrong data.")
    expect(data).toBe(false);
});

test(`test remove(), right`, async () =>
{
    await tot.qPush("./test/data.tot", "test", "This is right name and right data.");
    let result = await tot.qRemove("./test/data.tot", "test");
    await tot.qClean("./test/data.tot");
    expect(result).toBe(true);
});

test(`test update(), right`, async () =>
{
    await tot.qPush("./test/data.tot", "test", "This is right name and right data.");
    let result = await tot.qUpdate("./test/data.tot", "test", "This is updated!");
    await tot.qHardRemove("./test/data.tot", "test");

    expect(result).toBe(true);
});
