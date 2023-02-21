const Tot = require('../src/index.js');

async function test()
{
    const tot = new Tot("data.tot", 'utf8', 1024);

    console.log(await tot.getDataByName("dog"));

    await tot.getDataByName("cat").then(function (result)
    {
        console.log(result);
    });

    let data;

    await tot.getDataByName("horse").then(function (result)
    {
        data = result;
    });
    console.log(data);

    await tot.push("frog", "A frog is any member of a diverse and carnivorous group of tailless amphibians belonging to the order Anura.").then((result) =>
    {
        console.log(`frog push returns: ${ result }`);
    });
    await tot.push("duck", "Duck is the bird from numerous species of waterfowl in the family Anatidae.")
        .then((result) =>
        {
            console.log(`duck push returns: ${ result }`);
        });
    await tot.push("rabbit", "Rabbits are small mammals in the family.")
        .then((result) =>
        {
            console.log(`rabbit push returns: ${ result }`);
        });
    await tot.push("test", "this is a test")
        .then((result) =>
        {
            console.log(`test push returns: ${ result }`);
        });
    await tot.getDataByName("rabbit")
        .then((result) =>
        {
            console.log(result);
        });

    await tot.getDataByName("test")
        .then((result) =>
        {
            console.log(result);
        });
    await tot.getDataByName("test3")
        .then((result) =>
        {
            console.log(result);
        });

    await tot.isOpenTagExists("test")
        .then((result) =>
        {
            console.log(`test exists?: ${ result.result }`);
        });

    await tot.isOpenTagExists("rabbit")
        .then((result) =>
        {
            console.log(`rabbit exists?: ${ result.result }`);
        });

    await tot.isOpenTagExists("test2")
        .then((result) =>
        {
            console.log(`test2 exists?: ${ result.result }`);
        });
    await tot.push("test", "this is a test")
        .then((result) =>
        {
            console.log(`test push returns: ${ result }`);
        });
    await tot.hardRemove("rabbit")
        .then((result) =>
        {
            console.log(result);
        });
    await tot.remove("test")
        .then((result) =>
        {
            console.log(result);
        });
    await tot.remove("duck")
        .then((result) =>
        {
            console.log(result);
        });
    await tot.push("rabbit", "Rabbits are small mammals in the family.")
        .then((result) =>
        {
            console.log(`rabbit push returns: ${ result }`);
        });
    await tot.remove("rabbit")
        .then((result) =>
        {
            console.log(result);
        });
    await tot.remove("frog")
        .then((result) =>
        {
            console.log(result);
        });
    await tot.push("rabbit", "Rabbits are small mammals in the family.")
        .then((result) =>
        {
            console.log(`rabbit push returns: ${ result }`);
        });
    await tot.push("frog", "A frog is any member of a diverse and carnivorous group of tailless amphibians belonging to the order Anura.").then((result) =>
    {
        console.log(`frog push returns: ${ result }`);
    });
    await tot.clean();
}

test();