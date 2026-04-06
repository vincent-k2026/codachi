# VHS tape file for recording codachi demo
# Install: https://github.com/charmbracelet/vhs
# Usage: vhs scripts/demo.tape

Output codachi.gif

Set Shell bash
Set FontSize 14
Set Width 1200
Set Height 400
Set Padding 20
Set Theme "Monokai"

Type "node dist/index.js demo"
Enter
Sleep 30s
