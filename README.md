# 🥇 Tot.js

Tot is a database file format for managing string data in a file. I would like to say markup-like database without indexing. It is using stream and position to efficiently track where the data is. And it is designed to handle massive data. But developer has full control over limitting the size of data in one tag. Eg. 65536 bytes in one tag. Tot is for replacing some jobs that database, JSON and XML do.

## 👨‍🏫 Notice

### 🎉 Release version 2.0.0

Everything is rewritten to the newest algorithm without bug. The algorithm is up to date with the nuget C# Tot CS.

Any function starts with q, they are going to be queued. But you can only use them with Tot instance like `const tot = new Tot()`. Make it global variable and make your IO operation to database file safe. Static version is provided for building own system.

For migration, sadly this is just totally different from old version. You can have a look at test code and try your best.

### 📢 About how you handle data writes

Some cases Tot can cause lots of writing. It is sill better than writing whole file every time. I recommend avoid using HardRemove() or HardUpdate(). They only exist for small files. It is always better when we modify small data with Update() and Remove(). And use Clean() like once a day, a week or a month.

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

Please see /documents and /test folder.

## 💪 Support Tot

### 👼 Become a Sponsor

- [Ko-fi](https://ko-fi.com/opdev1004)
- [Github sponsor page](https://github.com/sponsors/opdev1004)

## 👨‍💻 Author

[Victor Chanil Park](https://github.com/opdev1004)

## 💯 License

MIT, See [LICENSE](./LICENSE).
