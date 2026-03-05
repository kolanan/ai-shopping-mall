$env:JAVA_HOME = "D:\Users\admin\.jdks\openjdk-21.0.1"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

$workDir = (Get-Location).Path
if ($workDir.StartsWith("\\?\")) {
    $workDir = $workDir.Substring(4)
    Set-Location -LiteralPath $workDir
}

if (-not (Test-Path ".\mvnw.cmd")) {
    Write-Error "Missing mvnw.cmd. The Maven wrapper files were not fully bootstrapped."
    exit 1
}

& .\mvnw.cmd spring-boot:run
