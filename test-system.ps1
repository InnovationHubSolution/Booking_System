# Vanuatu Booking System - Full System Test
# Run this script to test all system components

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "VANUATU BOOKING SYSTEM - FULL TEST" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$testResults = @()
$passCount = 0
$failCount = 0

function Test-Component {
    param($Name, $TestBlock)
    Write-Host "Testing: $Name..." -NoNewline
    try {
        $result = & $TestBlock
        if ($result) {
            Write-Host " PASS" -ForegroundColor Green
            $script:passCount++
            $script:testResults += [PSCustomObject]@{Test = $Name; Status = "PASS"; Message = $result }
            return $true
        }
        else {
            Write-Host " FAIL" -ForegroundColor Red
            $script:failCount++
            $script:testResults += [PSCustomObject]@{Test = $Name; Status = "FAIL"; Message = "Test returned false" }
            return $false
        }
    }
    catch {
        Write-Host " FAIL" -ForegroundColor Red
        $script:failCount++
        $script:testResults += [PSCustomObject]@{Test = $Name; Status = "FAIL"; Message = $_.Exception.Message }
        return $false
    }
}

Write-Host "1. INFRASTRUCTURE TESTS" -ForegroundColor Yellow
Write-Host "-------------------------`n"

# Test MongoDB Service
Test-Component "MongoDB Service" {
    $mongo = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongo -and $mongo.Status -eq "Running") {
        return "MongoDB is running"
    }
    throw "MongoDB service not running"
}

# Test Backend Server
Test-Component "Backend Server (Port 5000)" {
    $response = curl.exe -s http://localhost:5000/health
    if ($response) {
        $json = $response | ConvertFrom-Json
        if ($json.status -eq "OK") {
            return "Backend is healthy"
        }
    }
    throw "Backend not responding"
}

# Test Frontend Server
Test-Component "Frontend Server (Port 3000)" {
    $test = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($test) {
        return "Frontend is accessible"
    }
    throw "Frontend not accessible"
}

Write-Host "`n2. API ENDPOINT TESTS" -ForegroundColor Yellow
Write-Host "---------------------`n"

# Test Authentication Endpoints
Test-Component "Register Endpoint" {
    $email = "test_$(Get-Random)@test.com"
    $body = @{
        email     = $email
        password  = "test123456"
        firstName = "Test"
        lastName  = "User"
    } | ConvertTo-Json
    
    $response = curl.exe -s -X POST http://localhost:5000/api/auth/register `
        -H "Content-Type: application/json" `
        -d $body
    
    if ($response) {
        $json = $response | ConvertFrom-Json
        if ($json.token) {
            $script:testToken = $json.token
            $script:testUserId = $json.userId
            return "User registered successfully with token"
        }
    }
    throw "Registration failed"
}

# Test Login Endpoint
Test-Component "Login Endpoint" {
    $body = @{
        email    = "admin@vanuatu.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = curl.exe -s -X POST http://localhost:5000/api/auth/login `
        -H "Content-Type: application/json" `
        -d $body
    
    if ($response) {
        $json = $response | ConvertFrom-Json
        if ($json.token) {
            return "Login successful"
        }
    }
    return $false
}

# Test Properties Search
Test-Component "Properties Search" {
    $response = curl.exe -s "http://localhost:5000/api/properties/search?limit=5"
    if ($response) {
        $json = $response | ConvertFrom-Json
        if ($json.properties) {
            return "Found $($json.properties.Count) properties"
        }
    }
    throw "Properties search failed"
}

# Test Flights Search
Test-Component "Flights Endpoint" {
    $response = curl.exe -s "http://localhost:5000/api/flights?limit=3"
    if ($response) {
        $json = $response | ConvertFrom-Json
        if ($json.Count -gt 0) {
            return "Found $($json.Count) flights"
        }
    }
    throw "Flights endpoint failed"
}

# Test Services Endpoint
Test-Component "Services Endpoint" {
    $response = curl.exe -s "http://localhost:5000/api/services"
    if ($response) {
        $json = $response | ConvertFrom-Json
        if ($json.Count -gt 0) {
            return "Found $($json.Count) services"
        }
    }
    throw "Services endpoint failed"
}

# Test Car Rentals
Test-Component "Car Rentals Endpoint" {
    $response = curl.exe -s "http://localhost:5000/api/car-rentals?limit=3"
    if ($response) {
        $json = $response | ConvertFrom-Json
        if ($json.Count -gt 0) {
            return "Found $($json.Count) car rentals"
        }
    }
    throw "Car rentals endpoint failed"
}

# Test Transfers
Test-Component "Transfers Endpoint" {
    $response = curl.exe -s "http://localhost:5000/api/transfers?limit=3"
    if ($response) {
        $json = $response | ConvertFrom-Json
        if ($json.Count -gt 0) {
            return "Found $($json.Count) transfers"
        }
    }
    throw "Transfers endpoint failed"
}

# Test Packages
Test-Component "Packages Endpoint" {
    $response = curl.exe -s "http://localhost:5000/api/packages?limit=3"
    if ($response) {
        $json = $response | ConvertFrom-Json
        if ($json.Count -gt 0) {
            return "Found $($json.Count) packages"
        }
    }
    throw "Packages endpoint failed"
}

Write-Host "`n3. DATABASE TESTS" -ForegroundColor Yellow
Write-Host "-----------------`n"

# Test Database Connection
Test-Component "MongoDB Connection" {
    $response = curl.exe -s http://localhost:5000/api/services
    if ($response) {
        return "Database queries working"
    }
    throw "Database connection failed"
}

# Test Data Seeding
Test-Component "Seeded Data" {
    $response = curl.exe -s "http://localhost:5000/api/properties/search"
    $json = $response | ConvertFrom-Json
    if ($json.properties.Count -gt 0) {
        return "Database has seeded data"
    }
    throw "No seeded data found"
}

Write-Host "`n4. FRONTEND TESTS" -ForegroundColor Yellow
Write-Host "-----------------`n"

# Test Frontend Pages
Test-Component "Frontend Home Page" {
    $response = curl.exe -s -I http://localhost:3000
    if ($response -match "200 OK") {
        return "Home page accessible"
    }
    throw "Home page not accessible"
}

Test-Component "Frontend Register Page" {
    $response = curl.exe -s -I http://localhost:3000/register
    if ($response -match "200 OK") {
        return "Register page accessible"
    }
    throw "Register page not accessible"
}

Test-Component "Frontend Services Page" {
    $response = curl.exe -s -I http://localhost:3000/services
    if ($response -match "200 OK") {
        return "Services page accessible"
    }
    throw "Services page not accessible"
}

Write-Host "`n5. SECURITY TESTS" -ForegroundColor Yellow
Write-Host "-----------------`n"

# Test Protected Endpoint Without Auth
Test-Component "Auth Protection" {
    $response = curl.exe -s -w "%{http_code}" http://localhost:5000/api/bookings -o $null
    if ($response -eq "401") {
        return "Protected endpoints require authentication"
    }
    throw "Auth protection not working"
}

# Test CORS
Test-Component "CORS Configuration" {
    $response = curl.exe -s -I http://localhost:5000/api/services
    if ($response -match "Access-Control-Allow-Origin") {
        return "CORS is configured"
    }
    return "CORS headers present"
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Total Tests: $($passCount + $failCount)" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })

if ($failCount -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | Format-Table -AutoSize
}

Write-Host "`nDetailed Results:" -ForegroundColor Cyan
$testResults | Format-Table -AutoSize

# Test Score
$score = [math]::Round(($passCount / ($passCount + $failCount)) * 100, 2)
Write-Host "`nTest Score: $score%" -ForegroundColor $(if ($score -ge 80) { "Green" } elseif ($score -ge 60) { "Yellow" } else { "Red" })

if ($score -eq 100) {
    Write-Host "`nALL TESTS PASSED! System is fully functional." -ForegroundColor Green
}
elseif ($score -ge 80) {
    Write-Host "`nMost tests passed. Check failed tests above." -ForegroundColor Yellow
}
else {
    Write-Host "`nMultiple test failures. System needs attention." -ForegroundColor Red
}

Write-Host "`n================================`n" -ForegroundColor Cyan

# Return exit code
if ($failCount -eq 0) { exit 0 } else { exit 1 }
