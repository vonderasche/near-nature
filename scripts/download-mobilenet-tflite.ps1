# Download MobileNet v2 (224, quantized) + ImageNet labels for frame-processor testing.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$dir = Join-Path $Root "assets\tflite"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$modelUrl = "https://github.com/tensorflow/tflite-support/raw/master/tensorflow_lite_support/metadata/python/tests/testdata/mobilenet_v2_1.0_224_quant.tflite"
$modelPath = Join-Path $dir "mobilenet_v2_224_quant.tflite"
$labelsUrl = "https://storage.googleapis.com/download.tensorflow.org/data/ImageNetLabels.txt"
$labelsTxt = Join-Path $dir "imagenet_labels.txt"
$labelsJson = Join-Path $dir "imagenet_labels.json"

Write-Host "Downloading MobileNet model..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $modelUrl -OutFile $modelPath -UseBasicParsing

Write-Host "Downloading ImageNet labels..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $labelsUrl -OutFile $labelsTxt -UseBasicParsing

$lines = Get-Content $labelsTxt | Where-Object { $_.Trim().Length -gt 0 }
$lines | ConvertTo-Json -Compress | Set-Content -Encoding utf8 $labelsJson

Write-Host "Done:" -ForegroundColor Green
Write-Host "  $modelPath"
Write-Host "  $labelsJson"
