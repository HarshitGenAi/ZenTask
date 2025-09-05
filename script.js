class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentList = 'my-day';
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }

    initializeElements() {
        this.menuBtn = document.getElementById('menuBtn');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchContainer = document.getElementById('searchContainer');
        this.searchInput = document.getElementById('searchInput');
        
        this.sidebar = document.getElementById('sidebar');
        this.navItems = document.querySelectorAll('.nav-item');
        
        this.listTitle = document.getElementById('listTitle');
        this.listDate = document.getElementById('listDate');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        
        this.taskModal = document.getElementById('taskModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.taskForm = document.getElementById('taskForm');
        this.editTaskId = document.getElementById('editTaskId');
        this.taskTitleInput = document.getElementById('taskTitleInput');
        this.taskDescInput = document.getElementById('taskDescInput');
        this.taskDueDate = document.getElementById('taskDueDate');
        this.taskPriority = document.getElementById('taskPriority');
        this.closeModal = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.saveBtn = document.getElementById('saveBtn');
        
        this.listDate.textContent = this.formatDate(new Date());
    }

    bindEvents() {
        this.menuBtn.addEventListener('click', () => this.toggleSidebar());
        this.searchBtn.addEventListener('click', () => this.toggleSearch());
        this.searchInput.addEventListener('input', (e) => this.searchTasks(e.target.value));
        
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.switchList(item.dataset.list));
        });
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(btn.dataset.filter));
        });
        
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                this.quickAddTask(e.target.value.trim());
            }
        });
        this.addBtn.addEventListener('click', () => {
            if (this.taskInput.value.trim()) {
                this.quickAddTask(this.taskInput.value.trim());
            } else {
                this.openTaskModal();
            }
        });
        
        this.closeModal.addEventListener('click', () => this.closeTaskModal());
        this.cancelBtn.addEventListener('click', () => this.closeTaskModal());
        this.taskModal.addEventListener('click', (e) => {
            if (e.target === this.taskModal) {
                this.closeTaskModal();
            }
        });
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        
        // Click outside to close sidebar
        document.addEventListener('click', (e) => {
            if (!this.sidebar.contains(e.target) && !this.menuBtn.contains(e.target)) {
                this.closeSidebar();
            }
        });
    }

    quickAddTask(title) {
        const task = {
            id: Date.now(),
            title: title,
            description: '',
            completed: false,
            priority: this.getDefaultPriority(),
            dueDate: this.getDefaultDueDate(),
            createdAt: new Date().toISOString(),
            list: this.currentList,
            isImportant: this.currentList === 'important',
            isPlanned: this.currentList === 'planned' || this.getDefaultDueDate() !== ''
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.updateUI();
        this.taskInput.value = '';
    }

    getDefaultPriority() {
        if (this.currentList === 'important') {
            return 'High';
        }
        return 'Medium';
    }

    getDefaultDueDate() {
        if (this.currentList === 'my-day' || this.currentList === 'planned') {
            return this.formatDateInput(new Date());
        }
        return '';
    }

    openTaskModal(taskId = null) {
        this.editingTaskId = taskId;
        
        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                this.modalTitle.textContent = 'Edit Task';
                this.editTaskId.value = taskId;
                this.taskTitleInput.value = task.title;
                this.taskDescInput.value = task.description;
                this.taskDueDate.value = task.dueDate;
                this.taskPriority.value = task.priority;
                this.saveBtn.textContent = 'Update Task';
            }
        } else {
            this.modalTitle.textContent = 'Add Task';
            this.taskForm.reset();
            this.editTaskId.value = '';
            this.saveBtn.textContent = 'Add Task';
            
            this.taskPriority.value = this.getDefaultPriority();
            this.taskDueDate.value = this.getDefaultDueDate();
        }
        
        this.taskModal.classList.add('active');
        this.taskTitleInput.focus();
    }

    closeTaskModal() {
        this.taskModal.classList.remove('active');
        this.editingTaskId = null;
    }

    saveTask() {
        const title = this.taskTitleInput.value.trim();
        if (!title) return;

        const taskData = {
            title: title,
            description: this.taskDescInput.value.trim(),
            dueDate: this.taskDueDate.value,
            priority: this.taskPriority.value,
            isImportant: this.taskPriority.value === 'High' || this.currentList === 'important',
            isPlanned: !!this.taskDueDate.value || this.currentList === 'planned'
        };

        if (this.editingTaskId) {
            const taskIndex = this.tasks.findIndex(t => t.id == this.editingTaskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...taskData };
            }
        } else {
            const task = {
                id: Date.now(),
                ...taskData,
                completed: false,
                createdAt: new Date().toISOString(),
                list: this.currentList
            };
            this.tasks.unshift(task);
        }

        this.saveTasks();
        this.updateUI();
        this.closeTaskModal();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.updateUI();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.updateUI();
        }
    }

    // UI Methods
    toggleSidebar() {
        this.sidebar.classList.toggle('active');
    }

    closeSidebar() {
        this.sidebar.classList.remove('active');
    }

    toggleSearch() {
        this.searchContainer.classList.toggle('active');
        if (this.searchContainer.classList.contains('active')) {
            this.searchInput.focus();
        } else {
            this.searchInput.value = '';
            this.updateUI();
        }
    }

    searchTasks(query) {
        this.updateUI(query);
    }

    switchList(listName) {
        this.currentList = listName;
        this.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.list === listName);
        });
        
        const listTitles = {
            'my-day': 'My Day',
            'important': 'Important',
            'planned': 'Planned',
            'all-tasks': 'All Tasks'
        };
        
        this.listTitle.textContent = listTitles[listName];
        this.closeSidebar();
        this.updateUI();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.updateUI();
    }

    updateUI(searchQuery = '') {
        const filteredTasks = this.getFilteredTasks(searchQuery);
        this.renderTasks(filteredTasks);
        this.updateTaskCounts();
        
        this.emptyState.style.display = filteredTasks.length === 0 ? 'block' : 'none';
    }

    getFilteredTasks(searchQuery = '') {
        let filteredTasks = [...this.tasks];
        
        if (this.currentList !== 'all-tasks') {
            if (this.currentList === 'my-day') {
                const today = this.formatDateInput(new Date());
                filteredTasks = filteredTasks.filter(task => {
                    return task.dueDate === today || 
                           task.list === 'my-day' || 
                           (!task.completed && !task.dueDate && task.list !== 'planned' && task.list !== 'important');
                });
            } else if (this.currentList === 'important') {
                filteredTasks = filteredTasks.filter(task => 
                    task.priority === 'High' || task.isImportant || task.list === 'important'
                );
            } else if (this.currentList === 'planned') {
                filteredTasks = filteredTasks.filter(task => 
                    task.dueDate || task.isPlanned || task.list === 'planned'
                );
            }
        }
        
        if (this.currentFilter === 'active') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }
        
        if (searchQuery) {
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        return filteredTasks;
    }

    renderTasks(tasks) {
        if (tasks.length === 0) {
            this.taskList.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No tasks found!</p></div>';
            return;
        }

        const tasksHTML = tasks.map(task => this.createTaskHTML(task)).join('');
        this.taskList.innerHTML = tasksHTML;
        
        this.bindTaskEvents();
    }

    createTaskHTML(task) {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        const dueDateClass = isOverdue ? 'overdue' : '';
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
                        ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div class="task-details">
                        <div class="task-title">${task.title}</div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                        <div class="task-meta">
                            ${task.dueDate ? `<div class="task-due-date ${dueDateClass}"><i class="fas fa-calendar-alt"></i> ${this.formatDate(new Date(task.dueDate))}</div>` : ''}
                            <div class="task-priority ${task.priority.toLowerCase()}">
                                <span class="priority-dot">●</span> ${task.priority}
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="action-btn edit-btn" data-task-id="${task.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete delete-btn" data-task-id="${task.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindTaskEvents() {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const taskId = parseInt(e.currentTarget.dataset.taskId);
                this.toggleTask(taskId);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.currentTarget.dataset.taskId);
                this.openTaskModal(taskId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.currentTarget.dataset.taskId);
                this.deleteTask(taskId);
            });
        });
    }

    updateTaskCounts() {
        const today = this.formatDateInput(new Date());
        
        const myDayCount = this.tasks.filter(task => 
            !task.completed && (
                task.dueDate === today || 
                task.list === 'my-day' || 
                (!task.dueDate && task.list !== 'planned' && task.list !== 'important')
            )
        ).length;
        
        const importantCount = this.tasks.filter(task => 
            !task.completed && (task.priority === 'High' || task.isImportant || task.list === 'important')
        ).length;
        
        const plannedCount = this.tasks.filter(task => 
            !task.completed && (task.dueDate || task.isPlanned || task.list === 'planned')
        ).length;
        
        const allTasksCount = this.tasks.filter(task => !task.completed).length;
        
        document.getElementById('myDayCount').textContent = myDayCount;
        document.getElementById('importantCount').textContent = importantCount;
        document.getElementById('plannedCount').textContent = plannedCount;
        document.getElementById('allTasksCount').textContent = allTasksCount;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    formatDateInput(date) {
        return date.toISOString().split('T')[0];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

if (!localStorage.getItem('tasks')) {
    const sampleTasks = [
        {
            id: 1,
            title: 'Welcome to your Todo App!',
            description: 'This is a sample task. You can edit or delete it.',
            completed: false,
            priority: 'Medium',
            dueDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            list: 'my-day',
            isImportant: false,
            isPlanned: true
        },
        {
            id: 2,
            title: 'Try creating tasks in different sections',
            description: 'Create tasks in Important and Planned sections to see how they work.',
            completed: false,
            priority: 'High',
            dueDate: '',
            createdAt: new Date().toISOString(),
            list: 'important',
            isImportant: true,
            isPlanned: false
        }
    ];
    localStorage.setItem('tasks', JSON.stringify(sampleTasks));
}
