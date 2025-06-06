package com.mattcif.carpartsmanager_backend.controller;

import com.mattcif.carpartsmanager_backend.model.PecaCarro;
import com.mattcif.carpartsmanager_backend.repository.PecaCarroRepository;
import com.mattcif.carpartsmanager_backend.service.PecaCarroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pecas")
public class PecaCarroController {

    @Autowired
    private PecaCarroService pecaCarroService;
    @Autowired
    private PecaCarroRepository pecaCarroRepository;

    @PostMapping
    public ResponseEntity<PecaCarro> criar(@RequestBody PecaCarro peca) {
        return ResponseEntity.ok(pecaCarroService.salvar(peca));
    }

    @GetMapping
    public ResponseEntity<List<PecaCarro>> listar() {
        return ResponseEntity.ok(pecaCarroService.listarTodas());
    }


    @PutMapping("/{id}")
    public ResponseEntity<PecaCarro> atualizar(@PathVariable Long id, @RequestBody PecaCarro peca) {
        if (!pecaCarroRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        peca.setId(id);
        PecaCarro atualizada = pecaCarroService.salvar(peca);
        return ResponseEntity.ok(atualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!pecaCarroRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        pecaCarroService.deletar(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/exportar")
    public ResponseEntity<String> exportarCsvComFiltros(
            @RequestParam(required = false) String fabricante,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String veiculo,
            @RequestParam(required = false) BigDecimal precoMin,
            @RequestParam(required = false) BigDecimal precoMax,
            @RequestParam(required = false) String codigo)
    {

        try {
            String caminhoArquivo = pecaCarroService.exportarParaCsv(fabricante, categoria, veiculo, precoMin, precoMax, codigo);
            return ResponseEntity.ok("Arquivo exportado para: " + caminhoArquivo);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erro ao exportar: " + e.getMessage());
        }
    }

    @GetMapping("/estatisticas/categorias")
    public ResponseEntity<List<Map<String, Object>>> contarPorCategoria() {
        List<Object[]> resultados = pecaCarroRepository.contarPorCategoria();

        List<Map<String, Object>> resposta = resultados.stream()
                .map(obj -> Map.of("categoria", obj[0], "quantidade", obj[1]))
                .toList();

        return ResponseEntity.ok(resposta);
    }



}
