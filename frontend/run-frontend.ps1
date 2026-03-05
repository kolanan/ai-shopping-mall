if (-not (Test-Path ".\node_modules")) {
    npm install --cache .npm-cache
}

npm run dev -- --host 0.0.0.0
