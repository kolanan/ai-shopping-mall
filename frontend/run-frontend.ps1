$workDir = (Get-Location).Path
if ($workDir.StartsWith("\\?\")) {
    $workDir = $workDir.Substring(4)
    Set-Location -LiteralPath $workDir
}

if (-not (Test-Path ".\node_modules")) {
    npm install --cache .npm-cache
}

npm run dev -- --host 0.0.0.0
