namespace MediaTracker.API.Models;
public class MediaItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Аніме, Серіал, Манга тощо
    public int EpisodesWatched { get; set; }
    public int TotalEpisodes { get; set; }
    public string Status { get; set; } = string.Empty; // Планую, Дивлюся, Завершено
    public int Rating { get; set; }
    public string? ImageUrl { get; set; }
}