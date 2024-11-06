#!/bin/bash

case "$1" in
  "init")
    make init
    ;;
  "setup")
    make setup
    ;;
  *)
    echo "Usage: ./scripts/run.sh [init|setup]"
    exit 1
    ;;
esac 