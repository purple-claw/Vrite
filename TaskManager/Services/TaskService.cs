using TaskManager.Models;
using TaskManager.Data;

namespace TaskManager.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _db;

    public TaskService(AppDbContext db) => _db = db;

    public IReadOnlyList<TaskModel> GetTasksAll() 
        => _db.Tasks.OrderBy(t => t.Id).ToList().AsReadOnly();

    public TaskModel AddTask(TaskModel task)
    {
        if (string.IsNullOrWhiteSpace(task.Title))
            throw new ArgumentException("Task title cannot be empty");

        _db.Tasks.Add(task);
        _db.SaveChanges();  
        return task;
    }

    public bool DeleteTask(int id)
    {
        var task = _db.Tasks.Find(id);
        if (task == null) return false;

        _db.Tasks.Remove(task);
        _db.SaveChanges();  
        return true;
    }

    public TaskModel? TaskByID(int id)
        => _db.Tasks.Find(id);
}
