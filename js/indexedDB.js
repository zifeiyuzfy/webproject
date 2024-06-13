//打开或者创建数据库
function openDB(dbName, version = 1) {
    return new Promise((resolve, reject) => {
      //  兼容浏览器
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
      };
      // 数据库有更新时候的回调
      request.onupgradeneeded = function (event) {
        // 数据库创建或升级的时候会触发
        console.log("onupgradeneeded");
        db = event.target.result; // 数据库对象
        var objectStore;
        // 创建存储库
        objectStore = db.createObjectStore("users", {
          keyPath: "userid", // 这是主键
          // autoIncrement: true // 实现自增
        });
        // 创建索引，在后面查询数据的时候可以根据索引查
        objectStore.createIndex("userid", "userid", { unique: true }); 
        objectStore.createIndex("password", "password", { unique: false });
        objectStore.createIndex("type", "type", { unique: false });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("submittedlist", "submittedlist", { unique: false });
        objectStore.createIndex("unsubmittedlist", "unsubmittedlist", { unique: false });
        objectStore.createIndex("disable", "disable", { unique: false });
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
      if(request.result === undefined){
        resolve(false);
      }
      resolve(request.result);
    };
  });
}
//通过游标查询数据
function cursorGetData(db, storeName) {
  return new Promise((resolve, reject) => {
    let list = [];
    var store = db
      .transaction(storeName, "readwrite") // 事务
      .objectStore(storeName); // 仓库对象
    var request = store.openCursor(); // 指针对象
    // 游标开启成功，逐行读数据
    request.onsuccess = function (e) {
      var cursor = e.target.result;
      if (cursor) {
        // 必须要检查
        list.push(cursor.value);
        cursor.continue(); // 遍历了存储对象中的所有内容
      } else {
        if(list.length === 0){
          resolve(false);
        }
        console.log("游标读取的数据：", list);
        resolve(list);
      }
    };
    request.onerror = function (e) {
      console.error("游标读取失败：", e);
      reject(e);
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
        if(list.length === 0){
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