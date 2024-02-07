# 🥇 Tot.js

Tot is a file format for managing string data in a file. I would like to say markup-like database without indexing. It is using stream and position to efficiently track where the data is. And it is designed to handle massive data. But you have full control over limitting the size of data in one tag. Eg. 65536 bytes in one tag. Totjs has a task managing algorithm so it make sure each IO task is done safely by one by one. But it is still asynchronous IO operation. So you don't have to worry about the IO performance and error handling. We still need more data for more complicated cases but in our test Totjs is a fine database.

## 👨‍🏫 Notice

### 🎉 From version 1.0.0

All the code is reworked and tested. And we are having official release of 1.0.0 tot.js.

We are not using mutex anymore. But we are using the task processing system. Each task will be done one by one. That way will be more safe and doing same job like mutex. Now you can check if tag exists with position. Error handling is reworked. You will get null or false for errors.

### 📢 About how you handle data writes

Some cases Tot can cause lots of writing. It is sill better than writing whole file every time. I recommend avoid using hardRemove() or hardUpdate(). They only exist for small files. It is always better when you modify small with update() and remove(). And use clean() like once a day, a week or a month.

## ▶️ Install

```
npm i totjs
```

## 🔄 Testing

```
npm run test
```

We are using jest. Please feel free to add more tests.

## 📖 Example and any other documents

Please see /documents folder. And read what you need.

## 👩‍🎓 Simple Example

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
    await tot.push("rabbit", "Rabbits are small mammals in the family.")
        .then((result) =>
        {
            console.log(`rabbit push returns: ${ result }`);
        });

    // this is how we update data
    await tot.update("rabbit", "Rabbits are small mammals in the family.")
        .then((result) =>
        {
            console.log(`rabbit update returns: ${ result }`);
        });

    // This marks the tag to be removed
    await tot.remove("rabbit")
        .then((result) =>
        {
            console.log(result);
        });

    // Cleaning up, remove data that is marked for remove and other useless data
    await tot.clean();
}

test()
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
