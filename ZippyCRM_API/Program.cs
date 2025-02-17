using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ZippyCRM_API.Hub;
using ZippyCRM_API.Models;
using ZippyCRM_API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});


builder.Services.AddDbContext<UserDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefConn"));
});
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<HomeServices>();
builder.Services.AddScoped<CustomerServices>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IChatRepository,DirectMessageRepository>();
builder.Services.AddSingleton<IDictionary<string, UserRoomConnection>>(new Dictionary<string, UserRoomConnection>());
builder.Services.AddDistributedMemoryCache(); // Required for session

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Set session timeout
    options.Cookie.HttpOnly = true; // Make cookie accessible only through HTTP requests
    options.Cookie.IsEssential = true; // Make cookie essential for the application to function
});

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials()
               .SetIsOriginAllowed(origin => true);
    });
});
// Add JWT Authentication
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? builder.Configuration["Jwt:Key"];
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? builder.Configuration["Jwt:Issuer"];

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
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            if (!string.IsNullOrEmpty(accessToken) &&
                context.HttpContext.Request.Path.StartsWithSegments("/DirectMessageHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

var app = builder.Build();

// CORS middleware should be placed before authorization

app.UseCors("AllowAll");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
    Path.Combine(builder.Environment.ContentRootPath, "uploads")),
    RequestPath = "/uploads"
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseSession();
app.UseRouting();     // Routing middleware (MUST be added here)

app.UseCors("AllowAll");

app.UseAuthentication();  // Add Authentication middleware
app.UseAuthorization();
app.UseEndpoints(endpoint =>
{
    endpoint.MapHub<ChatHub>("/ChatHub");
    endpoint.MapHub<DirectMessageHub>("/DirectMessageHub");
});
app.MapControllers();

app.Run();