using Microsoft.AspNetCore.Mvc;
using TaskManager.Models;
using TaskManager.Services;

[ApiController]
[Route("api/task")]
public class TaskController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TaskController(ITaskService taskService) => _taskService = taskService;

    [HttpGet]
    public IActionResult GetTasksAll() => Ok(_taskService.GetTasksAll());

    [HttpGet("{id}")]
    public IActionResult TaskByID(int id)
    {
        var task = _taskService.TaskByID(id);
        return task != null ? Ok(task) : NotFound();
    }

    [HttpPost]
    public IActionResult Create([FromBody] TaskModel task)
    {
        try
        {
            var creTask = _taskService.AddTask(task);
            return CreatedAtAction(nameof(TaskByID), new { id = creTask.Id }, creTask);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id) => _taskService.DeleteTask(id) ? NoContent() : NotFound();
}