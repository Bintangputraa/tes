const todoListEl = document.getElementById("todoList");
const newTodoInput = document.getElementById("newTodo");
const addTodoBtn = document.getElementById("addTodo");

// === Ambil dari localStorage saat load ===
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// === Render list ke halaman ===
function renderTodos() {
    todoListEl.innerHTML = "";
    todos.forEach((todo, index) => {
        const li = document.createElement("li");
        if (todo.done) li.classList.add("done");

        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.done;
        checkbox.addEventListener("change", () => {
            todos[index].done = checkbox.checked;
            saveTodos();
        });
        label.appendChild(checkbox);
        label.append(" " + todo.text);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Hapus";
        delBtn.addEventListener("click", () => {
            todos.splice(index, 1);
            saveTodos();
        });

        li.appendChild(label);
        li.appendChild(delBtn);
        todoListEl.appendChild(li);
    });
}

// === Simpan ke localStorage ===
function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodos();
}

// === Tambah todo baru ===
addTodoBtn.addEventListener("click", () => {
    const text = newTodoInput.value.trim();
    if (text) {
        todos.push({ text, done: false });
        newTodoInput.value = "";
        saveTodos();
    }
});

// Enter = tambah todo
newTodoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTodoBtn.click();
});

// === Render awal ===
renderTodos();