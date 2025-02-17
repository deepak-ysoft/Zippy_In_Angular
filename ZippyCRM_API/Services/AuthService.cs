using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

public class AuthService
{
    private readonly string _jwtKey;
    private readonly string _jwtIssuer;

    public AuthService(IConfiguration configuration)
    {
        _jwtKey = configuration["Jwt:Key"];
        _jwtIssuer = configuration["Jwt:Issuer"];
    }

    // Generate Jwt Token by user id
    public string GenerateJwtToken(string userId)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, userId)
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = _jwtIssuer,
            Audience = _jwtIssuer,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
