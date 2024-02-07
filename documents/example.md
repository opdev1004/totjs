# 👩‍🎓 Example

```
const Tot = require('totjs');

async function test()
{
    const tot = new Tot();
    // set filename, file path + name
    await tot.open("data.tot");
    // create a 'data.tot' file
    await tot.create();

    // this is how we add data
    await tot.push("frog", "A frog is any member of a diverse and carnivorous group of tailless amphibians belonging to the order Anura.")
        .then((result) =>
        {
            console.log(`frog push returns: ${ result }`);
        });

    await tot.push("rabbit", "Rabbits are small mammals in the family.")
        .then((result) =>
        {
            console.log(`rabbit push returns: ${ result }`);
        });

    // this is how we update data, there is the version that doese with hard remove.
    await tot.update("rabbit", "Rabbits are small mammals in the family.")
        .then((result) =>
        {
            console.log(`rabbit update returns: ${ result }`);
        });

    await tot.hardUpdate("rabbit", "Rabbits are small mammals in the family.")
        .then((result) =>
        {
            console.log(`rabbit update returns: ${ result }`);
        });


    // This marks the tag to be removed after clean() called
    await tot.remove("rabbit")
        .then((result) =>
        {
            console.log(result);
        });

    // Cleaning up, remove data that is marked for remove and other useless data
    await tot.clean();

    // this literally restructure everything and remove and the same time
    // This is for when we remove data from a small file
    // In general, regular multiple remove() and clean() is better efficiency
    await tot.hardRemove("frog")
        .then((result) =>
        {
            console.log(result);
        });

    // how to check if the data exists
    await tot.isOpenTagExists("frog")
        .then((result) =>
        {
            console.log(result);
        });

    await tot.isCloseTagExists("frog")
        .then((result) =>
        {
            console.log(result);
        });
}

test()
```
