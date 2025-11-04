Set ws = WScript.CreateObject("WScript.Shell")

' 检查 strikkeyflag 环境变量的状态
If ws.ExpandEnvironmentStrings("%strikkeyflag%") = "on" Then
    ' 如果是打开状态，则关闭
    WScript.Echo "Screen Never Lockout off"
    ws.Environment("user").Item("strikkeyflag") = "off"
    
    ' 终止所有 WScript.exe 进程
    Set mi = GetObject("winmgmts:win32_process").Instances_
    For Each p In mi
        If UCase(p.Name) = UCase("wscript.exe") Then
            p.Terminate
        End If
    Next
    WScript.Quit
Else
    ' 如果是关闭状态，则打开
    WScript.Echo "Screen Never Lockout on"
    ws.Environment("user").Item("strikkeyflag") = "on"
    
    Do
        Set WshShell = CreateObject("WScript.Shell")
        WshShell.SendKeys "{ScrollLock}"
        WScript.Sleep 280000 ' 休眠 280 秒
    Loop
End If
