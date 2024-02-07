const Tot = require('../src/index.js');
const tot = new Tot("./test/data.tot", 1024, 'utf8');

test(`test getDataByName("dog")`, async () =>
{
    const data = await tot.getDataByName("dog")
    let result = false;
    if (data.includes("The dog is a domesticated descendant of the wolf.")) result = true;
    expect(result).toBe(true);
});

test(`test push("rabbit"), this prints error`, async () =>
{
    const data = await tot.push("rabbit", "Rabbits are small mammals in the family.")
    expect(data).toBe(false);
});

test(`test hardRemove("frog")`, async () =>
{
    const data = await tot.hardRemove("frog")
    expect(data).toBe(true);
});

test(`test push("frog")`, async () =>
{
    const data = await tot.push("frog", "A frog is any member of a diverse and carnivorous group of tailless amphibians belonging to the order Anura.")
    expect(data).toBe(true);
});