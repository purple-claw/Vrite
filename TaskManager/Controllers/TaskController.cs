using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;
using TaskManager.Models;
using TaskManager.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class TaskController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TaskController(ITaskService taskService, IHttpContextAccessor httpContextAccessor)
    {
        _taskService = taskService;
        _httpContextAccessor = httpContextAccessor;
    }

    private string GetCurrentUserId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext?.User == null)
        {
            throw new InvalidOperationException("HttpContext or User is null.");
        }
        return httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new InvalidOperationException("User ID not found.");
    }

    [HttpGet]
    public IActionResult GetTasksAll()
    {
        var userId = GetCurrentUserId();
        return Ok(_taskService.GetUserTasks(userId)); 
    }

    [HttpGet("{id}")]
    public IActionResult TaskByID(int id)
    {
        var userId = GetCurrentUserId();
        var task = _taskService.GetUserTask(id, userId);
        return task != null ? Ok(task) : NotFound();
    }

    [HttpPost]
    public IActionResult Create([FromBody] TaskModel task)
    {
        try
        {
            var userId = GetCurrentUserId();
            task.UserId = userId; // Set the user ID
            var createdTask = _taskService.AddTask(task);
            return CreatedAtAction(nameof(TaskByID), new { id = createdTask.Id }, createdTask);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var userId = GetCurrentUserId();
        return _taskService.DeleteUserTask(id, userId) ? NoContent() : NotFound();
    }

    [HttpPatch("{id}/status")]
    public IActionResult UpdateTaskStatus(int id, [FromBody] string status)
    {
        try
        {
            var userId = GetCurrentUserId(); // Ensure the user is authenticated
            var updated = _taskService.UpdateUserTaskStatus(id, userId, status); 
            return updated ? NoContent() : NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the task status.", details = ex.Message });
        }
    }
}