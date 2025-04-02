using Microsoft.AspNetCore.Mvc;
using TaskManager.Models;
using TaskManager.Services;
using TaskManager.Data; 
using Microsoft.EntityFrameworkCore; 
using Microsoft.AspNetCore.Authorization; 
using System.Security.Claims; 

namespace TaskManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly AppDbContext _context;
    private readonly PasswordService _passwordService;

    public AuthController(
        AuthService authService,
        AppDbContext context,
        PasswordService passwordService)
    {
        _authService = authService;
        _context = context;
        _passwordService = passwordService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Email already exists");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordService.HashPassword(request.Password ?? throw new ArgumentNullException(nameof(request.Password))),
            Role = "User" // Default role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Registration successful");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || request.Password == null || user.PasswordHash == null || !_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");

        var token = _authService.GenerateToken(user); 
        return Ok(token);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        // Get current user's email from JWT claim
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == userEmail);

        if (user == null) return NotFound("User not found");

        // Update allowed fields
        if (!string.IsNullOrEmpty(request.FullName))
            user.FullName = request.FullName;

        if (!string.IsNullOrEmpty(request.PhoneNumber))
            user.PhoneNumber = request.PhoneNumber;

        await _context.SaveChangesAsync();
        return Ok(user);
    }

}
