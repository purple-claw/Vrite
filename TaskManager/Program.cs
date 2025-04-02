using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TaskManager.Data;
using TaskManager.Services;
using TaskManager.Models;

var builder = WebApplication.CreateBuilder(args);

//1. Configuration 
builder.Services.Configure<JwtConfig>(
    builder.Configuration.GetSection("Jwt"));

//  2. Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

//  3. CORS 
builder.Services.AddCors(options => 
{
    options.AddPolicy("AllowAngularDev",
        policy => policy.WithOrigins("http://localhost:4200")
                       .AllowAnyMethod()
                       .AllowAnyHeader());
});

//  4. Services 
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<ITaskService, TaskService>();

//  5. Authentication 
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? 
                throw new InvalidOperationException("JWT Key is not configured")))
    };
});

//  6. Controllers 
builder.Services.AddControllers();

//  Build Application 
var app = builder.Build();

//  Middleware Pipeline 
// 1. CORS (must come first)
app.UseCors("AllowAngularDev");

// 2. Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// 3. Controllers
app.MapControllers();

// 4. Fallback
app.MapGet("/", () => "Task Manager API");

app.Run();