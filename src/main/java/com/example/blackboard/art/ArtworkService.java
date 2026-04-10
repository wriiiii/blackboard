package com.example.blackboard.art;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class ArtworkService {
  private final AtomicLong idGenerator = new AtomicLong(1L);
  private final CopyOnWriteArrayList<Artwork> artworks = new CopyOnWriteArrayList<>();

  public Artwork save(String name, String imageDataUrl) {
    Artwork artwork =
        new Artwork(idGenerator.getAndIncrement(), name.trim(), imageDataUrl, Instant.now());
    artworks.add(artwork);
    return artwork;
  }

  public List<Artwork> listAll() {
    List<Artwork> sorted = new ArrayList<>(artworks);
    sorted.sort(Comparator.comparing(Artwork::createdAt).reversed());
    return sorted;
  }
}
