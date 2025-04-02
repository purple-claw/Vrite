import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


export interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
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
    if (!this.newTaskTitle.trim()) return;

    const newTask: Task = {
      id: 0,
      title: this.newTaskTitle,
      dueDate: new Date().toISOString(),
      priority: 'Medium',
      status: 'Pending'
    };

    this.api.addTask(newTask).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.newTaskTitle = '';
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
}