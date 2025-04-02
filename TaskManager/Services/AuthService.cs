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

    public AuthResponse GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config.Key ?? throw new ArgumentNullException(nameof(_config.Key), "JWT key cannot be null")));

        var credentials = new SigningCredentials(
            key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim(ClaimTypes.Role, user.Role ?? string.Empty) 
        };

        var token = new JwtSecurityToken(
            _config.Issuer,
            _config.Audience,
            claims,
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