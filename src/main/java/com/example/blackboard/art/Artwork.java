package com.example.blackboard.art;

import java.time.Instant;

public record Artwork(Long id, String name, String imageDataUrl, Instant createdAt) {}
