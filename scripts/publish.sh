#!/bin/bash
# 发布脚本
echo "Publishing package..."
pnpm build
pnpm test
pnpm release
pnpm publish 