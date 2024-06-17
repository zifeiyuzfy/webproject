let db;
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("OJSystemDB", 1); // 这里的 'OJSystemDB' 是数据库名，1 是版本号

    request.onupgradeneeded = function (e) {
      // 数据库创建或升级逻辑
    };

    request.onsuccess = function (e) {
      db = request.result; // 将数据库实例赋值给全局变量 db
      resolve(db);
    };

    request.onerror = function (e) {
      // 处理错误
    };
  });
}

const userId = localStorage.getItem("userId");

function fetchUserSubmits() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["submit"], "readonly");
    const store = transaction.objectStore("submit");
    // 使用getAll方法来获取所有提交记录
    const request = store.getAll();

    request.onsuccess = function (event) {
      const allSubmits = event.target.result;
      console.log("All submits retrieved:", allSubmits); // 打印所有提交记录

      // 过滤出当前用户的提交记录
      const userSubmits = allSubmits.filter(
        (submit) => submit.userId === userId
      );
      console.log("User submits after filtering:", userSubmits); // 打印过滤后的提交记录

      if (userSubmits.length === 0) {
        console.log("No submits found for user ID:", userId); // 如果没有找到提交记录，打印提示信息
      }

      resolve(userSubmits);
    };

    request.onerror = function (error) {
      console.error("Error fetching submits:", error); // 打印错误信息
      reject(error);
    };
  });
}

function fillAccordions(submits) {
  const unsubmittedContainer = document.getElementById("unSubmitted");
  const submittedContainer = document.getElementById("Submitted");

  // 开始读取问题数据
  const transactionProblem = db.transaction(["problem"], "readonly");
  const problemStore = transactionProblem.objectStore("problem");
  const problemRequest = problemStore.getAll();

  problemRequest.onsuccess = function (event) {
    const problems = event.target.result;
    const submittedProblemIds = new Set(
      submits.map((submit) => submit.problemId)
    );

    // 清空现有列表
    unsubmittedContainer.innerHTML = "";
    submittedContainer.innerHTML = "";

    problems.forEach(function (problem) {
      // 创建列表项
      let listItem = document.createElement("li");
      listItem.className =
        "list-group-item d-flex justify-content-between align-items-center";
      listItem.textContent = problem.title;
      listItem.style.listStyleType = "none"; // 去掉项目符号
      listItem.style.fontSize = "16px"; // 设置字体大小
      listItem.style.color = "#333"; // 设置字体颜色
      listItem.style.fontFamily = "Arial, sans-serif"; // 设置字体族
      listItem.style.fontWeight = "normal"; // 设置字体粗细，例如 'bold', 'normal', 'lighter' 等
      listItem.style.textShadow = "1px 1px 2px #ccc"; // 添加文本阴影效果
      listItem.style.cursor = "pointer"; // 当鼠标悬停时显示手指图标，如果该列表项可点击的话
      listItem.style.padding = "8px 16px"; // 设置内边距
      listItem.style.borderBottom = "1px solid #ddd"; // 设置底部边框，增加层次感
      listItem.style.transition = "background-color 0.3s ease"; // 设置悬停时的背景色渐变效果

      // 创建按钮容器
      let buttonContainer = document.createElement("div");
      buttonContainer.className = "button-container";

      // 应用样式的函数
      const applyStyles = (button, className) => {
        // 设置基础样式
        button.style.padding = "10px 20px";
        button.style.fontSize = "16px";
        button.style.color = "#ffffff";
        button.style.border = "none";
        button.style.borderRadius = "5px";
        button.style.cursor = "pointer";
        button.style.outline = "none";
        button.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"; // 添加轻微的阴影
        button.style.transition =
          "background-color 0.3s ease, box-shadow 0.3s ease"; // 平滑的背景色和阴影变化

        // 为不同的按钮类添加不同的背景色和渐变效果
        switch (className) {
          case "view-btn":
            button.style.backgroundColor = "#28a745";
            button.style.backgroundImage = "linear-gradient(#32cd32, #298235)"; // 添加渐变效果
            break;
          case "submit-btn":
            button.style.backgroundColor = "#ffc107";
            button.style.backgroundImage = "linear-gradient(#ffce3a, #ffb300)"; // 添加渐变效果
            break;
          case "history-btn":
            button.style.backgroundColor = "#007bff"; // 深蓝色
            button.style.backgroundImage = "linear-gradient(#007bff, #0056b3)";
            break;
          default:
            button.style.backgroundColor = "#007bff";
            button.style.backgroundImage = "linear-gradient(#007bff, #0056b3)"; // 添加渐变效果
        }

        // 添加悬停和点击效果
        button.addEventListener("mouseover", () => {
          button.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)"; // 鼠标悬停时增加阴影
        });

        button.addEventListener("mouseout", () => {
          button.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"; // 鼠标离开时恢复阴影
        });

        button.addEventListener("mousedown", () => {
          button.style.transform = "scale(0.98)"; // 点击时缩小按钮，产生按下效果
        });

        button.addEventListener("mouseup", () => {
          button.style.transform = "scale(1)"; // 释放时恢复按钮大小
        });
      };

      // 创建按钮并添加到按钮容器中
      const createButton = (text, className) => {
        let button = document.createElement("button");
        button.textContent = text;
        button.className = `custom-btn ${className}`;
        applyStyles(button, className); // 应用样式
        // 绑定点击事件
        button.onclick = function () {
          // 根据按钮类型跳转到不同的页面
          let page =
            className === "submit-btn" ? "submitPage.html" : "historyPage.html";
          // 构建URL，直接使用页面名称并附加查询参数
          const url = `${page}?problemId=${problem.problemId}&userId=${userId}`;
          window.location.href = url; // 跳转到新页面并传递参数
        };
        return button;
      };

      // 根据是否已提交问题，决定创建哪些按钮
      const buttons = [];
      if (submittedProblemIds.has(problem.problemId)) {
        buttons.push(createButton("提交和查看", "submit-btn"));
        buttons.push(createButton("历史记录", "history-btn"));
        buttons[0].style.marginRight = "10px";
        buttons[1].style.marginLeft = "10px";
      } else {
        buttons.push(createButton("提交和查看", "submit-btn"));
      }
      buttons.forEach((button) => buttonContainer.appendChild(button));

      listItem.appendChild(buttonContainer);
      (submittedProblemIds.has(problem.problemId)
        ? submittedContainer
        : unsubmittedContainer
      ).appendChild(listItem);
    });
  };

  problemRequest.onerror = function (error) {
    console.error("Error fetching problems:", error);
  };
}

function submitProblem(problemId) {
  console.log(`Submitting problem with ID: ${problemId}`);
  // 这里添加提交问题的逻辑
}

function viewProblem(problemId) {
  console.log(`Viewing details for problem with ID: ${problemId}`);
  // 这里添加查看题目详情的逻辑
}

document.addEventListener("DOMContentLoaded", function () {
  openDB()
    .then(() => {
      fetchUserSubmits()
        .then((submits) => {
          fillAccordions(submits);
        })
        .catch((error) => {
          console.error("Error fetching submits:", error);
        });
    })
    .catch((error) => {
      console.error("IndexedDB open error:", error);
    });
});
