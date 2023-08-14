# 🥇 Tot.js

Tot is not totally new but a file format for managing data in a file. This is JS version of managing a Tot file format. There are JSON, XML and many other formats available. And this is just an another format that look like markup language but it is much more simplified. This format only takes the advantage of tags that we know where the start of data is and where the end of data is. And storing the name of data. This format can handle massive data as it is designed to be that way but it cannot be more than what hardware can handle. Just like how other structured formats can't. So limiting a data in one tag might be useful to handle unexpected behavior. It is up to user and up to user's hardwares. Normally you can write a code to limit the data up to 64KiB (65536 bytes). That would just be good and big enough in general.

Tot.js use String for everything. So mostly it is using functions from String object for better performance. It is using mutex and something similar to semaphore (We have not added limits yet..) so it can handle data in a single file safely. Make sure you make a backup of your tot file.

## 👨‍🏫 Notice

Some cases Tot can cause lots of writing. It is sill better than always writing whole data file though. However I recommend avoid using hardRemove() or hardUpdate(). They only exist for small files. It is always better when you modify small with update() and remove(). And use clean() like once a day, a week or a month.

## ▶️ Install

```
npm i totjs
```

## 📜 Tot file format rules

1. We must put data in tags like this:

```
<d:TagName>Data</d:TagName>
```

2. We must not wrap data tag with other data tag

```
// Do not do this, by not doing it we can avoid many misunderstanding of this world
<d:TagName1><d:TagName2>Data</d:TagName2></d:TagName1>

// Instead put JSON or XML data inside
<d:TagName1>XML</d:TagName1><d:TagName2>JSON</d:TagName2>
```

2. When we remove data in the future, we mark remove like this:

```
// This will be removed when file is cleaned.
// clean() will only maintain <d:TagName>Data</d:TagName>.
// clean() will remove <r:TagName>Data</r:TagName> and other strings that is not in tags of <d:>
<r:TagName>Data</r:TagName>
```

3. We must not use these characters in tags:

```
:
<
>
```

4. We must not use these in data:

```
<d:
<d:TagName>
</d:
</d:TagName>
<r:
<r:TagName>
</r:
</r:TagName>
```

5. Escaping. You can use entities or use your own escaping mechanism. But we support one escaping mechanism by default. If you don't escape your data would not be added to the file.

```
// our escaping
<\d:data>
<\/d:data>
// They are going to converted for you when you call get function.
<\d:data> -> <d:data>
<\/d:data> -> </d:data>
```

6. Escaping for strings or characters above not allowed
7. The structure of format shound not be changed by version of format.
8. By keeping all of the rules this format itself will be straight forward and flexible until our technology makes a big change

## 👩‍🎓 Tutorial

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

```

## 💪 Support Tot

### 👼 Become a Sponsor

- [Ko-fi](https://ko-fi.com/opdev1004)
- [Github sponsor page](https://github.com/sponsors/opdev1004)

### 🎁 Shop

- [RB Geargom Shop](https://www.redbubble.com/people/Geargom/shop)

## 👨‍💻 Author

[Victor Chanil Park](https://github.com/opdev1004)

## 💯 License

MIT, See [LICENSE](./LICENSE).
