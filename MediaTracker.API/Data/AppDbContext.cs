using MediaTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace MediaTracker.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<MediaItem> MediaItems { get; set; }
}