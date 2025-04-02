using Microsoft.EntityFrameworkCore;
using TaskManager.Models;

namespace TaskManager.Data;

public class AppDbContext : DbContext
{
    public DbSet<TaskModel> Tasks => Set<TaskModel>();
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}
}