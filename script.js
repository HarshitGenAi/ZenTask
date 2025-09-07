class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentList = 'my-day';
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.theme = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }

    initializeElements() {
        this.menuBtn = document.getElementById('menuBtn');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchContainer = document.getElementById('searchContainer');
        this.searchInput = document.getElementById('searchInput');
        this.themeToggle = document.getElementById('themeToggle');
        
        this.sidebar = document.getElementById('sidebar');
        this.navItems = document.querySelectorAll('.nav-item');
        
        this.listTitle = document.getElementById('listTitle');
        this.listDate = document.getElementById('listDate');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.filterSlider = document.getElementById('filterSlider');
        this.sortSelect = document.getElementById('sortSelect');
        
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.openAddPageBtn = document.getElementById('openAddPageBtn');
        this.openSettingsBtn = document.getElementById('openSettingsBtn');
        
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
        this.sortValue = localStorage.getItem('sortValue') || 'created_desc';
        if (this.sortSelect) this.sortSelect.value = this.sortValue;
        // Add page elements
        this.addPage = document.getElementById('addPage');
        this.addPageForm = document.getElementById('addPageForm');
        this.apTitle = document.getElementById('ap_title');
        this.apDesc = document.getElementById('ap_desc');
        this.apDue = document.getElementById('ap_due');
        this.apPriority = document.getElementById('ap_priority');
        this.apCancel = document.getElementById('ap_cancel');
        this.apSave = document.getElementById('ap_save');
        this.closeAddPage = document.getElementById('closeAddPage');

        // Settings elements
        this.settingsPanel = document.getElementById('settingsPanel');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.togglePerfLite = document.getElementById('togglePerfLite');
        this.toggleConfetti = document.getElementById('toggleConfetti');

        // Apply saved theme
        document.body.setAttribute('data-theme', this.theme);
        this.updateThemeIcon();
    }

    bindEvents() {
        this.menuBtn.addEventListener('click', () => this.toggleSidebar());
        this.searchBtn.addEventListener('click', () => this.toggleSearch());
        this.searchInput.addEventListener('input', (e) => this.searchTasks(e.target.value));
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.sortValue = e.target.value;
                localStorage.setItem('sortValue', this.sortValue);
                this.updateUI();
            });
        }
        
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.switchList(item.dataset.list));
        });
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(btn.dataset.filter));
        });
        window.addEventListener('resize', () => this.positionFilterSlider());
        
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

        if (this.openAddPageBtn) {
            this.openAddPageBtn.addEventListener('click', () => this.openAddTaskPage());
        }
        if (this.openSettingsBtn) {
            this.openSettingsBtn.addEventListener('click', () => this.openSettings());
        }
        
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
        // Add page events
        if (this.addPageForm) {
            this.addPageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTaskFromAddPage();
            });
        }
        if (this.apCancel) this.apCancel.addEventListener('click', () => this.closeAddTaskPage());
        if (this.closeAddPage) this.closeAddPage.addEventListener('click', () => this.closeAddTaskPage());
        if (this.addPage) {
            this.addPage.addEventListener('click', (e) => {
                if (e.target === this.addPage) this.closeAddTaskPage();
            });
        }
        if (this.settingsPanel) {
            this.settingsPanel.addEventListener('click', (e) => {
                if (e.target === this.settingsPanel) this.closeSettings();
            });
        }
        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        }
        if (this.togglePerfLite) {
            const perfLite = localStorage.getItem('perfLite') === '1';
            this.togglePerfLite.checked = perfLite;
            document.body.classList.toggle('perf-lite', perfLite);
            this.togglePerfLite.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                localStorage.setItem('perfLite', enabled ? '1' : '0');
                document.body.classList.toggle('perf-lite', enabled);
            });
        }
        if (this.toggleConfetti) {
            const confetti = localStorage.getItem('confetti') !== '0';
            this.toggleConfetti.checked = confetti;
            this.toggleConfetti.addEventListener('change', (e) => {
                localStorage.setItem('confetti', e.target.checked ? '1' : '0');
            });
        }
        
        // Click outside to close sidebar
        document.addEventListener('click', (e) => {
            if (!this.sidebar.contains(e.target) && !this.menuBtn.contains(e.target)) {
                this.closeSidebar();
            }
        });
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        if (!this.themeToggle) return;
        const icon = this.themeToggle.querySelector('i');
        if (!icon) return;
        icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
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

    openAddTaskPage() {
        if (!this.addPage) return;
        this.addPage.classList.add('active');
        // defaults
        if (this.apPriority) this.apPriority.value = this.getDefaultPriority();
        if (this.apDue) this.apDue.value = this.getDefaultDueDate();
        if (this.apTitle) this.apTitle.focus();
    }

    closeAddTaskPage() {
        if (!this.addPage) return;
        this.addPage.classList.remove('active');
        if (this.addPageForm) this.addPageForm.reset();
    }

    saveTaskFromAddPage() {
        const title = (this.apTitle?.value || '').trim();
        if (!title) return;
        const task = {
            id: Date.now(),
            title,
            description: (this.apDesc?.value || '').trim(),
            dueDate: this.apDue?.value || '',
            priority: this.apPriority?.value || 'Medium',
            isImportant: (this.apPriority?.value || '') === 'High' || this.currentList === 'important',
            isPlanned: !!(this.apDue?.value || '') || this.currentList === 'planned',
            completed: false,
            createdAt: new Date().toISOString(),
            list: this.currentList
        };
        this.tasks.unshift(task);
        this.saveTasks();
        this.updateUI();
        this.closeAddTaskPage();
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
            const deleted = this.tasks.find(t => t.id === taskId);
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.updateUI();
            this.showToast(`Task deleted`, [
                { label: 'Undo', action: () => {
                    if (deleted) {
                        this.tasks.unshift(deleted);
                        this.saveTasks();
                        this.updateUI();
                    }
                }}
            ]);
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
            btn.setAttribute('aria-selected', String(btn.dataset.filter === filter));
        });
        this.updateUI();
        this.positionFilterSlider();
    }

    updateUI(searchQuery = '') {
        const filteredTasks = this.getFilteredTasks(searchQuery);
        this.renderTasks(filteredTasks);
        this.updateTaskCounts();
        
        this.emptyState.style.display = filteredTasks.length === 0 ? 'block' : 'none';
        this.positionFilterSlider();
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
        
        return this.sortTasks(filteredTasks);
    }

    sortTasks(tasks) {
        const value = this.sortValue || 'created_desc';
        const priorityRank = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return tasks.sort((a, b) => {
            switch (value) {
                case 'created_asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'created_desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'due_asc':
                    return (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31');
                case 'due_desc':
                    return (b.dueDate || '0000-01-01').localeCompare(a.dueDate || '0000-01-01');
                case 'priority_desc':
                    return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
                case 'priority_asc':
                    return (priorityRank[a.priority] || 0) - (priorityRank[b.priority] || 0);
                default:
                    return 0;
            }
        });
    }

    positionFilterSlider() {
        if (!this.filterSlider || !this.filterBtns || this.filterBtns.length === 0) return;
        const active = Array.from(this.filterBtns).find(b => b.classList.contains('active'));
        if (!active) return;
        const index = ['all','active','completed'].indexOf(this.currentFilter);
        const track = this.filterSlider.parentElement;
        if (!track) return;
        const trackRect = track.getBoundingClientRect();
        const btnRect = active.getBoundingClientRect();
        const leftPadding = 4; // matches CSS
        const sliderWidth = (trackRect.width - 16) / 3; // matches CSS calc
        const sliderLeft = leftPadding + index * sliderWidth;
        this.filterSlider.style.left = sliderLeft + 'px';
        this.filterSlider.style.width = sliderWidth + 'px';
    }

    renderTasks(tasks) {
        if (tasks.length === 0) {
            this.taskList.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No tasks found!</p></div>';
            return;
        }

        const tasksHTML = tasks.map(task => this.createTaskHTML(task)).join('');
        this.taskList.innerHTML = tasksHTML;
        
        this.bindTaskEvents();
        this.enableDragAndDropIfManual();
    }

    createTaskHTML(task) {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        const dueDateClass = isOverdue ? 'overdue' : '';
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}" draggable="true">
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

    enableDragAndDropIfManual() {
        if ((this.sortValue || 'created_desc') !== 'manual') return;
        const items = Array.from(this.taskList.querySelectorAll('.task-item'));
        let dragEl = null;
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                dragEl = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                dragEl = null;
                this.persistManualOrder();
            });
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const after = this.getDragAfterElement(e.clientY);
                if (after == null) {
                    this.taskList.appendChild(dragEl);
                } else {
                    this.taskList.insertBefore(dragEl, after);
                }
            });
        });
    }

    getDragAfterElement(y) {
        const els = [...this.taskList.querySelectorAll('.task-item:not(.dragging)')];
        return els.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    persistManualOrder() {
        const ids = [...this.taskList.querySelectorAll('.task-item')].map(el => parseInt(el.dataset.taskId));
        const idToTask = new Map(this.tasks.map(t => [t.id, t]));
        const newOrder = ids.map(id => idToTask.get(id)).filter(Boolean);
        const remaining = this.tasks.filter(t => !ids.includes(t.id));
        this.tasks = [...newOrder, ...remaining];
        this.saveTasks();
    }

    bindTaskEvents() {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const taskId = parseInt(e.currentTarget.dataset.taskId);
                const wasCompleted = this.tasks.find(t => t.id === taskId)?.completed;
                this.toggleTask(taskId);
                const nowCompleted = this.tasks.find(t => t.id === taskId)?.completed;
                if (!wasCompleted && nowCompleted) {
                    this.runCelebration();
                }
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

    runCelebration() {
        if (localStorage.getItem('confetti') === '0') return;
        const overlay = document.getElementById('celebrationOverlay');
        const confettiContainer = document.getElementById('confettiContainer');
        if (!overlay || !confettiContainer) return;

        // Reset
        overlay.classList.remove('active');
        confettiContainer.innerHTML = '';

        // Build confetti pieces
        const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#f97316'];
        const pieces = 120;
        const width = window.innerWidth;
        let maxDuration = 0;
        for (let i = 0; i < pieces; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            const left = Math.random() * width;
            const size = 8 + Math.random() * 10;
            const duration = 1200 + Math.random() * 900;
            const delay = Math.random() * 120;
            const xEnd = (Math.random() - 0.5) * 200;
            const rot = (Math.random() * 720 + 360) * (Math.random() > 0.5 ? 1 : -1);
            const color = colors[Math.floor(Math.random() * colors.length)];
            piece.style.left = left + 'px';
            piece.style.background = color;
            piece.style.width = size + 'px';
            piece.style.height = (size * 1.2) + 'px';
            piece.style.animation = `confettiFall ${duration}ms ease-out ${delay}ms forwards`;
            piece.style.setProperty('--x', '0px');
            piece.style.setProperty('--xEnd', xEnd + 'px');
            piece.style.setProperty('--rot', rot + 'deg');
            confettiContainer.appendChild(piece);
            maxDuration = Math.max(maxDuration, duration + delay);
        }

        // Show overlay
        overlay.classList.add('active');

        // Animate center icon for the whole celebration duration
        const totalDuration = Math.max(1600, maxDuration + 200);

        // Hide after animation
        clearTimeout(this._celebrateTimer);
        this._celebrateTimer = setTimeout(() => {
            overlay.classList.remove('active');
            confettiContainer.innerHTML = '';
        }, totalDuration + 50);
    }

    openSettings() {
        if (!this.settingsPanel) return;
        this.settingsPanel.classList.add('active');
    }

    closeSettings() {
        if (!this.settingsPanel) return;
        this.settingsPanel.classList.remove('active');
    }

    showToast(message, actions = []) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<div class="toast-msg">${message}</div><div class="toast-actions"></div>`;
        const actionsEl = toast.querySelector('.toast-actions');
        actions.forEach(a => {
            const btn = document.createElement('button');
            btn.textContent = a.label;
            btn.addEventListener('click', () => {
                a.action?.();
                if (toast.parentNode === container) container.removeChild(toast);
            });
            actionsEl.appendChild(btn);
        });
        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode === container) container.removeChild(toast);
        }, 4000);
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
