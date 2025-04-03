import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  completed: boolean;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  newTaskTitle = '';
  newTaskPriority = 'Medium';
  newTaskDueDate = '';
  searchQuery = '';
  showAddTaskForm = false;
  isLoading = false;
  errorMessage = '';
  activeFilter = 'all';
  sortField = 'dueDate';
  sortOrder: 'asc' | 'desc' = 'asc';

  filters = [
    { value: 'all', label: 'All Tasks' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    this.api.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filterTasks();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load tasks';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  addTask() {
    if (!this.newTaskTitle.trim() || !this.newTaskDueDate.trim()) {
      this.errorMessage = 'Task title and due date are required';
      return;
    }

    const newTask: Task = {
      id: 0,
      title: this.newTaskTitle,
      dueDate: this.newTaskDueDate,
      priority: this.newTaskPriority,
      completed: false
    };

    this.api.addTask(newTask).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.filterTasks();
        this.resetAddTaskForm();
      },
      error: (err) => {
        this.errorMessage = 'Failed to add task';
        console.error(err);
      }
    });
  }

  editTask(task: Task) {
    this.newTaskTitle = task.title;
    this.newTaskPriority = task.priority;
    this.newTaskDueDate = task.dueDate;
  
    this.showAddTaskForm = true;
  
    // Save the changes
    const updatedTask: Task = {
      id: task.id,
      title: this.newTaskTitle,
      dueDate: this.newTaskDueDate,
      priority: this.newTaskPriority,
      completed: task.completed
    };
  
    this.api.updateTask(task.id, updatedTask).subscribe({
      next: (updated) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updated;
          this.filterTasks();
        }
        this.resetAddTaskForm();
      },
      error: (err) => {
        this.errorMessage = 'Failed to update task';
        console.error(err);
      }
    });
  }

  deleteTask(id: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.api.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== id);
          this.filterTasks();
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete task';
          console.error(err);
        }
      });
    }
  }

  toggleTaskStatus(id: number) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.completed ? 'Incomplete' : 'Complete';
    
    this.api.updateTaskStatus(id, newStatus).subscribe({
      next: () => {
        task.completed = !task.completed;
        this.filterTasks();
      },
      error: (err) => {
        this.errorMessage = 'Failed to update task status';
        console.error(err);
      }
    });
  }

  filterTasks() {
    this.filteredTasks = this.tasks.filter(task => 
      task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
      (this.activeFilter === 'all' || 
       (this.activeFilter === 'completed' && task.completed) ||
       (this.activeFilter === 'pending' && !task.completed))
    );
    this.sortTasks();
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.filterTasks();
  }

  sortTasks() {
    this.filteredTasks.sort((a, b) => {
      let comparison = 0;
      
      if (this.sortField === 'priority') {
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        comparison = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      } else {
        comparison = a[this.sortField as keyof Task].toString().localeCompare(b[this.sortField as keyof Task].toString());
      }
      
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortTasks();
  }

  resetAddTaskForm() {
    this.showAddTaskForm = false;
    this.newTaskTitle = '';
    this.newTaskPriority = 'Medium';
    this.newTaskDueDate = '';
    this.errorMessage = '';
  }
}