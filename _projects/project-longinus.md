---
title: project longinus
status: active
featured: true
article: true
description: experimental development and flight test campaign involving rockets, avionics, and propulsion. named after the spear of longinus from neon genesis evangelion.
external_url: ""
url_text: ""
date: 2024-12-01
---

# Project Longinus

Project Longinus is an experimental rocketry program focused on the design, testing, and deployment of modular rockets and supporting avionics systems.

## Rockets:
- Chroma Mk1: A robust, 54mm L2+ airframe designed for high-G flight testing and avionics validation.
- Chroma Mk1X: A stretched variant of Mk1, offering increased volume and thrust margin for testing advanced avionics.
- Chroma Mk2 / Mk2U: High-Mach, upper-atmosphere rockets.
- Chroma Mk0U: A 38mm upper-stage demonstrator to fly on Mk1.

## Untitled Flight Computer

RP2040-based avionics for high-power rocketry. Dual-redundant pyro channels, real-time lora telemetry downlink, 8-state flight detection with failure handling. Logs everything to sd card while streaming live telemetry over LoRa. Designed around the idea that you should know what your rocket is doing while it's happening, not just after you find it.