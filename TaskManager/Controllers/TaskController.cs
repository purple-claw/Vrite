using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using TaskManager.Models;
using TaskManager.Services;

// Enforce JWT
[ApiController]
[Route("api/[controller]")]
// [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)] 
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

    [HttpPatch("{id}/status")]
    public IActionResult UpdateStatus(int id, [FromBody] string status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return BadRequest("Status cannot be empty");

        var updated = _taskService.UpdateTaskStatus(id, status);
        return updated ? NoContent() : NotFound();
    }
}