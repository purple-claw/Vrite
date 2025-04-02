import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Task } from '../task-list/task-list.component';
import { Observable } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5300/api/task';  

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateTask(id: number, updatedTask: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, updatedTask);
  }

  updateTaskStatus(id: number, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, `"${status}"`, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}