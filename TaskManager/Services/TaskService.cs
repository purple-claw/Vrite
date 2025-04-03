using TaskManager.Models;
using TaskManager.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace TaskManager.Services;

public class TaskService : ITaskService
{
    public TaskModel GetUserTask(int id, string userId)
    {
        var task = _db.Tasks.FirstOrDefault(t => t.Id == id && t.UserId == userId);
        if (task == null)
        {
            throw new InvalidOperationException("Task not found.");
        }
        return task;
    }
    private readonly AppDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TaskService(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public IReadOnlyList<TaskModel> GetUserTasks(string userId) // Added userId parameter
    {
        return _db.Tasks
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.Id)
            .ToList()
            .AsReadOnly();
    }

    public TaskModel AddTask(TaskModel task)
    {
        if (string.IsNullOrWhiteSpace(task.Title))
            throw new ArgumentException("Task title cannot be empty");

        _db.Tasks.Add(task);
        _db.SaveChanges();
        return task;
    }

    public bool DeleteUserTask(int id, string userId) // Added userId parameter
    {
        var task = _db.Tasks.FirstOrDefault(t => t.Id == id && t.UserId == userId);
        
        if (task == null) 
            return false;

        _db.Tasks.Remove(task);
        _db.SaveChanges();
        return true;
    }

    public bool UpdateUserTaskStatus(int id, string userId, string status)
{
    var task = _db.Tasks.FirstOrDefault(t => t.Id == id && t.UserId == userId);
    if (task == null)
    {
        return false; 
    }

    var validStatuses = new[] { "Incomplete", "Complete" };
    if (!validStatuses.Contains(status))
    {
        throw new ArgumentException("Invalid status value.");
    }

    task.Status = status;
    _db.SaveChanges();
    return true;
}
}