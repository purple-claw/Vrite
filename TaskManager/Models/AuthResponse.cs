namespace TaskManager.Models;

public class AuthResponse
{
    public string? Token {get;set;}
    public DateTime Expiry {get;set;}
}