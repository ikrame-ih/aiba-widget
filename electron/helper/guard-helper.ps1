param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("apply", "remove")]
  [string]$Action,
  [string]$Sites = "",
  [Parameter(Mandatory = $true)]
  [string]$StatusPath
)

$ErrorActionPreference = "Stop"
$markerStart = "# AIBA-GUARD-START"
$markerEnd = "# AIBA-GUARD-END"

function Write-GuardStatus {
  param(
    [bool]$Success,
    [bool]$Active,
    [string[]]$AppliedSites,
    [string]$Message
  )

  @{
    success = $Success
    active = $Active
    sites = $AppliedSites
    message = $Message
  } | ConvertTo-Json -Compress | Set-Content -Path $StatusPath -Encoding UTF8
}

function Test-Administrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Administrator)) {
  try {
    $arguments = @(
      "-NoProfile",
      "-ExecutionPolicy", "Bypass",
      "-File", "`"$PSCommandPath`"",
      "-Action", $Action,
      "-Sites", "`"$Sites`"",
      "-StatusPath", "`"$StatusPath`""
    )
    $process = Start-Process -FilePath "powershell.exe" -ArgumentList $arguments -Verb RunAs -Wait -PassThru
    exit $process.ExitCode
  }
  catch {
    Write-GuardStatus -Success $false -Active $false -AppliedSites @() -Message "Administrator approval was declined. No sites were changed."
    exit 1
  }
}

try {
  $hostsPath = Join-Path $env:SystemRoot "System32\drivers\etc\hosts"
  $content = [IO.File]::ReadAllText($hostsPath)
  $markerPattern = [regex]::Escape($markerStart) + "(?s).*?" + [regex]::Escape($markerEnd) + "\r?\n?"
  $cleanContent = [regex]::Replace($content, $markerPattern, "").TrimEnd()
  $domains = @()

  if ($Action -eq "apply") {
    $domainPattern = "^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$"
    $domains = $Sites.Split(",") |
      ForEach-Object { $_.Trim().ToLower().Replace("www.", "") } |
      Where-Object { $_ -match $domainPattern } |
      Select-Object -Unique -First 40

    if ($domains.Count -eq 0) {
      throw "No valid domains were supplied."
    }

    $lines = @($markerStart)
    foreach ($domain in $domains) {
      $lines += "0.0.0.0 $domain"
      $lines += "0.0.0.0 www.$domain"
    }
    $lines += $markerEnd
    $cleanContent += "`r`n`r`n" + ($lines -join "`r`n") + "`r`n"
  }
  else {
    $cleanContent += "`r`n"
  }

  $tempPath = Join-Path $env:TEMP ("aiba-hosts-" + [guid]::NewGuid().ToString("N"))
  [IO.File]::WriteAllText($tempPath, $cleanContent, [Text.Encoding]::ASCII)
  Copy-Item -Path $tempPath -Destination $hostsPath -Force
  Remove-Item -Path $tempPath -Force
  ipconfig /flushdns | Out-Null

  if ($Action -eq "apply") {
    Write-GuardStatus -Success $true -Active $true -AppliedSites $domains -Message "$($domains.Count) sites are blocked until this focus block ends."
  }
  else {
    Write-GuardStatus -Success $true -Active $false -AppliedSites @() -Message "Aiba's site block was removed."
  }
}
catch {
  Write-GuardStatus -Success $false -Active $false -AppliedSites @() -Message $_.Exception.Message
  exit 1
}
