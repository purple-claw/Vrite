import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  completed: boolean; // Updated to use a boolean for task completion
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
  newTaskTitle = '';
  newTaskPriority = 'Medium'; // Default priority
  newTaskDueDate = ''; // Placeholder for due date

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.api.getTasks().subscribe({
      next: (tasks) => this.tasks = tasks,
      error: (err) => console.error('Failed to load tasks', err)
    });
  }

  addTask() {
    if (!this.newTaskTitle.trim() || !this.newTaskDueDate.trim()) {
      console.error('Task title and due date are required');
      return;
    }

    const newTask: Task = {
      id: 0,
      title: this.newTaskTitle,
      dueDate: this.newTaskDueDate,
      priority: this.newTaskPriority,
      completed: false // New tasks are incomplete by default
    };

    this.api.addTask(newTask).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.newTaskTitle = '';
        this.newTaskPriority = 'Medium'; // Reset to default
        this.newTaskDueDate = '';
      },
      error: (err) => console.error('Failed to add task', err)
    });
  }

  deleteTask(id: number) {
    this.api.deleteTask(id).subscribe({
      next: () => this.tasks = this.tasks.filter(t => t.id !== id),
      error: (err) => console.error('Failed to delete task', err)
    });
  }

  toggleTaskStatus(id: number) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      console.error('Task not found');
      return;
    }
  
    const updatedTask = { ...task, completed: !task.completed };
  
    this.api.updateTask(id, updatedTask).subscribe({
      next: () => {
        task.completed = updatedTask.completed;
      },
      error: (err) => console.error('Failed to toggle task status', err)
    });
  }
}