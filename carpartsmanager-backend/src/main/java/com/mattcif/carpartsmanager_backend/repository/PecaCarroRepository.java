package com.mattcif.carpartsmanager_backend.repository;


import com.mattcif.carpartsmanager_backend.model.PecaCarro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PecaCarroRepository extends JpaRepository<PecaCarro, Long> {
    @Query("SELECT p.categoria, COUNT(p) FROM PecaCarro p GROUP BY p.categoria")
    List<Object[]> contarPorCategoria();

}
