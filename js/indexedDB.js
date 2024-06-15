//打开或者创建数据库
function openDB(dbName, version = 1) {
  return new Promise((resolve, reject) => {
    // 兼容浏览器
    var indexedDB =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB;
    let db;
    // 打开数据库，若没有则会创建
    const request = indexedDB.open(dbName, version);

    // 数据库打开成功回调
    request.onsuccess = function (event) {
      db = event.target.result; // 数据库对象
      console.log("数据库打开成功");
      resolve(db);
    };

    // 数据库打开失败的回调
    request.onerror = function (event) {
      console.log("数据库打开报错");
      reject(event.target.error);
    };

    // 数据库有更新时候的回调
    request.onupgradeneeded = function (event) {
      // 数据库创建或升级的时候会触发
      console.log("onupgradeneeded");
      db = event.target.result; // 数据库对象

      // 创建 'user' 对象存储
      if (!db.objectStoreNames.contains("users")) {
        var objectStore = db.createObjectStore("users", { keyPath: "userId" });
        objectStore.createIndex("userId", "userId", { unique: true });
        objectStore.createIndex("password", "password", { unique: false });
        objectStore.createIndex("type", "type", { unique: false });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("submittedlist", "submittedlist", {
          unique: false,
        });
        objectStore.createIndex("unsubmittedlist", "unsubmittedlist", {
          unique: false,
        });
        objectStore.createIndex("disable", "disable", { unique: false });
        objectStore.createIndex("isAllowRegister", "isAllowRegister", {
          unique: false,
        });
      }

      // 创建 'problem' 对象存储
      if (!db.objectStoreNames.contains("problem")) {
        var problemStore = db.createObjectStore("problem", {
          keyPath: "problemId",
          autoIncrement: true,
        });
        problemStore.createIndex("title", "title", { unique: false });
        problemStore.createIndex("content", "content", { unique: false });
      }

      // 创建 'submit' 对象存储，并设置复合主键
      if (!db.objectStoreNames.contains("submit")) {
        var submitStore = db.createObjectStore("submit", {
          keyPath: ["problemId", "userId"],
          autoIncrement: false,
        });
        submitStore.createIndex("problemId", "problemId", { unique: false });
        submitStore.createIndex("userId", "userId", { unique: false });
        submitStore.createIndex("text", "text", { unique: false });
        submitStore.createIndex("count", "count", { unique: false });
        submitStore.createIndex("isCorrect", "isCorrect", { unique: false });
        submitStore.createIndex("updated", "updated", { unique: false });
      }

      // 创建 'announcement' 对象存储
      if (!db.objectStoreNames.contains("announcement")) {
        var announcementStore = db.createObjectStore("announcement", {
          keyPath: "announcementId",
          autoIncrement: true,
        });
        announcementStore.createIndex("title", "title", { unique: false });
        announcementStore.createIndex("content", "content", { unique: false });
        announcementStore.createIndex("date", "date", { unique: false });
        announcementStore.createIndex("isvisited", "isvisited", {
          unique: false,
        });
      }
    };
  });
}
//插入数据
function addData(db, storeName, data) {
  return new Promise((resolve, reject) => {
    var request = db
      .transaction([storeName], "readwrite") // 事务对象 指定表格名称和操作模式（"只读"或"读写"）
      .objectStore(storeName) // 仓库对象
      .add(data);

    request.onsuccess = function (event) {
      console.log("数据写入成功");
      resolve(true);
    };

    request.onerror = function (event) {
      console.log("数据写入失败");
      resolve(false);
    };
  });
}
//通过主键查询数据
function getDataByKey(db, storeName, key) {
  return new Promise((resolve, reject) => {
    var transaction = db.transaction([storeName]);
    var objectStore = transaction.objectStore(storeName);
    var request = objectStore.get(key);

    request.onerror = function (event) {
      console.log("事务失败");
      reject("事务失败");
    };

    request.onsuccess = function (event) {
      console.log("主键查询结果: ", request.result);
      if (request.result === undefined) {
        resolve(false);
      }
      resolve(request.result);
    };
  });
}
//通过游标查询数据
function cursorGetData(db, storeName) {
  return new Promise((resolve, reject) => {
    let list = []; // 存储读取的数据
    const store = db
      .transaction(storeName, "readonly") // 应该是 "readonly"
      .objectStore(storeName); // 获取对象存储

    const request = store.openCursor(); // 创建游标

    // 成功回调，逐行读取数据
    request.onsuccess = function (e) {
      const cursor = e.target.result;
      if (cursor) {
        list.push(cursor.value); // 添加当前游标指向的数据到列表
        cursor.continue(); // 继续移动到下一条记录
      } else {
        // 如果游标遍历完成，解析整个列表
        console.log("游标读取的数据：", list);
        resolve(list); // 应该使用resolve来解析Promise
      }
    };

    // 错误回调
    request.onerror = function (e) {
      console.error("游标读取失败：", e);
      reject(e); // 使用reject来拒绝Promise
    };
  });
}
//通过索引和游标查询数据
function cursorGetDataByIndex(db, storeName, indexName, indexValue) {
  return new Promise((resolve, reject) => {
    let list = [];
    var store = db.transaction(storeName, "readwrite").objectStore(storeName); // 仓库对象
    var request = store
      .index(indexName) // 索引对象
      .openCursor(IDBKeyRange.only(indexValue)); // 指针对象
    request.onsuccess = function (e) {
      var cursor = e.target.result;
      if (cursor) {
        // 必须要检查
        list.push(cursor.value);
        cursor.continue(); // 遍历了存储对象中的所有内容
      } else {
        if (list.length === 0) {
          resolve(false);
        }
        console.log("游标索引查询结果：", list);
        resolve(list);
      }
    };
    request.onerror = function (e) {
      console.error("游标索引查询失败：", e);
      reject(e);
    };
  });
}
//更新数据
function updateDB(db, storeName, data) {
  return new Promise((resolve, reject) => {
    var request = db
      .transaction([storeName], "readwrite") // 事务对象
      .objectStore(storeName) // 仓库对象
      .put(data);

    request.onsuccess = function () {
      console.log("数据更新成功");
      resolve(true);
    };

    request.onerror = function () {
      console.log("数据更新失败");
      resolve(false);
    };
  });
}
//通过主键删除数据
function deleteDB(db, storeName, id) {
  return new Promise((resolve, reject) => {
    var request = db
      .transaction([storeName], "readwrite")
      .objectStore(storeName)
      .delete(id);

    request.onsuccess = function () {
      console.log("数据删除成功");
      resolve(true);
    };

    request.onerror = function () {
      console.log("数据删除失败");
      resolve(false);
    };
  });
}
//关闭数据库
function closeDB(db) {
  db.close();
  console.log("数据库已关闭");
}
//删除数据库
function deleteDBAll(dbName) {
  console.log(dbName);
  let deleteRequest = window.indexedDB.deleteDatabase(dbName);
  deleteRequest.onerror = function (event) {
    console.log("删除失败");
  };
  deleteRequest.onsuccess = function (event) {
    console.log("删除成功");
  };
}
