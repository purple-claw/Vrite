using TaskManager.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TaskManager.Services;

public class AuthService
{
    private readonly JwtConfig _config;

    public AuthService(IOptions<JwtConfig> config)
        => _config = config.Value;

    /// <param name="user">The user for whom the token is generated.</param>
    /// <returns>An AuthResponse containing the token and its expiry.</returns>
    public AuthResponse GenerateToken(User user)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user), "User cannot be null");

        if (string.IsNullOrEmpty(user.Email))
            throw new ArgumentException("User email cannot be null or empty", nameof(user.Email));

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config.Key ?? throw new ArgumentNullException(nameof(_config.Key), "JWT key cannot be null")));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), // Subject (User ID)
            new Claim(JwtRegisteredClaimNames.Email, user.Email),       // Email
            new Claim(ClaimTypes.Role, user.Role ?? "User"),            // Role (default to "User")
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unique identifier for the token
        };

        var token = new JwtSecurityToken(
            issuer: _config.Issuer,
            audience: _config.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_config.ExpiryInMinutes),
            signingCredentials: credentials
        );

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Expiry = token.ValidTo
        };
    }
}