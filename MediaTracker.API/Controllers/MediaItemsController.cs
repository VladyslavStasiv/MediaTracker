using MediaTracker.API.Data;
using MediaTracker.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediaTracker.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MediaItemsController : ControllerBase
{
    private readonly AppDbContext _context;

    public MediaItemsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MediaItem>>> GetMediaItems()
    {
        return await _context.MediaItems.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<MediaItem>> PostMediaItem(MediaItem mediaItem)
    {
        _context.MediaItems.Add(mediaItem);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMediaItems), new { id = mediaItem.Id }, mediaItem);
    }
}