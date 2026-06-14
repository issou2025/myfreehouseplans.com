$env:Path = "C:\Program Files\nodejs;" + $env:Path
Set-Location "c:\Users\issou\Desktop\myhousepplans.com"
& "C:\Program Files\nodejs\npm.cmd" run dev -- -p 3000
