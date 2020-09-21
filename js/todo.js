var btn = document.querySelector(".submit");
var listItems = [];
var dragItem = "";
var dropItem = "";

function dragStart(e) {
  dragItem = e.srcElement.dataset.id;
  this.style.opacity = "0.4";
  dragSrcEl = this;
  // set effect
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.innerHTML);
}

function dragEnter(e) {
  // scale item
  this.classList.add("over");
}

function dragLeave(e) {
  e.stopPropagation();
  // remove scale
  this.classList.remove("over");
}

function dragOver(e) {
  e.preventDefault();
  // set effect
  e.dataTransfer.dropEffect = "move";
  return false;
}

function dragDrop(e) {
  dropItem = e.target.dataset.id;

  if (dragSrcEl != this) {
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData("text/html");
  }

  return false;
}

function dragEnd(e) {
  var listIts = document.querySelectorAll(".draggable");
  [].forEach.call(listIts, function (item) {
    // remove scale
    item.classList.remove("over");
  });
  this.style.opacity = "1";
  if (dragItem !== dropItem && dragItem !== "") {
    var dragItemIndex = listItems.findIndex((item) => item.id == dragItem);
    var dropItemIndex = listItems.findIndex((item) => item.id == dropItem);
    // check if item index is on bound
    if (
      (dragItemIndex >= 0) && (dragItemIndex < listItems.length) && (dropItemIndex >= 0) && (dragItemIndex < listItems.length)) {
      [listItems[dragItemIndex], listItems[dropItemIndex]] = [
        listItems[dropItemIndex],
        listItems[dragItemIndex],
      ];
      // save into localStorage
      localStorage.setItem("todoLists", JSON.stringify(listItems));
    }
    renderList(listItems);
  }
}

function addEventsDragAndDrop(el) {
  el.addEventListener("dragstart", dragStart, false);
  el.addEventListener("dragenter", dragEnter, false);
  el.addEventListener("dragover", dragOver, false);
  el.addEventListener("dragleave", dragLeave, false);
  el.addEventListener("drop", dragDrop, false);
  el.addEventListener("dragend", dragEnd, false);
}

var listIts = document.querySelectorAll(".draggable");
[].forEach.call(listIts, function (item) {
  addEventsDragAndDrop(item);
});

function renderItem(item) {
  // empty when new items added
  document.getElementById("content").value = "";
  document.getElementById("due-date-at").value = "";

  var listItem = document.getElementById("list-item");

  var div = document.createElement("div");
  var attr = document.createAttribute("draggable");

  div.className = "draggable";
  div.dataset.id = item.id;
  attr.value = "true";
  div.setAttributeNode(attr);

  var text = document.createElement("div");
  text.appendChild(document.createTextNode(item.content));
  // check is completed or not
  var find = listItems.filter((ele) => ele.id === item.id);
  if (find.length > 0) {
    if (find[0].completed) {
      // div.className = "draggable draggable-complete";
      div.style.backgroundColor = "#90ee90";
      text.className = "text-complete";
    } else {
      // div.className = "draggable";
      div.style.backgroundColor = "#e0ffff";
      text.className = "text-incomplete";
    }
  }

  // create time element
  var dueDateAt = document.createElement("div");
  dueDateAt.className = "item-due-date-at";
  dueDateAt.appendChild(document.createTextNode(item.dueDateAt));

  // trash button
  var action = document.createElement("i");
  action.className = "fa fa-trash";

  action.addEventListener("click", function () {
    var find = listItems.filter((ele) => ele.id === item.id);
    if (find.length > 0) {
      listItems = listItems.filter((ele) => ele.id !== item.id);
      localStorage.setItem("todoLists", JSON.stringify(listItems));
      renderList(listItems);
    }
  });

  var rightDiv = document.createElement("div");
  rightDiv.className = "right-div";

  rightDiv.appendChild(dueDateAt);
  rightDiv.appendChild(action);

  div.appendChild(text);
  div.appendChild(rightDiv);

  // add click events
  div.addEventListener("click", () => {
    var find = listItems.filter((ele) => ele.id === item.id);
    if (find.length > 0) {
      if (!find[0].completed) {
        // div.className = "draggable draggable-complete";
        div.style.backgroundColor = "#90ee90";
        text.className = "text-complete";
      } else {
        // div.className = "draggable";
        div.style.backgroundColor = "#e0ffff";
        text.className = "text-incomplete";
      }
      listItems = listItems.map((ele) => {
        if (ele.id === item.id) {
          return {
            ...ele,
            completed: !ele.completed,
          };
        }
        return ele;
      });
      localStorage.setItem("todoLists", JSON.stringify(listItems));
    }
  });

  // append into lists
  listItem.appendChild(div);

  // drag or drop events
  addEventsDragAndDrop(div);
}

function renderList(items) {
  var listItem = document.getElementById("list-item");
  // empty list items
  listItem.innerHTML = "";

  for (let index = 0; index < items.length; index++) {
    if (items[index] && items[index].content !== "") {
      renderItem(items[index]);
    }
  }
}

// compare timeStamp
function compare(a, b) {
  if (Number(a.timestamp) > Number(b.timestamp)) {
    return -1;
  }
  if (Number(a.timestamp) < Number(b.timestamp)) {
    return 1;
  }
  return 0;
}

// add new event
function handleAdd() {
  var newItemText = document.getElementById("content").value;
  var newItemDueDateAt = document.getElementById("due-date-at").value || "";
  // get title and time
  if (newItemText != "") {
    const timestamp =
    newItemDueDateAt !== ""
        ? new Date(newItemDueDateAt).getTime()
        : new Date().getTime();
    listItems.push({
      content: newItemText,
      dueDateAt:
      newItemDueDateAt !== ""
          ? new Date(newItemDueDateAt).getMonth() +
            "/" +
            new Date(newItemDueDateAt).getDate() +
            "/" +
            new Date(newItemDueDateAt).getFullYear() +
            ", " +
            new Intl.DateTimeFormat("default", {
              hour12: true,
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            }).format(new Date(newItemDueDateAt))
          : "",
      timestamp:
        newItemDueDateAt !== "" ? new Date(newItemDueDateAt).getTime() : 0,
      complete: false,
      id: timestamp,
    });
  }

  // re-order list items
  listItems.sort(compare);
  // save into local storage
  localStorage.setItem("todoLists", JSON.stringify(listItems));
  // re-render
  renderList(listItems);
}

btn.addEventListener("click", handleAdd);

function renderListInLocalStorage() {
  var listInLocalStorage = JSON.parse(localStorage.getItem("todoLists"));
  // if data is found
  if (listInLocalStorage && listInLocalStorage.length > 0) {
    listItems = listInLocalStorage;
    // check if over due date
    const current = (new Date()).getTime()
    listItems = listItems.map((item) => {
      if (item.timestamp < current) {
        return {
          ...item,
          completed: true
        }
      }
      return item
    })
    renderList(listItems);
  }
}
// first step, get from localStorage
renderListInLocalStorage();
