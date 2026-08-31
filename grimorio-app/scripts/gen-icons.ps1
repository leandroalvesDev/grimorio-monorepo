param(
  [string]$Source = "C:\Users\Administrator\Desktop\Grimorio\Grimório-Logo.png",
  [string]$OutDir = "C:\Users\Administrator\Desktop\Grimorio\public"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $Source)) {
  Write-Error "Logo n�o encontrado: $Source"
  exit 1
}

$src = [System.Drawing.Bitmap]::FromFile($Source)
$sw = [double]$src.Width
$sh = [double]$src.Height

function New-Icon($size, [bool]$maskable, [string]$out) {
  $canvas = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

  if ($maskable) {
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml("#09090b"))
  }

  $scale = if ($maskable) { 0.6 * ([Math]::Min($size / $sw, $size / $sh)) } else { [Math]::Min($size / $sw, $size / $sh) }
  $dw = [int][Math]::Round($sw * $scale)
  $dh = [int][Math]::Round($sh * $scale)
  $dx = [int](($size - $dw) / 2)
  $dy = [int](($size - $dh) / 2)

  $dst = New-Object System.Drawing.Rectangle($dx, $dy, $dw, $dh)
  $g.DrawImage($src, $dst, 0, 0, $sw, $sh, [System.Drawing.GraphicsUnit]::Pixel)
  $canvas.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose()
  $canvas.Dispose()
  Write-Output "OK $out (${size}x${size})"
}

New-Icon 192  $false (Join-Path $OutDir "manifest-icon-192.png")
New-Icon 512  $false (Join-Path $OutDir "manifest-icon-512.png")
New-Icon 180  $false (Join-Path $OutDir "apple-touch-icon.png")
New-Icon 512  $true  (Join-Path $OutDir "maskable-icon-512.png")

$src.Dispose()