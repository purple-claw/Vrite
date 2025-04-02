// Creating Interface for Task Service Handling, Instead of using Controllers, I used Services and interfaces for beginner friendly approach and minimal features.
using TaskManager.Models;

namespace TaskManager.Services;

public interface ITaskService
{
    IReadOnlyList<TaskModel> GetTasksAll(); // This Method Returns all the Availble Tasks in the database, and to make it secure I made it immutable by Readonly access Specifier.
    TaskModel AddTask(TaskModel task);
    bool DeleteTask(int id);
    TaskModel? TaskByID(int id);

}
