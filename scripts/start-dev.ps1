$env:Path = "C:\Program Files\nodejs;" + $env:Path
$env:npm_config_cache = "c:\Users\issou\Desktop\myhousepplans.com\.npm-cache"
Set-Location "c:\Users\issou\Desktop\myhousepplans.com"
& "C:\Program Files\nodejs\npm.cmd" run dev -- --hostname 127.0.0.1 --port 3000
