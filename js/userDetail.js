
var userData = {
  userId: "0",
  password: "0",//密码
  type: "guest",
  name: "Guest",//昵称
  submittedlist: [],
  unsubmittedlist: [],//个人待办事项
  disable: false,
  isAllowRegister: true,
  autograph: "奋发进取",//签名档
};
//初始化个人信息
function initializeUserDetail(currentUserID) {
  //从数据库获取当前个人信息
  openDB("OJSystemDB", 1).then(function (db) {
    db = db;
    //查找我的数据
    getDataByKey(db, "user", currentUserID)
      .then(function (myData ) {
        if (myData !== false) {
          userData = myData;
          // 设置昵称、密码、签名档的默认值
          document.getElementById('nickname').value = userData.name;
          document.getElementById('password').value = userData.password;
          document.getElementById('signature').value = userData.autograph;
          // 将个人待办事项设置为只读
          document.getElementById('todo').value = userData.unsubmittedlist.join(', ');
          console.log(userData.unsubmittedlist[0]);
          document.getElementById('todo').readOnly = true;
        }
      })
      .catch(function (error) {
        console.error(error);
      });
    //关闭数据库
    closeDB(db);
  });
}
//保存信息
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('saveProfile').addEventListener('click', function() {
    // 获取输入框的值
    var nickname = document.getElementById('nickname').value;
    var password = document.getElementById('password').value;
    var signature = document.getElementById('signature').value;
    console.log("保存的数据：" + userData);
    // 解析当前页面的URL
    const queryParams = new URLSearchParams(window.location.search);
    // 从查询字符串中获取userId
    const currentUserID = queryParams.get("userId");
    
    // 更新数据库中的用户信息
    openDB("OJSystemDB", 1).then(function (db) {
      db = db;
      //查找我的数据
      getDataByKey(db, "user", currentUserID)
      .then(function (element ) {
        let updateData = {
          userId: element.userId,
          password: sha256Encrypt(password),
          type: element.type,
          name: nickname,
          submittedlist: element.submittedlist,
          unsubmittedlist: element.unsubmittedlist,
          disable: element.disable,
          isAllowRegister: element.isAllowRegister,
          autograph: signature,
        }
        updateDB(db, "user", updateData).then(function (updateResult) {
          console.log(updateResult);
          if(updateResult === true) {
            swal("保存成功", "", "success");
            userData.name = nickname;
            userData.password = sha256Encrypt(password);
            userData.autograph = signature;
            // initializeUserDetail(userData.userId);
          } else {
            swal("保存失败", "", "error");
          }        
        }).catch(function (error) {
          console.error(error);
        });
      })
      .catch(function (error) {
        console.error(error);
      });      
    })
  });
});