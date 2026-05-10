using MediaTracker.API.Data;
using MediaTracker.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediaTracker_API.DTO;

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
        return await _context.MediaItems.OrderBy(m => m.Title).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<MediaItem>> PostMediaItem(MediaItem mediaItem)
    {
        _context.MediaItems.Add(mediaItem);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMediaItems), new { id = mediaItem.Id }, mediaItem);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MediaItem>> GetMediaItem(int id)
    {
        var mediaItem = await _context.MediaItems.FindAsync(id);
        if (mediaItem == null) return NotFound();
        return mediaItem;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMediaItem(int id, MediaItem mediaItem)
    {
        if (id != mediaItem.Id) return BadRequest();

        var existingItem = await _context.MediaItems.FindAsync(id);
        if (existingItem == null) return NotFound();

        existingItem.Title = mediaItem.Title;
        existingItem.Type = mediaItem.Type;
        existingItem.EpisodesWatched = mediaItem.EpisodesWatched;
        existingItem.TotalEpisodes = mediaItem.TotalEpisodes;
        existingItem.Status = mediaItem.Status;
        existingItem.Rating = mediaItem.Rating;

        await _context.SaveChangesAsync();
        return NoContent(); 
    }

    [HttpPost("{id}/image")]
    public async Task<IActionResult> UploadImage(int id, IFormFile file)
    {
        var item = await _context.MediaItems.FindAsync(id);
        if (item == null) return NotFound();

        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        item.ImageUrl = $"/uploads/{fileName}";
        await _context.SaveChangesAsync();

        return Ok(new { imageUrl = item.ImageUrl });
    }

    [HttpPost("{id}/image-url")]
    public async Task<IActionResult> SaveExternalImageUrl(int id, [FromBody] ImageUrlDTO dto)
    {
        var item = await _context.MediaItems.FindAsync(id);
        if (item == null) return NotFound();

        item.ImageUrl = dto.ImageUrl;
        await _context.SaveChangesAsync();

        return Ok(new { imageUrl = item.ImageUrl });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMediaItem(int id)
    {
        var mediaItem = await _context.MediaItems.FindAsync(id);
        if (mediaItem == null) return NotFound();

        _context.MediaItems.Remove(mediaItem);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}