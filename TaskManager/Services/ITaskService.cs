// Creating Interface for Task Service Handling, Instead of using Controllers, I used Services and interfaces for beginner friendly approach and minimal features.
using TaskManager.Models;

namespace TaskManager.Services;

public interface ITaskService
{
    IReadOnlyList<TaskModel> GetUserTasks(string userId);
    TaskModel AddTask(TaskModel task);
    bool DeleteUserTask(int id, string userId);
    TaskModel? GetUserTask(int id, string userId);
    bool UpdateUserTaskStatus(int id, string userId, string status);
}