namespace TaskManager.Repositories;
using TaskManager.Data;
using TaskManager.Models;
using Microsoft.EntityFrameworkCore;


public interface ITaskRepository
{
    Task<IEnumerable<TaskModel>> GetUserTasksAsync(string userId);
    Task<TaskModel> GetTaskAsync(int id, string userId);
    Task<TaskModel> AddTaskAsync(TaskModel task);
    Task UpdateTaskAsync(TaskModel task);
    Task DeleteTaskAsync(int id, string userId);
}

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TaskModel>> GetUserTasksAsync(string userId)
    {
        return await _context.Tasks
            .Where(t => t.UserId == userId)
            .ToListAsync();
    }

    public async Task<TaskModel> GetTaskAsync(int id, string userId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        return task ?? throw new InvalidOperationException("Task not found.");
    }

    public async Task<TaskModel> AddTaskAsync(TaskModel task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task UpdateTaskAsync(TaskModel task)
    {
        _context.Entry(task).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteTaskAsync(int id, string userId)
    {
        var task = await GetTaskAsync(id, userId);
        if (task != null)
        {
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }
    }
}
